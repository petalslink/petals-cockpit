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

import {
  $,
  browser,
  ElementFinder,
  ExpectedConditions as EC,
} from 'protractor';

import { waitTimeout } from '../common';

export class MessageComponentPage {
  public readonly content: ElementFinder;
  public readonly message: ElementFinder;
  public readonly viewMoreButton: ElementFinder;
  public readonly cancelButton: ElementFinder;
  public readonly msgViewMoreName: ElementFinder;

  static waitAndGet(container: ElementFinder, selectorClass?: string) {
    const component = selectorClass
      ? container.$(`app-message.${selectorClass}`)
      : container.$(`app-message`);
    browser.wait(EC.visibilityOf(component), waitTimeout);
    return new MessageComponentPage(component);
  }

  private constructor(public readonly component: ElementFinder) {
    this.content = this.component.$(`.msg-content`);
    this.message = this.component.$(`.msg-details`);
    this.viewMoreButton = this.component.$(`.btn-view-more-message`);
    this.cancelButton = this.component.$(`.btn-cancel-message`);
    this.msgViewMoreName = this.viewMoreButton.$(`span.view-more-name`);
  }

  openAndCheckDialog(message: string) {
    this.viewMoreButton.click();
    const dialog = $(`.msg-dialog`);
    const dialogTitle = dialog.$(`.msg-dialog-type .msg-dialog-title`);
    const dialogMessage = dialog.$(`.msg-dialog-details`);
    const closeButton = dialog.$(`button.btn-close-dialog`);

    browser.wait(EC.visibilityOf(dialog), waitTimeout);

    expect(dialogTitle.getText()).toMatch('Complete error:');
    expect(dialogMessage.getText()).toEqual(message);

    closeButton.click();

    browser.wait(EC.invisibilityOf(dialog), waitTimeout);
  }

  expectToBe(type: 'info' | 'warning' | 'error' | 'success', message: string) {
    expect(this.component.$(`.msg-content.${type}`).isDisplayed()).toBe(true);
    expect(this.message.getText()).toEqual(message);
  }

  expectHidden() {
    expect(this.content.isPresent()).toBe(false);
  }
}
