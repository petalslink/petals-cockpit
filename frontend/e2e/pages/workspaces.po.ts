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

import { $, browser, ExpectedConditions as EC } from 'protractor';

import { waitTimeout } from '../common';
import { Matcher, urlToMatch, waitAndClick } from '../utils';
import { WorkspaceOverviewPage } from './workspace.po';

export class WorkspacesPage {
  public static readonly component = $(`app-workspaces-list`);

  public readonly component = WorkspacesPage.component;
  public readonly workspacesCard = this.component.$(`md-card.card-workspaces`);
  public readonly workspacesCards = this.workspacesCard.$$(
    'div.card-workspace'
  );

  public readonly inputName = this.component.$(`input[formControlName="name"]`);
  public readonly addButton = this.component.$(`.btn-add-workspace`);

  static waitAndGet(asDialog = false) {
    if (!asDialog) {
      browser.wait(urlToMatch(/\/workspaces$/), waitTimeout);
    }
    browser.wait(EC.visibilityOf(WorkspacesPage.component), waitTimeout);
    return new WorkspacesPage();
  }

  private constructor() {}

  selectWorkspace(index: number, expectedName?: Matcher) {
    waitAndClick(
      this.workspacesCard.$$('div.card-workspace md-card-title').get(index)
    );

    return WorkspaceOverviewPage.waitAndGet(expectedName);
  }
}
