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

import { $, browser, ExpectedConditions as EC } from 'protractor';

import { waitTimeout } from '../common';
import { urlToMatch, waitAndClick } from '../utils';
import { ContainerOverviewPage } from './container.po';
import { MessageComponentPage } from './message-component.po';

export class BusPage {
  public static readonly component = $(`app-petals-bus-view`);

  public readonly component = BusPage.component;
  public readonly title = this.component.$(`mat-toolbar .title`);
  public readonly containers = this.component.$$(
    `.swiper-container .swiper-slide`
  );
  public readonly deleteButton = this.component.$(
    'mat-toolbar .btn-delete-bus'
  );
  public readonly hasBeenDeletedMessage = this.component.$(
    'app-workspace-element .message'
  );

  static waitAndGet() {
    browser.wait(
      urlToMatch(/\/workspaces\/\w+\/petals\/buses\/\w+/),
      waitTimeout
    );
    browser.wait(EC.visibilityOf(BusPage.component), waitTimeout);
    return new BusPage();
  }

  private constructor() {}

  getInfoPetalsServersMessage() {
    return MessageComponentPage.waitAndGet(this.component);
  }

  openContainer(index: number) {
    waitAndClick(this.containers.get(index).$('.swiper-img-container'));
    return ContainerOverviewPage.waitAndGet();
  }
}
