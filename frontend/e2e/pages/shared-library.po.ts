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

export abstract class SharedLibraryPage {
  public static readonly component = $(`app-petals-shared-library-view`);

  public readonly component = SharedLibraryPage.component;
  public readonly title = this.component.$(`md-toolbar .title`);
  public readonly hasBeenDeletedMessage = this.component.$(
    'app-workspace-element .message'
  );

  protected static wait() {
    browser.wait(
      urlToMatch(/\/workspaces\/\w+\/petals\/shared-libraries\/\w+/),
      waitTimeout
    );
    browser.wait(EC.visibilityOf(SharedLibraryPage.component), waitTimeout);
    browser.wait(
      EC.stalenessOf(SharedLibraryPage.component.$('md-toolbar md-spinner')),
      waitTimeout
    );
  }

  openOperations() {
    waitAndClick(
      this.component.element(
        by.cssContainingText(`md-tab-header .mat-tab-label`, 'Operations')
      )
    );
    return SharedLibraryOperationPage.waitAndGet();
  }

  openOverview() {
    waitAndClick(
      this.component.element(
        by.cssContainingText(`md-tab-header .mat-tab-label`, 'Overview')
      )
    );
    return SharedLibraryOverviewPage.waitAndGet();
  }
}

export class SharedLibraryOverviewPage extends SharedLibraryPage {
  public static readonly overview = SharedLibraryPage.component.$(
    `app-petals-shared-library-overview`
  );

  public readonly overview = SharedLibraryOverviewPage.overview;
  public readonly components = this.overview.$$(
    `.components a.component .component-name`
  );

  static waitAndGet() {
    super.wait();
    browser.wait(
      EC.visibilityOf(SharedLibraryOverviewPage.overview),
      waitTimeout
    );
    return new SharedLibraryOverviewPage();
  }

  private constructor() {
    super();
  }

  openComponent(identifier: string | number) {
    const e =
      typeof identifier === 'string'
        ? this.overview.element(
            by.cssContainingText(`.components a.component`, identifier)
          )
        : this.components.get(identifier);
    waitAndClick(e);
    return ComponentOverviewPage.waitAndGet();
  }
}

export class SharedLibraryOperationPage extends SharedLibraryPage {
  public static readonly operations = SharedLibraryPage.component.$(
    `app-petals-shared-library-operations`
  );

  public readonly operations = SharedLibraryOperationPage.operations;

  public readonly lifecycleCard = this.operations.$(
    `md-card.shared-library-lifecycle`
  );

  public readonly unloadButton = this.lifecycleCard.element(
    by.cssContainingText(`button`, `Unload`)
  );
  public readonly changeStateError = this.lifecycleCard.$(`.error .italic`);

  // deploy a su

  static waitAndGet() {
    super.wait();
    browser.wait(
      EC.visibilityOf(SharedLibraryOperationPage.operations),
      waitTimeout
    );
    return new SharedLibraryOperationPage();
  }

  private constructor() {
    super();
  }
}
