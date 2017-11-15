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
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChange,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Actions } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { NotificationsService } from 'angular2-notifications';
import { empty } from 'rxjs/observable/empty';
import {
  catchError,
  filter,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { v4 as uuid } from 'uuid';

import { Containers } from 'app/features/cockpit/workspaces/state/containers/containers.actions';
import { IContainerRow } from 'app/features/cockpit/workspaces/state/containers/containers.interface';
import { UploadComponent } from 'app/shared/components/upload/upload.component';
import { ComponentsService } from 'app/shared/services/components.service';
import {
  HttpProgress,
  HttpProgressType,
} from 'app/shared/services/http-progress-tracker.service';
import { SharedLibrariesService } from 'app/shared/services/shared-libraries.service';
import { IStore } from 'app/shared/state/store.interface';
import { SharedValidator } from 'app/shared/validators/shared.validator';

@Component({
  selector: 'app-petals-container-operations',
  templateUrl: './petals-container-operations.component.html',
  styleUrls: ['./petals-container-operations.component.scss'],
})
export class PetalsContainerOperationsComponent
  implements OnInit, OnChanges, OnDestroy {
  private onDestroy$ = new Subject<void>();

  @Input() container: IContainerRow;
  @Input()
  componentsByName: {
    [name: string]: boolean;
  };
  sharedLibrariesByName: {
    [name: string]: boolean;
  };
  fileToDeployComponent: File = null;
  fileToDeployServiceAssembly: File = null;

  @ViewChild('deployComponent') deployComponent: UploadComponent;
  @ViewChild('deployServiceAssembly') deployServiceAssembly: UploadComponent;
  @ViewChild('deploySharedLibrary') deploySharedLibrary: UploadComponent;

  updateComponentDeployInfoFormGroup: FormGroup;
  updateSharedLibraryDeployInfoFormGroup: FormGroup;

  uploadComponentStatus: {
    percentage: number;
  };
  uploadServiceAssemblyStatus: {
    percentage: number;
  };
  uploadSharedLibraryStatus: {
    percentage: number;
  };

  constructor(
    private fb: FormBuilder,
    private store$: Store<IStore>,
    private actions$: Actions,
    private notifications: NotificationsService,
    private componentsService: ComponentsService,
    private sharedLibrariesService: SharedLibrariesService
  ) {}

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (hasContainerIdChanged(changes.container)) {
      this.deployComponent.reset();
      this.deployServiceAssembly.reset();
      this.deploySharedLibrary.reset();

      this.uploadComponentStatus = undefined;
      this.uploadServiceAssemblyStatus = undefined;
      this.uploadSharedLibraryStatus = undefined;
    }
  }

  ngOnInit() {
    this.updateComponentDeployInfoFormGroup = this.fb.group({
      name: [
        '',
        [SharedValidator.isKeyPresentInObject(() => this.componentsByName)],
      ],
    });
    this.updateSharedLibraryDeployInfoFormGroup = this.fb.group({
      name: [
        '',
        [
          SharedValidator.isKeyPresentInObject(
            () => this.sharedLibrariesByName
          ),
        ],
      ],
    });
  }

  onFileSelected(file: File) {
    // when using mat-error with material, if there's an error it'll be display
    // only when the control is set to touched and thus we won't have a
    // "real time" feedback, especially when there's only one input
    this.updateComponentDeployInfoFormGroup.get('name').markAsTouched();
    this.updateSharedLibraryDeployInfoFormGroup.get('name').markAsTouched();

    this.componentsService
      .getComponentNameFromZipFile(file)
      .pipe(
        takeUntil(this.onDestroy$),
        tap(x =>
          this.updateComponentDeployInfoFormGroup.get('name').setValue(x)
        ),
        catchError(err => {
          this.notifications.warn(
            'File error',
            `An error occurred while trying to read the component's name from zip file`
          );

          return empty();
        })
      )
      .subscribe();

    this.sharedLibrariesService
      .getSharedLibraryNameFromZipFile(file)
      .takeUntil(this.onDestroy$)
      .do(x =>
        this.updateSharedLibraryDeployInfoFormGroup.get('name').setValue(x)
      )
      .catch(err => {
        this.notifications.warn(
          'File error',
          `An error occurred while trying to read the shared library's name from zip file`
        );

        return Observable.empty();
      })
      .subscribe();
  }

  deploy(
    whatToDeploy: 'component' | 'service-assembly' | 'shared-library',
    file: File
  ) {
    let deployActions: {
      onProgressUpdate: (percentage: number) => void;
      onComplete: () => void;
      actionToDispatch: Action;
    };

    const correlationId = uuid();

    if (whatToDeploy === 'component') {
      deployActions = {
        onProgressUpdate: percentage =>
          (this.uploadComponentStatus = {
            percentage,
          }),
        onComplete: () => this.deployComponent.reset(),
        actionToDispatch: new Containers.DeployComponent({
          correlationId,
          id: this.container.id,
          file,
          name: this.updateComponentDeployInfoFormGroup.get('name').value,
        }),
      };
    } else if (whatToDeploy === 'service-assembly') {
      deployActions = {
        onProgressUpdate: percentage =>
          (this.uploadServiceAssemblyStatus = {
            percentage,
          }),
        onComplete: () => this.deployServiceAssembly.reset(),
        actionToDispatch: new Containers.DeployServiceAssembly({
          correlationId,
          id: this.container.id,
          file,
        }),
      };
    } else if (whatToDeploy === 'shared-library') {
      deployActions = {
        onProgressUpdate: percentage =>
          (this.uploadSharedLibraryStatus = {
            percentage,
          }),
        onComplete: () => this.deploySharedLibrary.reset(),
        actionToDispatch: new Containers.DeploySharedLibrary({
          correlationId,
          id: this.container.id,
          file,
          name: this.updateSharedLibraryDeployInfoFormGroup.get('name').value,
        }),
      };
    }

    this.actions$
      .ofType<HttpProgress>(HttpProgressType)
      .pipe(
        takeUntil(this.onDestroy$),
        filter(action => action.payload.correlationId === correlationId),
        // we want 1 or 0 (first wants exactly one) because of takeUntil
        take(1),
        switchMap(action => action.payload.getProgress()),
        tap(deployActions.onProgressUpdate),
        tap({
          complete: deployActions.onComplete,
        })
      )
      .subscribe();

    this.store$.dispatch(deployActions.actionToDispatch);
  }
}

function hasContainerIdChanged(containerChanges: SimpleChange) {
  const oldContainer = containerChanges.previousValue;
  const newContainer = containerChanges.currentValue;

  if (!oldContainer) {
    return false;
  }

  return oldContainer.id !== newContainer.id;
}
