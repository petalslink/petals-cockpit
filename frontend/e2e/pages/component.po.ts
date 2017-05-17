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

import { urlToMatch } from '../utils';
import { waitTimeout } from '../common';

export abstract class ComponentPage {

  public static readonly component = $(`app-petals-component-view`);

  public readonly component = ComponentPage.component;
  public readonly title = this.component.$(`md-toolbar-row .title`);
  public readonly state = this.component.$(`md-card.state md-card-title`);
  public readonly type = this.component.$(`md-card.type md-card-title`);

  protected static wait() {
    browser.wait(urlToMatch(/\/workspaces\/\w+\/petals\/components\/\w+/), waitTimeout);
    browser.wait(EC.visibilityOf(ComponentPage.component), waitTimeout);
  }

  openOperations() {
    this.component.element(by.cssContainingText(`md-tab-header .mat-tab-label`, 'Operations')).click();
    return ComponentOperationPage.waitAndGet();
  }
}

export class ComponentOverviewPage extends ComponentPage {

  public static readonly overview = ComponentPage.component.$(`app-petals-component-overview`);

  public readonly overview = ComponentOverviewPage.overview;
  public readonly stopButton = this.overview.element(by.cssContainingText(`button`, `Stop`));
  public readonly startButton = this.overview.element(by.cssContainingText(`button`, `Start`));
  public readonly installButton = this.overview.element(by.cssContainingText(`button`, `Install`));
  public readonly uninstallButton = this.overview.element(by.cssContainingText(`button`, `Uninstall`));
  public readonly unloadButton = this.overview.element(by.cssContainingText(`button`, `Unload`));
  public readonly changeStateError = this.overview.$(`md-card.state .error .italic`);
  public readonly parameters = this.overview.$(`.parameters`);

  static waitAndGet() {
    super.wait();
    browser.wait(EC.visibilityOf(ComponentOverviewPage.overview), waitTimeout);
    return new ComponentOverviewPage();
  }

  private constructor() {
    super();
  }

  parameter(name: string) {
    return this.parameters.$(`input[placeholder="${name}"]`);
  }
}

export class ComponentOperationPage extends ComponentPage {

  public static readonly operations = ComponentPage.component.$(`app-petals-component-operations`);

  public readonly operations = ComponentOperationPage.operations;

  public readonly deployCard = this.operations.$(`.deploy`);
  public readonly chooseFileButton = this.deployCard.$(`.choose-file`);
  public readonly fileInput = this.deployCard.$(`input[type="file"]`);
  public readonly selectedFile = this.deployCard.$(`.selected-file .file-name`);
  public readonly changeSuNameInput = this.deployCard.$(`form input[name="serviceUnitName"]`);
  public readonly deployButton = this.deployCard.$(`form button[type="submit"]`);
  public readonly errorDetailsTitle = this.deployCard.$(`.error-deploy .title`);
  public readonly errorDetailsMessage = this.deployCard.$(`.error-deploy .message`);

  static waitAndGet() {
    super.wait();
    browser.wait(EC.visibilityOf(ComponentOperationPage.operations), waitTimeout);
    return new ComponentOperationPage();
  }

  private constructor() {
    super();
  }
}