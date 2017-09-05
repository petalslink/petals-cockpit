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

import { Component, DebugElement } from '@angular/core';
import {
  async,
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { UploadComponent } from 'app/shared/components/upload/upload.component';
import { SharedModule } from 'app/shared/shared.module';
import {
  getButtonByClass,
  getElementBySelector,
  getInputByName,
} from 'testing';

describe(`UploadComponent`, () => {
  let hostComponent: HostComponent;
  let hostFixture: ComponentFixture<HostComponent>;
  let uploadComponent: UploadComponent;
  let uploadDe: DebugElement;

  const DOM = {
    get titleText() {
      return getInnerTextIfNotNull(
        getElementBySelector<HTMLSpanElement>(
          hostFixture,
          'md-card-title .title'
        )
      );
    },
    get fileUploadBtn() {
      return getButtonByClass(hostFixture, 'choose-file');
    },
    get selectedFileNameTxt() {
      return getInnerTextIfNotNull(
        getElementBySelector<HTMLSpanElement>(hostFixture, 'file-name')
      );
    },
    get selectedFileNameInpt() {
      return getInputByName(hostFixture, 'changeFileName');
    },
    get deployBtn() {
      return getButtonByClass(hostFixture, 'deploy');
    },
    get errorText() {
      return getInnerTextIfNotNull(
        getElementBySelector<HTMLSpanElement>(hostFixture, '.error .message')
      );
    },
  };

  const getInnerTextIfNotNull = (el: HTMLElement) =>
    !!el ? el.innerText : null;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [SharedModule, NoopAnimationsModule],
        // no need to declare UploadComponent as it's already into SharedModule
        declarations: [HostComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    hostFixture = TestBed.createComponent(HostComponent);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
  });

  it(`should display the custom title of the card`, () => {
    hostComponent.title = 'Test title';
    hostFixture.detectChanges();
    expect(DOM.titleText).toEqual('TEST TITLE');
  });

  it(`should only have the button to choose a file at the beginning`, () => {
    expect(!!DOM.fileUploadBtn).toBe(true);

    expect(!!DOM.selectedFileNameTxt).toBe(false);
    expect(!!DOM.selectedFileNameInpt).toBe(false);
    expect(!!DOM.deployBtn).toBe(false);
  });

  it(
    `should display the selected file name and show a deploy button once the file has been selected`,
    fakeAsync(() => {
      hostComponent.placeholderChangeFileName = 'Some placeholder';
      hostFixture.detectChanges();

      uploadDe = hostFixture.debugElement.query(By.css('app-upload'));
      uploadComponent = uploadDe.componentInstance;
      hostFixture.detectChanges();

      const files = [{ name: 'some-file.zip' }];

      // before choosing the file, deploy button is not available
      expect(!!DOM.deployBtn).toBe(false);

      // choose the file
      uploadComponent.fileChange({ target: { files } });
      hostFixture.detectChanges();
      tick();

      expect(DOM.selectedFileNameInpt.value).toBe('some-file');

      expect(!!DOM.deployBtn).toBe(true);
    })
  );

  it(
    `should disabled input to change the name and all the buttons if the disabled input is set to true`,
    fakeAsync(() => {
      hostComponent.disabled = true;

      // select the file
      hostComponent.placeholderChangeFileName = 'Some placeholder';
      hostFixture.detectChanges();

      uploadDe = hostFixture.debugElement.query(By.css('app-upload'));
      uploadComponent = uploadDe.componentInstance;
      hostFixture.detectChanges();

      const files = [{ name: 'some-file.zip' }];

      uploadComponent.fileChange({ target: { files } });
      hostFixture.detectChanges();
      tick();

      // check that inputs and buttons are disabled
      expect(DOM.selectedFileNameInpt.disabled).toBe(true);
      expect(DOM.fileUploadBtn.disabled).toBe(true);
      expect(DOM.deployBtn.disabled).toBe(true);
    })
  );

  it(`should display an error when passed as input`, () => {
    hostComponent.error = 'some error!';
    hostFixture.detectChanges();

    expect(DOM.errorText).toEqual('some error!');
  });

  describe(`should test reset method`, () => {
    let child: UploadComponent;

    beforeEach(() => {
      child = hostFixture.debugElement.query(By.css('app-upload'))
        .componentInstance;
    });

    it(`should check if upload form has been resetted`, () => {
      spyOn(child.formUpload, 'reset');

      child.fileToDeploy = null;
      child.changeFileName = null;
      child.deployModel = null;

      child.resetForm();

      expect(child.formUpload.reset).toHaveBeenCalled();
      expect(child.fileToDeploy).toBe(undefined);
      expect(child.changeFileName).toBe(undefined);
      expect(child.deployModel).toBe(undefined);

      // check that the template has been updated
      hostFixture.detectChanges();
      expect(DOM.selectedFileNameInpt).toBe(null);
      expect(DOM.selectedFileNameTxt).toBe(null);
    });
  });
});

@Component({
  template: `
    <app-upload
      [title]="title"
      [disabled]="disabled"
      [error]="error"
      [placeholderChangeFileName]="placeholderChangeFileName"
      (onDeploy)="deploy($event)"></app-upload>
  `,
})
class HostComponent {
  title: string;
  disabled: boolean;
  error: string;
  placeholderChangeFileName: string;

  onDeploy() {}
}
