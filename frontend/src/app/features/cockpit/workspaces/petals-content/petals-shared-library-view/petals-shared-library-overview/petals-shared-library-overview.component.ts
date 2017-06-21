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

import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { IComponentRow } from '../../../state/components/components.interface';
import { IStore } from '../../../../../../shared/state/store.interface';
import { ISharedLibraryRow } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.interface';

@Component({
  selector: 'app-petals-shared-library-overview',
  templateUrl: './petals-shared-library-overview.component.html',
  styleUrls: ['./petals-shared-library-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetalsSharedLibraryOverviewComponent implements OnInit {
  @Input() sharedLibrary: ISharedLibraryRow;
  @Input() components: IComponentRow[];

  workspaceId$: Observable<string>;

  constructor(private store$: Store<IStore>) {}

  ngOnInit() {
    this.workspaceId$ = this.store$.select(
      state => state.workspaces.selectedWorkspaceId
    );
  }
}
