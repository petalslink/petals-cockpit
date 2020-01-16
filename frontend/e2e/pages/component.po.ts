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

import { $, browser, by, ExpectedConditions as EC } from 'protractor';

import { waitTimeout } from '../common';
import { urlToMatch, waitAndClick } from '../utils';
import { MessageComponentPage } from './message-component.po';
import { ServiceAssemblyOverviewPage } from './service-assembly.po';
import { ServiceUnitOverviewPage } from './service-unit.po';
import { SharedLibraryOverviewPage } from './shared-library.po';
import { ServiceUnitDeploymentPage } from './upload-component.po';

export abstract class ComponentPage {
  public static readonly component = $(`app-petals-component-view`);

  public readonly component = ComponentPage.component;
  public readonly title = this.component.$(`mat-toolbar .title`);
  public readonly hasBeenDeletedMessage = this.component.$(
    'app-workspace-element .message'
  );

  protected static wait() {
    browser.wait(
      urlToMatch(/\/workspaces\/\w+\/petals\/components\/\w+/),
      waitTimeout
    );
    browser.wait(EC.visibilityOf(ComponentPage.component), waitTimeout);
    browser.wait(
      EC.stalenessOf(ComponentPage.component.$('mat-toolbar mat-spinner')),
      waitTimeout
    );
  }

  openOperations() {
    waitAndClick(
      this.component.element(
        by.cssContainingText(`mat-tab-header .mat-tab-label`, 'Operations')
      )
    );
    return ComponentOperationPage.waitAndGet();
  }
}

export class ComponentOverviewPage extends ComponentPage {
  public static readonly overview = ComponentPage.component.$(
    `app-petals-component-overview`
  );

  public readonly overview = ComponentOverviewPage.overview;
  public readonly state = this.overview.$(
    `.card-component-infos .component-state`
  );
  public readonly type = this.overview.$(
    `.card-component-infos .component-type`
  );
  public readonly sharedLibraries = this.overview
    .$(`.shared-libraries-content`)
    .$$(`.sl-name,.no-sl`);
  public readonly serviceUnits = this.overview
    .$(`.service-units-content`)
    .$$('.su-name,.sa-name,.no-su');

  static waitAndGet() {
    super.wait();
    browser.wait(EC.visibilityOf(ComponentOverviewPage.overview), waitTimeout);
    browser.wait(EC.visibilityOf(ComponentOverviewPage.overview), waitTimeout);
    return new ComponentOverviewPage();
  }

  private constructor() {
    super();
  }

  getInfoNoSuMessage() {
    return MessageComponentPage.waitAndGet(this.component, `info-no-su`);
  }

  getInfoNoSlMessage() {
    return MessageComponentPage.waitAndGet(this.component, `info-no-sl`);
  }

  openSharedLibrary(identifier: string | number) {
    const css = `.shared-libraries-content a.shared-library`;
    const e =
      typeof identifier === 'string'
        ? this.overview.element(by.cssContainingText(css, identifier))
        : this.overview.$$(css).get(identifier);
    waitAndClick(e);
    return SharedLibraryOverviewPage.waitAndGet();
  }

  openServiceUnit(identifier: string | number) {
    const css = `.service-units-content a.service-unit`;
    const e =
      typeof identifier === 'string'
        ? this.overview.element(by.cssContainingText(css, identifier))
        : this.overview.$$(css).get(identifier);
    waitAndClick(e);
    return ServiceUnitOverviewPage.waitAndGet();
  }

  openServiceAssembly(identifier: string | number) {
    const css = `.service-units-content a.service-assembly`;
    const e =
      typeof identifier === 'string'
        ? this.overview.element(by.cssContainingText(css, identifier))
        : this.serviceUnits.$$(css).get(identifier);
    waitAndClick(e);
    return ServiceAssemblyOverviewPage.waitAndGet();
  }
}

export class ComponentOperationPage extends ComponentPage {
  public static readonly operations = ComponentPage.component.$(
    `app-petals-component-operations`
  );

  public readonly operations = ComponentOperationPage.operations;

  public readonly lifecycleInfo = this.operations.$(`.component-lifecycle`);

  public readonly state = this.lifecycleInfo.$(`span.component-state`);
  public readonly stopButton = this.lifecycleInfo.element(
    by.cssContainingText(`button`, `Stop`)
  );
  public readonly startButton = this.lifecycleInfo.element(
    by.cssContainingText(`button`, `Start`)
  );
  public readonly installButton = this.lifecycleInfo.element(
    by.cssContainingText(`button`, `Install`)
  );
  public readonly uninstallButton = this.lifecycleInfo.element(
    by.cssContainingText(`button`, `Uninstall`)
  );
  public readonly unloadButton = this.lifecycleInfo.element(
    by.cssContainingText(`button`, `Unload`)
  );
  public readonly setParametersButton = this.lifecycleInfo.element(
    by.cssContainingText(`button`, `Set`)
  );
  public readonly parameters = this.lifecycleInfo.$(`.component-parameters`);
  public readonly deploys = this.operations.$(`.deploys`);

  // deploy a su

  static waitAndGet() {
    super.wait();
    browser.wait(
      EC.visibilityOf(ComponentOperationPage.operations),
      waitTimeout
    );
    return new ComponentOperationPage();
  }

  private constructor() {
    super();
  }

  getErrorChangeStateMessage() {
    return MessageComponentPage.getMessage(
      this.component,
      `error-change-state`
    );
  }

  getSUUpload() {
    return ServiceUnitDeploymentPage.waitAndGet('deploy-service-unit');
  }

  parameter(name: string) {
    return this.parameters.$(`input[placeholder="${name}"]`);
  }
}
