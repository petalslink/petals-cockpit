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
import { ComponentOverviewPage } from './component.po';

export abstract class SharedLibraryPage {

  public static readonly component = $(`app-petals-shared-library-view`);

  public readonly component = SharedLibraryPage.component;
  public readonly title = this.component.$(`md-toolbar .title`);

  protected static wait() {
    browser.wait(urlToMatch(/\/workspaces\/\w+\/petals\/shared-libraries\/\w+/), waitTimeout);
    browser.wait(EC.visibilityOf(SharedLibraryPage.component), waitTimeout);
    browser.wait(EC.stalenessOf(SharedLibraryPage.component.$('md-toolbar md-spinner')), waitTimeout);
  }
}

export class SharedLibraryOverviewPage extends SharedLibraryPage {

  public static readonly overview = SharedLibraryPage.component.$(`app-petals-shared-library-overview`);

  public readonly overview = SharedLibraryOverviewPage.overview;
  public readonly state = this.overview.$(`md-card.state md-card-title`);
  public readonly components = this.overview.$$(`md-card.components ul > li`);

  static waitAndGet() {
    super.wait();
    browser.wait(EC.visibilityOf(SharedLibraryOverviewPage.overview), waitTimeout);
    return new SharedLibraryOverviewPage();
  }

  private constructor() {
    super();
  }

  openComponent(identifier: string | number) {
    if (typeof identifier === 'string') {
      this.overview.element(by.cssContainingText(`md-card.components ul > li a`, identifier)).click();
    } else {
      this.overview.$$('md-card.components ul > li a').get(identifier).click();
    }
    return ComponentOverviewPage.waitAndGet();
  }
}
