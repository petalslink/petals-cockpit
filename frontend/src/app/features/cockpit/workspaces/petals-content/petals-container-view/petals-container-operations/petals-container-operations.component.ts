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

import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { IContainerRow } from '../../../state/containers/container.interface';
import { IStore } from 'app/shared/interfaces/store.interface';
import { Containers } from 'app/features/cockpit/workspaces/state/containers/containers.reducer';

@Component({
  selector: 'app-petals-container-operations',
  templateUrl: './petals-container-operations.component.html',
  styleUrls: ['./petals-container-operations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetalsContainerOperationsComponent implements OnInit {
  @Input() container: IContainerRow;
  public fileToDeploy: File;

  constructor(private store$: Store<IStore>) { }

  ngOnInit() { }

  fileChange(event) {
    const fileList: FileList = event.target.files;

    if (fileList.length > 0) {
      this.fileToDeploy = fileList[0];
    }
  }

  deploy(file: File) {
    this.store$.dispatch({
      type: Containers.DEPLOY_COMPONENT,
      payload: { file, containerId: this.container.id }
    });
  }
}
