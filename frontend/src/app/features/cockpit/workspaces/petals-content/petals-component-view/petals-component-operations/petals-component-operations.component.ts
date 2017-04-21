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

import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';

import { IComponentRow } from '../../../state/components/component.interface';
import { IStore } from '../../../../../../shared/interfaces/store.interface';
import { Components } from '../../../state/components/components.reducer';

@Component({
  selector: 'app-petals-component-operations',
  templateUrl: './petals-component-operations.component.html',
  styleUrls: ['./petals-component-operations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetalsComponentOperationsComponent implements OnInit {
  @Input() component: IComponentRow;
  public fileToDeploy: File;
  public serviceUnitName: string;

  constructor(private store$: Store<IStore>) { }

  ngOnInit() { }

  fileChange(event) {
    const fileList: FileList = event.target.files;

    if (fileList.length > 0) {
      this.fileToDeploy = fileList[0];
      this.serviceUnitName = this.fileToDeploy.name.substring(0, this.fileToDeploy.name.length - 4);
    }
  }

  deploy(file: File, serviceUnitName: string) {
    this.store$.dispatch({
      type: Components.DEPLOY_SERVICE_UNIT,
      payload: { file, componentId: this.component.id, serviceUnitName: serviceUnitName.trim() }
    });
  }
}
