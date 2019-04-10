/**
 * Copyright (C) 2017-2019 Linagora
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

import { $, browser, ExpectedConditions as EC } from 'protractor';

import { waitTimeout } from '../common';
import { urlToMatch, waitAndClick } from '../utils';
import { WorkspaceOverviewPage } from './workspace.po';

export class WorkspacesPage {
  public static readonly component = $(`app-workspaces`);
  public static readonly componentList = $(`app-workspaces-list`);
  public static readonly componentCreate = $(`app-workspaces-create`);

  public readonly component = WorkspacesPage.component;
  public readonly componentList = WorkspacesPage.componentList;
  public readonly componentCreate = WorkspacesPage.componentCreate;

  public readonly goToCreateWksButton = this.component.$(`.btn-create-wks`);
  public readonly goToWksListButton = this.component.$(`.btn-back-wks-list`);

  public readonly workspacesList = this.componentList.$(`.workspaces-list`);
  public readonly workspacesItem = this.workspacesList.$$('.workspaces-item');

  public readonly inputName = this.componentCreate.$(
    `input[formControlName="name"]`
  );
  public readonly textareaShortDescription = this.componentCreate.$(`textarea`);
  public readonly addButton = this.componentCreate.$(`.btn-add-workspace`);

  static waitAndGet(asCard = false) {
    if (!asCard) {
      browser.wait(urlToMatch(/\/workspaces\?page=list$/), waitTimeout);
    }
    browser.wait(EC.visibilityOf(WorkspacesPage.componentList), waitTimeout);
    return new WorkspacesPage();
  }

  private constructor() {}

  addWorkspace(name: string, shortDescription?: string) {
    // go to create workspace view first
    waitAndClick(this.goToCreateWksButton);

    // because of
    // https://github.com/angular/protractor/issues/3196
    // https://github.com/angular/protractor/issues/4280
    // https://github.com/angular/protractor/issues/698
    for (let i = 0; i < (name.length && shortDescription.length); i++) {
      this.inputName.sendKeys(name.charAt(i));
      this.textareaShortDescription.sendKeys(shortDescription.charAt(i));
    }
    waitAndClick(this.addButton);
  }

  selectWorkspace(index: number) {
    waitAndClick(this.workspacesList.$$('.workspaces-item').get(index));

    return WorkspaceOverviewPage.waitAndGet();
  }
}
