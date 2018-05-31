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

import { async } from '@angular/core/testing';
import * as JSZip from 'jszip';

import { catchError, tap } from 'rxjs/operators';

import {
  _getTextFromZip,
  loadFilesContentFromZip,
} from 'app/shared/helpers/zip.helper';
import { throwError } from 'rxjs';
import { of } from 'rxjs/internal/observable/of';

describe(`Zip helper`, () => {
  describe(`_getTextFromZip`, () => {
    it(
      `should get the text from a file in a zip and return it's content within an Observable`,
      async(() => {
        const zipFile: JSZip = <any>{
          file: (relativePath: string) => ({
            async: (p: string) => Promise.resolve('some text'),
          }),
        };

        const text$ = _getTextFromZip(zipFile, './some-path');

        text$.pipe(tap(text => expect(text).toEqual('some text'))).subscribe();
      })
    );
  });

  describe(`loadFilesContentFromZip`, () => {
    it(
      `should return an array of files content, for files that pass the predicate`,
      async(() => {
        const JSZipMock = {
          loadAsync: (zipFileMock: any) =>
            Promise.resolve({
              forEach: (relativePath: any, zipEntry: any) => {},
            }),
        };

        spyOn(JSZip, 'loadAsync').and.callFake(JSZipMock.loadAsync);

        const zipFile: any = {
          './first-file.txt': 'Content of first file',
          './second-file.txt': 'Content of second file',
        };

        const filesContent$ = loadFilesContentFromZip(
          zipFile,
          relativePath => relativePath === './first-file.txt'
        );

        filesContent$
          .pipe(
            tap(filesContent =>
              expect(filesContent).toEqual(['Content of first file'])
            )
          )
          .subscribe();
      })
    );

    it(
      `should throw an error within the observable if an error occurred while reading a file`,
      async(() => {
        spyOn(JSZip, 'loadAsync').and.callFake(() =>
          throwError('some error while reading zip file')
        );

        const zipFile: any = {
          name: 'some-file.zip',
        };

        const filesContent$ = loadFilesContentFromZip(zipFile, null);

        filesContent$
          .pipe(
            catchError((err: Error) => {
              expect(err.message).toEqual(
                `An error occured while trying to read the zip "${
                  zipFile.name
                }"`
              );
              return of();
            })
          )
          .subscribe();
      })
    );
  });
});
