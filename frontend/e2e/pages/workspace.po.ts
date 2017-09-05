/**
 * Copyright (C) 2017 Linagora
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
import {
  getMultipleElementsTexts,
  Matcher,
  textToMatchInElement,
  urlToMatch,
  waitAndClick,
} from '../utils';
import { BusPage } from './bus.po';
import { ComponentOverviewPage } from './component.po';
import { ContainerOverviewPage } from './container.po';
import { BusInProgressPage, ImportBusPage } from './import-bus.po';
import { ServiceAssemblyOverviewPage } from './service-assembly.po';
import { ServiceUnitOverviewPage } from './service-unit.po';
import { SharedLibraryOverviewPage } from './shared-library.po';
import { WorkspacesPage } from './workspaces.po';

export abstract class WorkspacePage {
  public static readonly component = $(`app-workspace`);
  public static readonly sidenav = WorkspacePage.component.$('md-sidenav');
  public static readonly workspaceButton = WorkspacePage.sidenav.$(
    'button.workspace-name'
  );

  public readonly component = WorkspacePage.component;
  public readonly sidenav = WorkspacePage.sidenav;
  public readonly addBusButton = this.sidenav.$(`a.btn-add-bus`);
  public readonly changeWorkspaceButton = this.sidenav.$(
    `button.change-workspace`
  );
  public readonly busesInProgress = this.sidenav.$$(
    `app-buses-in-progress md-nav-list a`
  );
  public readonly workspaceButton = WorkspacePage.workspaceButton;

  static wait(expectedName?: Matcher) {
    browser.wait(urlToMatch(/\/workspaces\/\w+$/), waitTimeout);

    browser.wait(EC.visibilityOf(this.component), waitTimeout);
    browser.wait(
      EC.visibilityOf(this.component.$(`md-sidenav.mat-sidenav-opened`)),
      waitTimeout
    );
    browser.wait(
      EC.stalenessOf(this.component.$('md-toolbar md-spinner')),
      waitTimeout
    );

    let test = EC.elementToBeClickable(this.workspaceButton);
    if (expectedName) {
      test = EC.and(
        test,
        textToMatchInElement(
          this.workspaceButton,
          typeof expectedName === 'string'
            ? expectedName.toUpperCase()
            : expectedName
        )
      );
    }

    browser.wait(test, waitTimeout);
  }

  openWorkspacesDialog() {
    waitAndClick(this.changeWorkspaceButton);
    return WorkspacesPage.waitAndGet(true);
  }

  openImportBus() {
    waitAndClick(this.addBusButton);
    return ImportBusPage.waitAndGet();
  }

  openBusInProgress(index: number) {
    waitAndClick(this.busesInProgress.get(index));
    return BusInProgressPage.waitAndGet();
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
        .$$(`app-material-tree md-nav-list a.workspace-element-type-${type}`)
        .get(identifier);
    }
  }

  treeElementFolder(identifier: string | number, type: string) {
    return this.treeElement(identifier, type).element(
      by.cssContainingText('md-icon', 'arrow_drop_down')
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
    const input = $(`input.search`);
    input.clear();
    input.sendKeys(search);
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
  public readonly title = this.component.$(`md-toolbar-row .title`);
  public readonly deleteButton = this.component.$(`.btn-delete-wks`);

  public readonly description = this.component.$(
    `md-card-content.workspace-description > span`
  );
  public readonly editButton = this.component.$(
    `.workspace-description button`
  );
  public readonly descriptionArea = this.component.$(
    `.workspace-description-edit textarea`
  );
  public readonly descriptionPreview = this.component.$(
    `.workspace-description-edit md-card-subtitle span.workspace-description-preview`
  );
  public readonly descriptionCancel = this.component.$(
    `button.workspace-description-edit-cancel`
  );
  public readonly descriptionSubmit = this.component.$(
    `button.workspace-description-edit-submit`
  );

  public readonly users = this.component.$(`.workspace-users`);
  public readonly usersList = this.users.$(`md-list`);
  public readonly usersAutocompleteInput = this.component.$(
    `input[formcontrolname="userSearchCtrl"]`
  );
  // md-option is not within .workspace-users
  // it's at the root of the HTML page
  public readonly usersAutocompleteList = $$(`md-option`);
  public readonly btnAddUserToWks = this.component.element(
    by.cssContainingText(`button`, `Add`)
  );

  static waitAndGet(expectedName?: Matcher) {
    super.wait(expectedName);

    return new WorkspaceOverviewPage();
  }

  private constructor() {
    super();
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
