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

export abstract class ServiceUnitPage {

  public static readonly component = $(`app-petals-service-unit-view`);

  public readonly component = ServiceUnitPage.component;
  public readonly title = this.component.$(`md-toolbar-row .title`);

  protected static wait() {
    browser.wait(urlToMatch(/\/workspaces\/\w+\/petals\/service-units\/\w+/), waitTimeout);
    browser.wait(EC.visibilityOf(ServiceUnitPage.component), waitTimeout);
  }
}

export class ServiceUnitOverviewPage extends ServiceUnitPage {

  public static readonly overview = ServiceUnitPage.component.$(`app-petals-service-unit-overview`);

  public readonly overview = ServiceUnitOverviewPage.overview;
  public readonly state = this.overview.$(`md-card.state md-card-title`);
  public readonly stopButton = this.overview.element(by.cssContainingText(`button`, `Stop`));
  public readonly startButton = this.overview.element(by.cssContainingText(`button`, `Start`));
  public readonly unloadButton = this.overview.element(by.cssContainingText(`button`, `Unload`));

  static waitAndGet() {
    super.wait();
    browser.wait(EC.visibilityOf(ServiceUnitOverviewPage.overview), waitTimeout);
    return new ServiceUnitOverviewPage();
  }

  private constructor() {
    super();
  }
}

export class ServiceUnitOperationPage extends ServiceUnitPage {

  public static readonly operations = ServiceUnitPage.component.$(`app-petals-service-unit-operations`);

  public readonly operations = ServiceUnitOperationPage.operations;

  static waitAndGet() {
    super.wait();
    browser.wait(EC.visibilityOf(ServiceUnitOperationPage.operations), waitTimeout);
    return new ServiceUnitOperationPage();
  }

  private constructor() {
    super();
  }
}
