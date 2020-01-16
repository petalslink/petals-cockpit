/**
 * Copyright (C) 2017-2020 Linagora
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
  loadJbiFilesContentFromZip,
} from '@shared/helpers/zip.helper';
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

  describe(`loadJbiFilesContentFromZip`, () => {
    /**
     * This mock use a map as input to emulate a zip file.
     * The structure is the map is:
     * {
     *   'file1': 'Content of file1',
     *   'path/to/file2': 'Content of file2'
     * }
     */
    const JSZipMock = {
      loadAsync: (zipFileMock: { [relativePath: string]: string }) =>
        Promise.resolve({
          forEach: (callback: any) => {
            for (const relativePath in zipFileMock) {
              if (zipFileMock.hasOwnProperty(relativePath)) {
                callback(relativePath, null);
              }
            }
          },
          file: (relativePath: string) => ({
            async: () => Promise.resolve(zipFileMock[relativePath]),
          }),
        }),
    };

    it(
      `should return an array of JBI files content`,
      async(() => {
        spyOn(JSZip, 'loadAsync').and.callFake(JSZipMock.loadAsync);

        const zipFile: any = {
          './first-file.txt': 'Content of first file',
          './jbi.xml': 'Content of JBI file',
        };

        const filesContent$ = loadJbiFilesContentFromZip(zipFile);

        filesContent$
          .pipe(
            tap(filesContent =>
              expect(filesContent).toEqual(['Content of JBI file'])
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

        // zipFile is null because the mock does not use its value here
        const zipFile: any = null;

        const filesContent$ = loadJbiFilesContentFromZip(zipFile);

        filesContent$
          .pipe(
            catchError((err: Error) => {
              expect(err.message).toEqual('Could not read zip file');
              return of();
            })
          )
          .subscribe();
      })
    );

    it(
      `should throw an error within the observable if no JBI file is found`,
      async(() => {
        spyOn(JSZip, 'loadAsync').and.callFake(JSZipMock.loadAsync);

        const zipFile: any = {
          './first-file.txt': 'Content of first file',
          './second-file.txt': 'Content of second file',
        };

        const filesContent$ = loadJbiFilesContentFromZip(zipFile);

        filesContent$
          .pipe(
            catchError((err: Error) => {
              expect(err.message).toEqual('Zip file does not contain jbi.xml');
              return of();
            })
          )
          .subscribe();
      })
    );
  });
});
