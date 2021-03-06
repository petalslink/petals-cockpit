/**
 * Copyright (C) 2017-2020 Linagora
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { $, $$, browser, by, ExpectedConditions as EC } from 'protractor';

import { waitTimeout } from '../common';
import { getMultipleElementsTexts, urlToMatch, waitAndClick } from '../utils';
import { BusPage } from './bus.po';
import { ComponentOverviewPage } from './component.po';
import { ContainerOverviewPage } from './container.po';
import { MessageComponentPage } from './message-component.po';
import { ServiceAssemblyOverviewPage } from './service-assembly.po';
import { ServiceUnitOverviewPage } from './service-unit.po';
import { SharedLibraryOverviewPage } from './shared-library.po';

export abstract class WorkspacePage {
  public static readonly component = $(`app-workspace`);
  public static readonly sidenav = WorkspacePage.component.$('mat-sidenav');

  public readonly component = WorkspacePage.component;
  public readonly sidenav = WorkspacePage.sidenav;
  public readonly addBusButton = this.sidenav.$(`a.btn-add-bus`);
  public readonly searchBar = this.sidenav.$(`input.search`);
  public readonly busesInProgress = this.sidenav.$$(
    `app-buses-in-progress mat-nav-list a`
  );

  static waitAndGet() {
    browser.wait(urlToMatch(/\/workspaces\/\w+$/), waitTimeout);

    browser.wait(EC.visibilityOf(this.component), waitTimeout);
    browser.wait(EC.visibilityOf(WorkspacePage.sidenav), waitTimeout);
    browser.wait(
      EC.stalenessOf(this.component.$('mat-toolbar mat-spinner')),
      waitTimeout
    );
  }

  treeElement(identifier: string | number, type: string) {
    if (typeof identifier === 'string') {
      return this.sidenav.element(
        by.cssContainingText(
          `app-material-tree a.workspace-element-type-${type} span`,
          identifier
        )
      );
    } else {
      return this.sidenav
        .$$(`app-material-tree mat-nav-list a.workspace-element-type-${type}`)
        .get(identifier);
    }
  }

  treeElementFolder(identifier: string | number, type: string) {
    return this.treeElement(identifier, type).element(
      by.cssContainingText('mat-icon', 'arrow_drop_down')
    );
  }

  openBus(identifier: string | number) {
    this.treeElement(identifier, 'bus').click();
    return BusPage.waitAndGet();
  }

  openComponent(identifier: string | number) {
    this.treeElement(identifier, 'component').click();
    return ComponentOverviewPage.waitAndGet();
  }

  openContainer(identifier: string | number) {
    this.treeElement(identifier, 'container').click();
    return ContainerOverviewPage.waitAndGet();
  }

  openServiceAssembly(identifier: string | number) {
    this.treeElement(identifier, 'service-assembly').click();
    return ServiceAssemblyOverviewPage.waitAndGet();
  }

  openServiceUnit(identifier: string | number) {
    this.treeElement(identifier, 'service-unit').click();
    return ServiceUnitOverviewPage.waitAndGet();
  }

  openSharedLibrary(identifier: string | number) {
    this.treeElement(identifier, 'shared-library').click();
    return SharedLibraryOverviewPage.waitAndGet();
  }

  search(search: string) {
    this.searchBar.clear();
    this.searchBar.sendKeys(search);
  }

  getSearchMessage() {
    return MessageComponentPage.waitAndGet(WorkspacePage.sidenav);
  }

  getWorkspaceTree() {
    return (
      this.sidenav
        .$$('app-material-tree .mat-nav-list a .item-name')
        .getText()
        // getText on element.all is wrongly type, it should be a string[]
        .then((elements: any) => elements as string[])
    );
  }

  getHighlightedElement() {
    return (
      this.sidenav
        .$$('app-material-tree .mat-nav-list .highlight')
        .getText()
        // getText on element.all is wrongly type, it should be a string[]
        .then((elements: any) => elements as string[])
    );
  }
}

export class WorkspaceOverviewPage extends WorkspacePage {
  public readonly component = $(`app-workspace`);
  public readonly title = this.component.$(`mat-toolbar .title`);
  public readonly deleteButton = this.component.$(`.btn-delete-wks`);

  public readonly shortDescription = this.component.$(
    `mat-card-content.workspace-short-description > div.short-description > span`
  );
  public readonly description = this.component.$(
    `mat-card-content.workspace-description > div.description > span`
  );
  public readonly editShortDescriptionButton = this.component.$(
    `.mat-card-actions .btn-edit-short-description`
  );
  public readonly editDescriptionButton = this.component.$(
    `.mat-card-actions .btn-edit-description`
  );
  public readonly shortDescriptionArea = this.component.$(
    `.workspace-short-description-edit textarea`
  );
  public readonly descriptionArea = this.component.$(
    `.workspace-description-edit textarea`
  );
  public readonly descriptionPreview = this.component.$(
    `.workspace-description-edit > div > span.workspace-description-preview`
  );
  public readonly shortDescriptionCancel = this.component.$(
    `button.btn-cancel-short-description`
  );
  public readonly shortDescriptionSubmit = this.component.$(
    `button.btn-save-short-description`
  );
  public readonly descriptionCancel = this.component.$(
    `button.btn-cancel-description`
  );
  public readonly descriptionSubmit = this.component.$(
    `button.btn-save-description`
  );

  public readonly users = this.component.$(`.workspace-users`);
  public readonly usersList = this.users.$(`mat-list`);
  public readonly usersAutocompleteInput = this.component.$(
    `input[formcontrolname="userSearchCtrl"]`
  );
  // mat-option is not within .workspace-users
  // it's at the root of the HTML page
  public readonly usersAutocompleteList = $$(`mat-option`);
  public readonly btnAddUserToWks = this.component.element(
    by.cssContainingText(`button`, `Add`)
  );

  static waitAndGet() {
    return new WorkspaceOverviewPage();
  }

  private constructor() {
    super();
  }

  getInfoUserWorkspaceMessage() {
    return MessageComponentPage.waitAndGet(
      this.component,
      `info-user-workspace`
    );
  }

  getInfoUserWorkspaceSharedMessage() {
    return MessageComponentPage.waitAndGet(
      this.component,
      `info-user-workspace-shared`
    );
  }

  getUsers() {
    return getMultipleElementsTexts(this.usersList, '.user-id', '.user-name');
  }

  getUsersAutocomplete(): Promise<string[]> {
    this.usersAutocompleteInput.click();
    return this.usersAutocompleteList.getText() as any;
  }

  addUser(id: string) {
    this.usersAutocompleteInput.sendKeys(id);
    waitAndClick(this.btnAddUserToWks);
    browser.wait(
      EC.visibilityOf(
        this.usersList.element(by.cssContainingText('.user-id', id))
      ),
      waitTimeout
    );
  }
}
