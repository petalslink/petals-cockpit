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

import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { getWorkspacesIdsNames } from '@feat/cockpit/workspaces/state/workspaces/workspaces.selectors';
import { Store } from '@ngrx/store';
import { IStore } from '@shared/state/store.interface';
import { first, map } from 'rxjs/operators';

export class CustomValidators {
  static isIp(c: AbstractControl) {
    const ipRegexp = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/;

    return ipRegexp.test(c.value)
      ? null
      : {
          isIp: {
            valid: false,
          },
        };
  }

  static isPort(c: AbstractControl) {
    const portRegexp = /^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/;

    return portRegexp.test(c.value)
      ? null
      : {
          isPort: {
            valid: false,
          },
        };
  }

  static isPortOrNull(c: AbstractControl) {
    return !c.value || CustomValidators.isPort(c);
  }

  /**
   * async validator to determine is there is
   * an existing workspace with similar name
   */
  static existingWorkspaceWithSimilarNameValidator(
    store$: Store<IStore>
  ): AsyncValidatorFn {
    return (control: AbstractControl) =>
      store$.pipe(
        getWorkspacesIdsNames,
        first(),
        map(workspaceIdNames => {
          return workspaceIdNames.list
            .map(wks => this.cleanWorkspaceName(wks.name))
            .includes(this.cleanWorkspaceName(control.value))
            ? { existingWorkspaceWithSimilarName: true }
            : null;
        })
      );
  }

  private static cleanWorkspaceName(name: string): string {
    const backendIgnoredCharacters = '-_@~!?,;.:^${}[]()=+#~²%§&|*\\/\'":° ';
    let cleanName = '';
    for (let i = 0; i < name.length; i++) {
      const char = name.charAt(i);
      if (!backendIgnoredCharacters.includes(char)) {
        cleanName += char;
      }
    }
    return cleanName.toUpperCase();
  }
}
