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

import { async } from '@angular/core/testing';
import * as JSZip from 'jszip';
import { Observable } from 'rxjs/Observable';

import {
  _getTextFromZip,
  loadFilesContentFromZip,
} from 'app/shared/helpers/zip.helper';

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

        text$.do(text => expect(text).toEqual('some text')).subscribe();
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
          .do(filesContent =>
            expect(filesContent).toEqual(['Content of first file'])
          )
          .subscribe();
      })
    );

    it(
      `should throw an error within the observable if an error occurred while reading a file`,
      async(() => {
        spyOn(JSZip, 'loadAsync').and.callFake(() =>
          Observable.throw('some error while reading zip file')
        );

        const zipFile: any = {
          name: 'some-file.zip',
        };

        const filesContent$ = loadFilesContentFromZip(zipFile, null);

        filesContent$
          .catch((err: Error) => {
            expect(err.message).toEqual(
              `An error occured while trying to read the zip "${zipFile.name}"`
            );
            return Observable.of();
          })
          .subscribe();
      })
    );
  });
});
