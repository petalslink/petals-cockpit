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

import { $, browser, by, ExpectedConditions as EC } from 'protractor';

import { waitTimeout } from '../common';
import { urlToMatch, waitAndClick } from '../utils';
import { ComponentOverviewPage } from './component.po';
import { ServiceUnitOverviewPage } from './service-unit.po';

export abstract class ServiceAssemblyPage {
  public static readonly component = $(`app-petals-service-assembly-view`);

  public readonly component = ServiceAssemblyPage.component;
  public readonly title = this.component.$(`md-toolbar .title`);
  public readonly hasBeenDeletedMessage = this.component.$(
    'app-workspace-element .message'
  );

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
  public readonly serviceUnits = this.overview
    .$(`.service-units`)
    .$$('.su-name,.component-name');

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
    waitAndClick(
      this.component.element(
        by.cssContainingText(`md-tab-header .mat-tab-label`, 'Operations')
      )
    );
    return ServiceAssemblyOperationPage.waitAndGet();
  }

  openServiceUnit(identifier: string | number) {
    const css = `.service-units a.service-unit`;
    const e =
      typeof identifier === 'string'
        ? this.overview.element(by.cssContainingText(css, identifier))
        : this.overview.$$(css).get(identifier);
    waitAndClick(e);
    return ServiceUnitOverviewPage.waitAndGet();
  }

  openComponent(identifier: string | number) {
    const css = `.service-units a.su-component`;
    const e =
      typeof identifier === 'string'
        ? this.overview.element(by.cssContainingText(css, identifier))
        : this.overview.$$(css).get(identifier);
    waitAndClick(e);
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
