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

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';

import { Store } from '@ngrx/store';
import { SharedLibraries } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.actions';
import { ISharedLibraryRow } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.interface';
import { ESharedLibraryState } from 'app/shared/services/shared-libraries.service';
import { IStore } from 'app/shared/state/store.interface';

@Component({
  selector: 'app-petals-shared-library-operations',
  templateUrl: './petals-shared-library-operations.component.html',
  styleUrls: ['./petals-shared-library-operations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetalsSharedLibraryOperationsComponent implements OnInit {
  @Input() sharedLibrary: ISharedLibraryRow;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {}

  unload() {
    this.store$.dispatch(
      new SharedLibraries.ChangeState({
        id: this.sharedLibrary.id,
        state: ESharedLibraryState.Unloaded,
      })
    );
  }
}
