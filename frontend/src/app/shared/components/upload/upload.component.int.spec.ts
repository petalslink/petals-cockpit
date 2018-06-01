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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedModule } from '@shared/shared.module';
import {
  elementText,
  getButtonByClass,
  getElementBySelector,
  getInputByName,
} from 'testing';
import { UploadComponent } from './upload.component';

describe(`[Integration test] UploadComponent`, () => {
  let component: UploadComponent;
  let fixture: ComponentFixture<UploadComponent>;

  const DOM = {
    texts: {
      get title() {
        return elementText(getElementBySelector(fixture, '.mct-title'));
      },
      get fileName() {
        const fileNameElem = getElementBySelector(fixture, '.file-name');

        if (fileNameElem) {
          return elementText(fileNameElem);
        }

        return null;
      },
    },
    inputs: {
      get fileInput() {
        return getInputByName(fixture, 'choose-file-hidden');
      },
    },
    buttons: {
      get chooseFileButton() {
        return getButtonByClass(fixture, 'btn-choose-file');
      },
      get cancelFileButton() {
        return getButtonByClass(fixture, 'btn-cancel-file');
      },
      get deployButton() {
        return getButtonByClass(fixture, 'btn-upload');
      },
    },
    progressBar: {
      get percentage() {
        const progressElem = getElementBySelector(fixture, 'mat-progress-bar');
        return +progressElem.getAttribute('aria-valuenow');
      },
    },
  };

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [SharedModule.forRoot()],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it(`should only display the "select file" button at the beginning`, () => {
    shouldBeInitialState();
  });

  it(`should remove the selected file and go back to initial state`, () => {
    const fileName = 'sa.zip';
    setFile(fileName);

    shouldBeSelectedFileState(fileName);
  });

  it(`should display a progress bar while uploading the file`, () => {
    setFile('sa.zip');
    setUploadStatus(10);

    expect(DOM.progressBar.percentage).toEqual(10);
  });

  function shouldBeInitialState() {
    expect(DOM.buttons.chooseFileButton).not.toBe(null);
    expect(DOM.inputs.fileInput).not.toBe(null);
    expect(DOM.texts.title).not.toBe(null);

    expect(DOM.texts.fileName).toBe(null);
    expect(DOM.buttons.cancelFileButton).toBe(null);
    expect(DOM.buttons.deployButton).toBe(null);
  }

  function shouldBeSelectedFileState(fileName?: string) {
    expect(DOM.buttons.chooseFileButton).toBe(null);
    expect(DOM.inputs.fileInput).toBe(null);

    expect(DOM.texts.fileName).not.toBe(null);
    expect(DOM.buttons.cancelFileButton).not.toBe(null);
    expect(DOM.buttons.deployButton).not.toBe(null);

    if (fileName) {
      expect(DOM.texts.fileName).toEqual(fileName);
    }
  }

  function setFile(fileName: string) {
    // it'd be better to set the file using only the DOM, like this:
    // setInputValue(DOM.inputs.fileInput, 'sa.zip');
    // but for security reasons, it's not possible to set a file programmatically
    component.fileChange({ target: { files: [<File>{ name: fileName }] } });
    fixture.detectChanges();
  }

  function setUploadStatus(percentage: number) {
    shouldBeSelectedFileState();

    component.uploadStatus = { percentage };
    fixture.detectChanges();
  }
});
