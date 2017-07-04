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

import {
  browser,
  ExpectedConditions as EC,
  $,
  ElementFinder,
} from 'protractor';
import { waitTimeout } from '../common';

export class UploadComponentPage {
  public readonly title;
  public readonly fileInput;
  public readonly fileName;
  public readonly chooseFileButton;
  public readonly chooseFileName;
  public readonly changeFileName;
  public readonly deployButton;
  public readonly fileNameInput;
  public readonly fileNamePlaceholder;
  public readonly errorTitle;
  public readonly errorMsg;

  static waitAndGet(selectorClass: string) {
    const component = $(`app-upload.${selectorClass}`);
    browser.wait(EC.visibilityOf(component), waitTimeout);
    return new UploadComponentPage(component);
  }

  private constructor(public readonly component: ElementFinder) {
    this.title = this.component.$('md-card-subtitle.title');
    this.fileInput = this.component.$('input[type="file"]');
    this.fileName = this.component.$('.file-name');
    this.chooseFileButton = this.component.$('.choose-file');
    this.chooseFileName = this.chooseFileButton.$('.choose-file-name');
    this.changeFileName = this.chooseFileButton.$('.change-file-name');
    this.deployButton = this.component.$('.deploy');
    this.fileNameInput = this.component.$('input[name="changeFileName"]');
    this.fileNamePlaceholder = this.component.$(
      '.change-file-input .mat-input-placeholder'
    );
    this.errorTitle = this.component.$('.error-deploy .title');
    this.errorMsg = this.component.$('.error-deploy .message');
  }
}
