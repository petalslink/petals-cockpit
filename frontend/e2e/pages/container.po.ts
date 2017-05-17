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

export abstract class ContainerPage {

  public static readonly component = $(`app-petals-container-view`);

  public readonly component = ContainerPage.component;
  public readonly title = this.component.$(`md-toolbar-row .title`);

  protected static wait() {
    browser.wait(urlToMatch(/\/workspaces\/\w+\/petals\/containers\/\w+/), waitTimeout);
    browser.wait(EC.visibilityOf(ContainerPage.component), waitTimeout);
  }

  openOperations() {
    this.component.element(by.cssContainingText(`md-tab-header .mat-tab-label`, 'Operations')).click();
    return ContainerOperationPage.waitAndGet();
  }
}

export class ContainerOverviewPage extends ContainerPage {

  public static readonly overview = ContainerPage.component.$(`app-petals-container-overview`);

  public readonly overview = ContainerOverviewPage.overview;

  public readonly ip = this.overview.$(`md-card.ip md-card-title`);
  public readonly port = this.overview.$(`md-card.port md-card-title`);
  public readonly reachabilities = this.overview.$$(`md-card.reachability md-card-title`);
  public readonly systemInfo = this.overview.$(`md-card.system-info`);

  static waitAndGet() {
    super.wait();
    browser.wait(EC.visibilityOf(ContainerOverviewPage.overview), waitTimeout);
    return new ContainerOverviewPage();
  }

  private constructor() {
    super();
  }

  openReachability(index: number) {
    this.reachabilities.get(0).click();
    return ContainerOverviewPage.waitAndGet();
  }
}

export class ContainerOperationPage extends ContainerPage {

  public static readonly operations = ContainerPage.component.$(`app-petals-container-operations`);

  public readonly operations = ContainerOperationPage.operations;

  public readonly deployCard = this.operations.$(`.deploy`);
  public readonly fileInput = this.deployCard.$(`input[type="file"]`);
  public readonly deployButton = this.deployCard.$(`form button[type="submit"]`);
  public readonly chooseFileButton = $(`app-petals-container-operations .deploy .choose-file`);
  public readonly selectedFile = $(`app-petals-container-operations .deploy .selected-file .file-name`);
  public readonly errorDetailsTitle = $(`app-petals-container-operations .deploy .error-deploy .title`);
  public readonly errorDetailsMessage = $(`app-petals-container-operations .deploy .error-deploy .message`);

  static waitAndGet() {
    super.wait();
    browser.wait(EC.visibilityOf(ContainerOperationPage.operations), waitTimeout);
    return new ContainerOperationPage();
  }

  private constructor() {
    super();
  }
}
