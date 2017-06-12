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
import { UploadComponentPage } from './upload-component.po';

export abstract class ContainerPage {
  public static readonly component = $(`app-petals-container-view`);

  public readonly component = ContainerPage.component;
  public readonly title = this.component.$(`md-toolbar .title`);

  protected static wait() {
    browser.wait(
      urlToMatch(/\/workspaces\/\w+\/petals\/containers\/\w+/),
      waitTimeout
    );
    browser.wait(EC.visibilityOf(ContainerPage.component), waitTimeout);
    browser.wait(
      EC.stalenessOf(ContainerPage.component.$('md-toolbar md-spinner')),
      waitTimeout
    );
  }

  openOperations() {
    this.component
      .element(
        by.cssContainingText(`md-tab-header .mat-tab-label`, 'Operations')
      )
      .click();
    return ContainerOperationPage.waitAndGet();
  }
}

export class ContainerOverviewPage extends ContainerPage {
  public static readonly overview = ContainerPage.component.$(
    `app-petals-container-overview`
  );

  public readonly overview = ContainerOverviewPage.overview;

  public readonly ip = this.overview.$(
    `.container-infos md-card-subtitle.container-ip`
  );
  public readonly port = this.overview.$(
    `.container-infos md-card-subtitle.container-port`
  );

  public readonly systemInfo = this.overview.$(
    `md-card md-card-content.system-info`
  );

  static waitAndGet() {
    super.wait();
    browser.wait(EC.visibilityOf(ContainerOverviewPage.overview), waitTimeout);
    return new ContainerOverviewPage();
  }

  private constructor() {
    super();
  }
}

export class ContainerOperationPage extends ContainerPage {
  public static readonly operations = ContainerPage.component.$(
    `app-petals-container-operations`
  );

  public readonly operations = ContainerOperationPage.operations;

  public readonly deploys = this.operations.$(`.deploys`);

  // deploy components and service-assemblies

  static waitAndGet() {
    super.wait();
    browser.wait(
      EC.visibilityOf(ContainerOperationPage.operations),
      waitTimeout
    );
    return new ContainerOperationPage();
  }

  private constructor() {
    super();
  }

  getComponentUpload() {
    return UploadComponentPage.waitAndGet('deploy-component');
  }

  getServiceAssemblyUpload() {
    return UploadComponentPage.waitAndGet('deploy-service-assembly');
  }

  getSharedLibraryUpload() {
    return UploadComponentPage.waitAndGet('deploy-shared-library');
  }
}
