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
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChange,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';

import { IStore } from 'app/shared/state/store.interface';
import { IContainerRow } from '../../../state/containers/containers.interface';

import { Containers } from 'app/features/cockpit/workspaces/state/containers/containers.actions';
import { UploadComponent } from 'app/shared/components/upload/upload.component';

@Component({
  selector: 'app-petals-container-operations',
  templateUrl: './petals-container-operations.component.html',
  styleUrls: ['./petals-container-operations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetalsContainerOperationsComponent implements OnChanges {
  @Input() container: IContainerRow;
  public fileToDeployComponent: File = null;
  public fileToDeployServiceAssembly: File = null;

  @ViewChild('deployComponent') deployComponent: UploadComponent;
  @ViewChild('deployServiceAssembly') deployServiceAssembly: UploadComponent;
  @ViewChild('deploySharedLibrary') deploySharedLibrary: UploadComponent;

  constructor(private store$: Store<IStore>) {}

  ngOnChanges(changes: SimpleChanges) {
    if (hasContainerChanged(changes.container)) {
      this.deployComponent.resetForm();
      this.deployServiceAssembly.resetForm();
      this.deploySharedLibrary.resetForm();
    }
  }

  deploy(
    whatToDeploy: 'component' | 'service-assembly' | 'shared-library',
    file: File
  ) {
    if (whatToDeploy === 'component') {
      this.store$.dispatch(
        new Containers.DeployComponent({ id: this.container.id, file })
      );
    } else if (whatToDeploy === 'service-assembly') {
      this.store$.dispatch(
        new Containers.DeployServiceAssembly({ id: this.container.id, file })
      );
    } else if (whatToDeploy === 'shared-library') {
      this.store$.dispatch(
        new Containers.DeploySharedLibrary({ id: this.container.id, file })
      );
    }
  }
}

function hasContainerChanged(containerChanges: SimpleChange) {
  const oldContainer = containerChanges.previousValue;
  const newContainer = containerChanges.currentValue;

  if (!oldContainer) {
    return false;
  }

  return oldContainer.id !== newContainer.id;
}
