/**
 * Copyright (C) 2017-2019 Linagora
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

import * as JSZip from 'jszip';
import { forkJoin, from, Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

export function loadFilesContentFromZip(
  zipFile: File,
  shouldKeepFile?: (relativePath: string) => boolean
): Observable<string[]> {
  return from(JSZip.loadAsync(zipFile)).pipe(
    switchMap(zip => {
      const filesContent: Observable<string>[] = [];

      // forEach is not the one from Array.prototype
      // it's the one provided by JSZip
      zip.forEach((relativePath, zipEntry) => {
        if (shouldKeepFile(relativePath)) {
          filesContent.push(_getTextFromZip(zip, relativePath));
        }
      });

      return forkJoin(filesContent);
    }),
    catchError(err =>
      throwError(
        new Error(
          `An error occured while trying to read the zip "${zipFile.name}"`
        )
      )
    )
  );
}

export function _getTextFromZip(
  zipFile: JSZip,
  relativePath: string
): Observable<string> {
  return from(zipFile.file(relativePath).async('text'));
}
