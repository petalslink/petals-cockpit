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
import { fakeAsync } from '@angular/core/testing';
import { flush } from '@angular/core/testing';
import { tap } from 'rxjs/operators';

import { SharedModule } from 'app/shared/shared.module';
import { UploadComponent } from './upload.component';
import {
  IEventFileSelected,
  ISelectedFileInformation,
} from './upload.interface';

describe(`UploadComponent`, () => {
  let uploadComponent: UploadComponent;
  let uploadFixture: ComponentFixture<UploadComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [SharedModule.forRoot()],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    uploadFixture = TestBed.createComponent(UploadComponent);
    uploadComponent = uploadFixture.componentInstance;
    uploadFixture.detectChanges();
  });

  it(`should get the information of a file once selected`, () => {
    expect(uploadComponent.selectedFileInformation).toBe(undefined);

    const event = <IEventFileSelected>{
      target: {
        files: [
          {
            name: 'some-file.zip',
          },
          {
            name: 'some-other-file-that-shouldnt-be-taken-into-account.zip',
          },
        ],
      },
    };

    uploadComponent.fileChange(event);

    expect(uploadComponent.selectedFileInformation).toEqual(
      jasmine.objectContaining({
        fileName: 'some-file',
        fileExtension: 'zip',
      })
    );
  });

  it(`should cancel the selected file to choose another one`, () => {
    uploadComponent.selectedFileInformation = <ISelectedFileInformation>{};

    uploadComponent.cancelFile();

    expect(uploadComponent.selectedFileInformation).toBeUndefined();
  });

  it(
    `should upload a file by emitting event to the parent`,
    fakeAsync(() => {
      uploadComponent.isUploading = false;
      uploadComponent.selectedFileInformation = <any>'information';

      uploadComponent.evtUploadFile
        .asObservable()
        .pipe(
          tap(information => {
            expect(information).toEqual(<any>{
              selectedFileInformation: 'information',
            });

            expect(uploadComponent.isUploading).toBe(true);
          })
        )
        .subscribe();

      uploadComponent.uploadFile();

      flush();
    })
  );

  it(`should update uploading status and percentage when the input changes`, () => {
    expect(uploadComponent.isUploading).toBe(false);
    expect(uploadComponent.percentage).toBeUndefined();

    uploadComponent.uploadStatus = { percentage: 5 };

    expect(uploadComponent.isUploading).toBe(true);
    expect(uploadComponent.percentage).toEqual(5);
  });
});
