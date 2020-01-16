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

import * as JSZip from 'jszip';
import { forkJoin, from, Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

export function loadJbiFilesContentFromZip(
  zipFile: File
): Observable<string[]> {
  return from(JSZip.loadAsync(zipFile)).pipe(
    switchMap(zip => {
      const filesContent: Observable<string>[] = [];

      // forEach is not the one from Array.prototype
      // it's the one provided by JSZip
      zip.forEach((relativePath, zipEntry) => {
        if (relativePath.includes('jbi.xml')) {
          filesContent.push(_getTextFromZip(zip, relativePath));
        }
      });

      return filesContent.length > 0
        ? forkJoin(filesContent)
        : throwError('noJbiFound');
    }),
    catchError(err =>
      throwError(
        new Error(
          err === 'noJbiFound'
            ? 'Zip file does not contain jbi.xml'
            : 'Could not read zip file'
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
