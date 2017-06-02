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

import { browser, ExpectedConditions as EC, $, by } from 'protractor';

import { urlToMatch, Matcher, textToMatchInElement } from '../utils';
import { waitTimeout } from '../common';
import { ImportBusPage, BusInProgressPage } from './import-bus.po';
import { BusPage } from './bus.po';
import { ComponentOverviewPage } from './component.po';
import { ContainerOverviewPage } from './container.po';
import { ServiceUnitOverviewPage } from './service-unit.po';
import { WorkspacesPage } from './workspaces.po';
import { ServiceAssemblyOverviewPage } from './service-assembly.po';

export abstract class WorkspacePage {

  public static readonly component = $(`app-cockpit`);
  public static readonly sidenav = WorkspacePage.component.$('md-sidenav');
  public static readonly workspaceButton = WorkspacePage.sidenav.$('button.workspace-name');

  public readonly component = WorkspacePage.component;
  public readonly sidenav = WorkspacePage.sidenav;
  public readonly addBusButton = this.sidenav.$(`a.btn-add-bus`);
  public readonly changeWorkspaceButton = this.sidenav.$(`button.change-workspace`);
  public readonly busesInProgress = this.sidenav.$$(`app-buses-in-progress md-nav-list a`);

  static wait(expectedName?: Matcher) {
    browser.wait(urlToMatch(/\/workspaces\/\w+$/), waitTimeout);

    browser.wait(EC.visibilityOf(this.component), waitTimeout);
    browser.wait(EC.visibilityOf(this.component.$(`md-sidenav.mat-sidenav-opened`)), waitTimeout);

    let test = EC.elementToBeClickable(this.workspaceButton);
    if (expectedName) {
      test = EC.and(test, textToMatchInElement(this.workspaceButton, expectedName));
    }

    browser.wait(test, waitTimeout);
  }

  openWorkspacesDialog() {
    browser.wait(EC.elementToBeClickable(this.changeWorkspaceButton), waitTimeout);
    this.changeWorkspaceButton.click();
    return WorkspacesPage.waitAndGet(true);
  }

  openImportBus() {
    browser.wait(EC.elementToBeClickable(this.addBusButton), waitTimeout);
    this.addBusButton.click();
    return ImportBusPage.waitAndGet();
  }

  openBusInProgress(index: number) {
    this.busesInProgress.get(index).click();
    return BusInProgressPage.waitAndGet();
  }

  treeElement(identifier: string | number, type: string) {
    if (typeof identifier === 'string') {
      return this.sidenav.element(by.cssContainingText(`app-material-tree a.workspace-element-type-${type} span`, identifier));
    } else {
      return this.sidenav.$$(`app-material-tree md-nav-list a.workspace-element-type-${type}`).get(identifier);
    }
  }

  treeElementFolder(identifier: string | number, type: string) {
    return this.treeElement(identifier, type).$('md-icon[aria-label="arrow_drop_down"]');
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

  search(search: string) {
    const input = $(`input.search`);
    input.clear();
    input.sendKeys(search);
  }

  getWorkspaceTree() {
    return this.sidenav.$$('app-material-tree md-nav-list a div > span').getText()
      // getText on element.all is wrongly type, it should be a string[]
      .then((elements: any) => elements as string[]);
  }

  getHighlightedElement() {
    return this.sidenav.$$('app-material-tree md-nav-list .highlight').getText()
      // getText on element.all is wrongly type, it should be a string[]
      .then((elements: any) => elements as string[]);
  }
}

export class WorkspaceOverviewPage extends WorkspacePage {

  public readonly component = $(`app-workspace`);
  public readonly title = this.component.$(`md-toolbar-row .title`);
  public readonly deleteButton = this.component.$(`.btn-delete-wks`);

  public readonly description = this.component.$(`md-card-content.workspace-description > span`);
  public readonly editButton = this.component.$(`.workspace-description button`);
  public readonly descriptionArea = this.component.$(`.workspace-description-edit textarea`);
  public readonly descriptionPreview = this.component.$(`.workspace-description-edit md-card-subtitle span.workspace-description-preview`);
  public readonly descriptionCancel = this.component.$(`button.workspace-description-edit-cancel`);
  public readonly descriptionSubmit = this.component.$(`button.workspace-description-edit-submit`);

  public readonly users = $(`app-workspace .workspace-users`);

  static waitAndGet(expectedName?: Matcher) {
    super.wait();

    return new WorkspaceOverviewPage();
  }

  private constructor() {
    super();
  }
}
