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
import { ServiceUnitOverviewPage } from './service-unit.po';
import { ComponentOverviewPage } from './component.po';

export abstract class ServiceAssemblyPage {
  public static readonly component = $(`app-petals-service-assembly-view`);

  public readonly component = ServiceAssemblyPage.component;
  public readonly title = this.component.$(`md-toolbar .title`);

  protected static wait() {
    browser.wait(
      urlToMatch(/\/workspaces\/\w+\/petals\/service-assemblies\/\w+/),
      waitTimeout
    );
    browser.wait(EC.visibilityOf(ServiceAssemblyPage.component), waitTimeout);
    browser.wait(
      EC.stalenessOf(ServiceAssemblyPage.component.$('md-toolbar md-spinner')),
      waitTimeout
    );
  }
}

export class ServiceAssemblyOverviewPage extends ServiceAssemblyPage {
  public static readonly overview = ServiceAssemblyPage.component.$(
    `app-petals-service-assembly-overview`
  );

  public readonly overview = ServiceAssemblyOverviewPage.overview;
  public readonly state = this.overview.$(`.sa-infos .sa-state`);
  public readonly serviceUnits = this.overview.$$(
    `.service-units a.service-unit .su-name`
  );
  public readonly suComponents = this.overview.$$(
    `.service-units a.su-component .su-component-name`
  );

  static waitAndGet() {
    super.wait();
    browser.wait(
      EC.visibilityOf(ServiceAssemblyOverviewPage.overview),
      waitTimeout
    );
    return new ServiceAssemblyOverviewPage();
  }

  private constructor() {
    super();
  }

  openOperations() {
    this.component
      .element(
        by.cssContainingText(`md-tab-header .mat-tab-label`, 'Operations')
      )
      .click();
    return ServiceAssemblyOperationPage.waitAndGet();
  }

  openServiceUnit(identifier: string | number) {
    if (typeof identifier === 'string') {
      this.overview
        .element(
          by.cssContainingText(`.service-units a.service-unit`, identifier)
        )
        .click();
    } else {
      this.serviceUnits.get(identifier).click();
    }
    return ServiceUnitOverviewPage.waitAndGet();
  }

  openComponent(identifier: string | number) {
    if (typeof identifier === 'string') {
      this.overview
        .element(
          by.cssContainingText(`.service-units a.su-component`, identifier)
        )
        .click();
    } else {
      this.suComponents.get(identifier).click();
    }
    return ComponentOverviewPage.waitAndGet();
  }
}

export class ServiceAssemblyOperationPage extends ServiceAssemblyPage {
  public static readonly operations = ServiceAssemblyPage.component.$(
    `app-petals-service-assembly-operations`
  );

  public readonly operations = ServiceAssemblyOperationPage.operations;

  public readonly lifecycleCard = this.operations.$(`.sa-lifecycle`);

  public readonly state = this.lifecycleCard.$(`span.service-assembly-state`);
  public readonly stopButton = this.lifecycleCard.element(
    by.cssContainingText(`button`, `Stop`)
  );
  public readonly startButton = this.lifecycleCard.element(
    by.cssContainingText(`button`, `Start`)
  );
  public readonly unloadButton = this.lifecycleCard.element(
    by.cssContainingText(`button`, `Unload`)
  );

  static waitAndGet() {
    super.wait();
    browser.wait(
      EC.visibilityOf(ServiceAssemblyOperationPage.operations),
      waitTimeout
    );
    return new ServiceAssemblyOperationPage();
  }

  private constructor() {
    super();
  }
}
