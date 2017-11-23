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
  $,
  browser,
  ElementFinder,
  ExpectedConditions as EC,
} from 'protractor';

import { waitTimeout } from '../common';
import { MessageComponentPage } from './message-component.po';

export abstract class UploadComponentPage {
  public readonly title: ElementFinder;
  public readonly fileInput: ElementFinder;
  public readonly fileName: ElementFinder;
  public readonly chooseFileButton: ElementFinder;
  public readonly cancelFileButton: ElementFinder;
  public readonly deployButton: ElementFinder;
  protected readonly editInformation = this.component.$('.edit-information');

  protected static _waitAndGet<T>(
    selectorClass: string,
    UploadPage: new (elementFinder: ElementFinder) => T
  ): T {
    const uploadComponent = $(`app-upload.${selectorClass}`);
    browser.wait(EC.visibilityOf(uploadComponent), waitTimeout);
    return new UploadPage(uploadComponent);
  }

  constructor(public readonly component: ElementFinder) {
    this.title = this.component.$('.mct-title');
    this.fileInput = this.component.$('input[type="file"]');
    this.fileName = this.component.$('.file-name');
    this.chooseFileButton = this.component.$('.choose-file');
    this.cancelFileButton = this.component.$('.btn-cancel-file');
    this.deployButton = this.component.$('.btn-upload');
  }

  getErrorDeployMessage() {
    return MessageComponentPage.waitAndGet(this.component, `error-upload`);
  }
}

export class ComponentDeploymentPage extends UploadComponentPage {
  public nameInput = this.editInformation.$('input[formControlName="name"]');

  static waitAndGet(selectorClass: string) {
    return super._waitAndGet(selectorClass, ComponentDeploymentPage);
  }
}

export class ServiceAssemblyDeploymentPage extends UploadComponentPage {
  static waitAndGet(selectorClass: string) {
    return super._waitAndGet(selectorClass, ServiceAssemblyDeploymentPage);
  }
}

export class ServiceUnitDeploymentPage extends UploadComponentPage {
  static waitAndGet(selectorClass: string) {
    return super._waitAndGet(selectorClass, ServiceUnitDeploymentPage);
  }
}

export class SharedLibraryDeploymentPage extends UploadComponentPage {
  static waitAndGet(selectorClass: string) {
    return super._waitAndGet(selectorClass, SharedLibraryDeploymentPage);
  }
}
