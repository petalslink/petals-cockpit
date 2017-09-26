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
import { ServiceAssemblyOverviewPage } from './service-assembly.po';
import { ServiceUnitOverviewPage } from './service-unit.po';
import { SharedLibraryOverviewPage } from './shared-library.po';
import { UploadComponentPage } from './upload-component.po';

export abstract class ComponentPage {
  public static readonly component = $(`app-petals-component-view`);

  public readonly component = ComponentPage.component;
  public readonly title = this.component.$(`md-toolbar .title`);
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
      EC.stalenessOf(ComponentPage.component.$('md-toolbar md-spinner')),
      waitTimeout
    );
  }

  openOperations() {
    waitAndClick(
      this.component.element(
        by.cssContainingText(`md-tab-header .mat-tab-label`, 'Operations')
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
  public readonly state = this.overview.$(`.component-infos .component-state`);
  public readonly type = this.overview.$(`.component-infos .component-type`);
  public readonly sharedLibraries = this.overview.$$(
    `.shared-libraries a.shared-library .sl-name`
  );
  public readonly noSharedLibraryMessage = this.overview.$$(
    `.shared-libraries .no-sl-message`
  );
  public readonly serviceUnits = this.overview.$$(
    `.sus-and-sas a.service-unit .su-name`
  );
  public readonly noServiceUnitMessage = this.overview.$$(
    `.sus-and-sas .no-su-message`
  );
  public readonly suServiceAssemblies = this.overview.$$(
    `.sus-and-sas a.service-assembly .su-service-assembly-name`
  );

  static waitAndGet() {
    super.wait();
    browser.wait(EC.visibilityOf(ComponentOverviewPage.overview), waitTimeout);
    browser.wait(EC.visibilityOf(ComponentOverviewPage.overview), waitTimeout);
    return new ComponentOverviewPage();
  }

  private constructor() {
    super();
  }

  openSharedLibrary(identifier: string | number) {
    const e =
      typeof identifier === 'string'
        ? this.overview.element(
            by.cssContainingText(
              `.shared-libraries a.shared-library`,
              identifier
            )
          )
        : this.sharedLibraries.get(identifier);
    waitAndClick(e);
    return SharedLibraryOverviewPage.waitAndGet();
  }

  openServiceUnit(identifier: string | number) {
    const e =
      typeof identifier === 'string'
        ? this.overview.element(
            by.cssContainingText(`.sus-and-sas a.service-unit`, identifier)
          )
        : this.serviceUnits.get(identifier);
    waitAndClick(e);
    return ServiceUnitOverviewPage.waitAndGet();
  }

  openServiceAssembly(identifier: string | number) {
    const e =
      typeof identifier === 'string'
        ? this.overview.element(
            by.cssContainingText(`.sus-and-sas a.service-assembly`, identifier)
          )
        : this.suServiceAssemblies.get(identifier);
    waitAndClick(e);
    return ServiceAssemblyOverviewPage.waitAndGet();
  }
}

export class ComponentOperationPage extends ComponentPage {
  public static readonly operations = ComponentPage.component.$(
    `app-petals-component-operations`
  );

  public readonly operations = ComponentOperationPage.operations;

  public readonly lifecycleCard = this.operations.$(
    `md-card.component-lifecycle`
  );

  public readonly state = this.lifecycleCard.$(
    `md-card-subtitle span.component-state`
  );
  public readonly stopButton = this.lifecycleCard.element(
    by.cssContainingText(`button`, `Stop`)
  );
  public readonly startButton = this.lifecycleCard.element(
    by.cssContainingText(`button`, `Start`)
  );
  public readonly installButton = this.lifecycleCard.element(
    by.cssContainingText(`button`, `Install`)
  );
  public readonly uninstallButton = this.lifecycleCard.element(
    by.cssContainingText(`button`, `Uninstall`)
  );
  public readonly unloadButton = this.lifecycleCard.element(
    by.cssContainingText(`button`, `Unload`)
  );
  public readonly changeStateError = this.lifecycleCard.$(`.error .italic`);
  public readonly parameters = this.lifecycleCard.$(`.parameters`);

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

  getSUUpload() {
    return UploadComponentPage.waitAndGet('deploy-service-unit');
  }

  parameter(name: string) {
    return this.parameters.$(`input[placeholder="${name}"]`);
  }
}
