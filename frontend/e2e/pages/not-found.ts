/**
 * Copyright (C) 2017-2018 Linagora
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

import { $, browser, ExpectedConditions as EC } from 'protractor';

import { waitTimeout } from '../common';
import { urlToMatch } from '../utils';

export class NotFoundPage {
  public static readonly component = $(`app-not-found-404`);

  public readonly details = NotFoundPage.component.$$('details-404');

  static waitAndGet() {
    browser.wait(urlToMatch(/\/workspaces\/\w+\/not-found$/), waitTimeout);
    browser.wait(EC.visibilityOf(NotFoundPage.component), waitTimeout);
    return new NotFoundPage();
  }

  private constructor() {}
}
