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
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Actions, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { NotificationsService } from 'angular2-notifications';
import { EMPTY, Subject } from 'rxjs';
import {
  catchError,
  filter,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import { ErrorStateMatcher } from '@angular/material/core';
import {
  SnackBarDeploymentProgressComponent,
  UploadComponent,
} from '@shared/components/upload/upload.component';
import {
  ContainersService,
  IArtifactInformations,
} from '@shared/services/containers.service';
import {
  HttpProgress,
  HttpProgressType,
} from '@shared/services/http-progress-tracker.service';
import { IStore } from '@shared/state/store.interface';
import { SharedValidator } from '@shared/validators/shared.validator';
import { Containers } from '@wks/state/containers/containers.actions';
import { IContainerRow } from '@wks/state/containers/containers.interface';
import { ISharedLibrarySimplified } from '@wks/state/shared-libraries/shared-libraries.interface';

@Component({
  selector: 'app-artifacts-deployment',
  templateUrl: './artifacts-deployment.component.html',
  styleUrls: ['./artifacts-deployment.component.scss'],
})
export class ArtifactsDeploymentComponent
  implements OnInit, OnDestroy, OnChanges {
  private onDestroy$ = new Subject<void>();
  private percentage$ = new Subject<number>();

  // should not be used on template
  // not edit by default
  private _currentSlBeingEdited = -1;

  private snackRef: MatSnackBarRef<SnackBarDeploymentProgressComponent>;

  @Input() container: IContainerRow;

  @Input()
  componentsByName: {
    [name: string]: boolean;
  };
  @Input()
  sharedLibrariesByNameAndVersion: {
    [name: string]: boolean;
  };
  @Input()
  serviceAssembliesByName: {
    [name: string]: boolean;
  };

  get currentSlBeingEdited(): number {
    return this._currentSlBeingEdited;
  }

  set currentSlBeingEdited(newSl: number) {
    this._currentSlBeingEdited = newSl;
    this.updateArtifactCompNameFieldStatus();
  }

  @ViewChild('deployArtifact') deployArtifact: UploadComponent;

  updateComponentDeployInfoFormGroup: FormGroup;
  updateServiceAssemblyDeployInfoFormGroup: FormGroup;
  updateSharedLibraryDeployInfoFormGroup: FormGroup;

  compErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (
      control: FormControl,
      form: FormGroupDirective | NgForm
    ): boolean =>
      this.updateComponentDeployInfoFormGroup
        .get('name')
        .hasError('isKeyPresentInObject'),
  };

  saErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (
      control: FormControl,
      form: FormGroupDirective | NgForm
    ): boolean =>
      this.updateServiceAssemblyDeployInfoFormGroup
        .get('name')
        .hasError('isKeyPresentInObject'),
  };

  slErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (
      control: FormControl,
      form: FormGroupDirective | NgForm
    ): boolean =>
      this.updateSharedLibraryDeployInfoFormGroup.hasError(
        'alreadyInContainer'
      ),
  };

  dataSource: MatTableDataSource<ISharedLibrarySimplified> | null;
  displayedColumns: string[] = ['name', 'version', 'status', 'actions'];

  canFocus = true;
  isFileParsed = false;

  slIsInCurrentContainer: boolean[] = null;

  currentSl: { name: string; version: string };

  artifactUploadProgress: {
    percentage: number;
  };

  countSlsNotInContainer: number;

  artifact: IArtifactInformations = { name: '', version: '', type: '' };

  constructor(
    private fb: FormBuilder,
    private store$: Store<IStore>,
    private actions$: Actions,
    private notifications: NotificationsService,
    private containersService: ContainersService,
    private snackBar: MatSnackBar
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (hasContainerIdChanged(changes.container)) {
      this.deployArtifact.reset();
    }
  }

  ngOnInit() {
    this.updateComponentDeployInfoFormGroup = this.fb.group({
      name: [
        '',
        [SharedValidator.isKeyPresentInObject(() => this.componentsByName)],
      ],
      slName: ['', Validators.required],
      slVersion: ['', Validators.required],
    });

    this.updateSharedLibraryDeployInfoFormGroup = this.fb.group(
      {
        name: [''],
        version: [''],
      },
      { validator: this.slNameAndVersionChecker() }
    );

    this.updateServiceAssemblyDeployInfoFormGroup = this.fb.group({
      name: [
        '',
        [
          SharedValidator.isKeyPresentInObject(
            () => this.serviceAssembliesByName
          ),
        ],
      ],
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  getTitle() {
    if (!this.isFileParsed) {
      return 'Artifact Deployment';
    }
    switch (this.artifact.type) {
      case 'component':
        return 'Component Deployment';
      case 'service-assembly':
        return 'Service Assembly Deployment';
      case 'shared-library':
        return 'Shared Library Deployment';
    }
  }

  updateArtifactCompNameFieldStatus() {
    if (this.isEditingSl()) {
      this.updateComponentDeployInfoFormGroup.get('name').disable();
      this.canFocus = false;
    } else {
      this.updateComponentDeployInfoFormGroup.get('name').enable();
      this.canFocus = true;
    }
  }

  isEditingSl() {
    return this.currentSlBeingEdited !== -1;
  }

  updateSlsStatus() {
    this.slIsInCurrentContainer = this.dataSource.data.map(
      sl =>
        !!this.sharedLibrariesByNameAndVersion[JSON.stringify(sl).toLowerCase()]
    );
    this.countSlsNotInContainer = this.slIsInCurrentContainer.filter(
      is => !is
    ).length;
    this.clearSlValidators();
  }

  fileSelected(file: File) {
    this.containersService
      .getArtifactFromZipFile(file)
      .pipe(
        takeUntil(this.onDestroy$),
        tap(artifactFromZip => {
          this.artifact = artifactFromZip;

          switch (artifactFromZip.type) {
            case 'component':
              // when using mat-error with material, if there's an error it'll be display
              // only when the control is set to touched and thus we won't have a
              // "real time" feedback, especially when there's only one input
              this.updateComponentDeployInfoFormGroup.get('name').enable();

              this.updateComponentDeployInfoFormGroup
                .get('name')
                .markAsTouched();

              this.updateComponentDeployInfoFormGroup
                .get('name')
                .setValue(artifactFromZip.name);

              this.countSlsNotInContainer = null;
              this.slIsInCurrentContainer = null;

              this.dataSource = new MatTableDataSource<
                ISharedLibrarySimplified
              >(artifactFromZip.sharedLibraries);

              this.updateSlsStatus();

              this.updateComponentDeployInfoFormGroup.setValue({
                name: this.artifact.name,
                slName: null,
                slVersion: null,
              });

              this.isFileParsed = true;
              break;
            case 'service-assembly':
              this.updateServiceAssemblyDeployInfoFormGroup
                .get('name')
                .markAsTouched();

              this.updateServiceAssemblyDeployInfoFormGroup
                .get('name')
                .setValue(artifactFromZip.name);

              this.isFileParsed = true;
              this.canFocus = true;
              break;
            case 'shared-library':
              ['name', 'version'].forEach(attr =>
                this.updateSharedLibraryDeployInfoFormGroup
                  .get(attr)
                  .markAsTouched()
              );

              this.updateSharedLibraryDeployInfoFormGroup
                .get('name')
                .setValue(artifactFromZip.name);

              this.updateSharedLibraryDeployInfoFormGroup
                .get('version')
                .setValue(artifactFromZip.version);

              this.isFileParsed = true;
              this.canFocus = true;
              break;

            default:
              break;
          }
        }),
        catchError(err => {
          this.notifications.warn(
            'File error',
            `An error occurred while trying to read the artifact zip file.`
          );

          this.isFileParsed = false;
          this.deployArtifact.reset();

          return EMPTY;
        })
      )
      .subscribe();
  }

  isDeployingArtifact(type: string) {
    if (type) {
      // to capitalize the first character of every types
      const titleArtifactType = type.replace(
        /(^\w{1})|(\s{1}\w{1})/,
        (match: string) => match.toUpperCase()
      );
      this.openSnackBarDeployment(titleArtifactType);
    }
  }

  openSnackBarDeployment(titleArtifactType: string) {
    this.snackRef = this.snackBar.openFromComponent(
      SnackBarDeploymentProgressComponent,
      {
        verticalPosition: 'top',
        horizontalPosition: 'center',
        data: {
          titleArtifactType,
          uploadProgress$: this.percentage$.asObservable(),
        },
      }
    );

    this.percentage$.next(0);
  }

  deploy(file: File) {
    let deployActions: {
      onProgressUpdate: (percentage: number) => void;
      onComplete: () => void;
      actionToDispatch: Action;
    };
    const correlationId = uuid();

    this.isDeployingArtifact(this.artifact.type);

    let actionToDispatch: Action = null;

    switch (this.artifact.type) {
      case 'component':
        actionToDispatch = new Containers.DeployComponent({
          correlationId,
          id: this.container.id,
          file,
          name: this.updateComponentDeployInfoFormGroup.get('name').value,
          sharedLibraries: this.dataSource.data,
        });
        break;
      case 'service-assembly':
        actionToDispatch = new Containers.DeployServiceAssembly({
          correlationId,
          id: this.container.id,
          file,
          name: this.updateServiceAssemblyDeployInfoFormGroup.get('name').value,
        });
        break;
      case 'shared-library':
        actionToDispatch = new Containers.DeploySharedLibrary({
          correlationId,
          id: this.container.id,
          file,
          name: this.updateSharedLibraryDeployInfoFormGroup.get('name').value,
          version: this.updateSharedLibraryDeployInfoFormGroup.get('version')
            .value,
        });
        break;
    }

    deployActions = {
      onProgressUpdate: percentage => {
        this.artifactUploadProgress = { percentage };
        this.percentage$.next(percentage);
        this.deployArtifact.reset();
      },
      onComplete: () => {
        this.snackRef.dismiss();
      },
      actionToDispatch,
    };

    this.actions$
      .pipe(
        ofType<HttpProgress>(HttpProgressType),
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

  getArtifactDeploymentError() {
    switch (this.artifact.type) {
      case 'component':
        return this.container.errorDeploymentComponent;
      case 'service-assembly':
        return this.container.errorDeploymentServiceAssembly;
      case 'shared-library':
        return this.container.errorDeploymentSharedLibrary;
    }
  }

  isDisabledDeployArtifact() {
    switch (this.artifact.type) {
      case 'component':
        return (
          this.updateComponentDeployInfoFormGroup.invalid || this.isEditingSl()
        );
      case 'service-assembly':
        return this.updateServiceAssemblyDeployInfoFormGroup.invalid;
      case 'shared-library':
        return this.updateSharedLibraryDeployInfoFormGroup.invalid;
    }
  }

  cancelSelectedFile() {
    this.isFileParsed = false;
    this.canFocus = false;

    switch (this.artifact.type) {
      case 'component':
        this.updateComponentDeployInfoFormGroup.reset();
        this.cancelOverrideSl();
        break;
      case 'service-assembly':
        this.updateServiceAssemblyDeployInfoFormGroup.reset();
        break;
      case 'shared-library':
        this.updateSharedLibraryDeployInfoFormGroup.reset();
        break;
    }
  }

  resetCompForm() {
    this.updateComponentDeployInfoFormGroup.reset({
      name: this.updateComponentDeployInfoFormGroup.get('name').value,
      slName: this.currentSl ? this.currentSl.name : '',
      slVersion: this.currentSl ? this.currentSl.version : '',
    });
  }

  clearSlValidators() {
    this.updateComponentDeployInfoFormGroup.controls[
      'slName'
    ].clearValidators();
    this.updateComponentDeployInfoFormGroup.controls[
      'slVersion'
    ].clearValidators();
  }

  cancelOverrideSl() {
    this.currentSl = this.dataSource.data[this.currentSlBeingEdited];

    if (this.currentSl === null) {
      this.deleteSharedLibrary(this.currentSlBeingEdited);
      this.resetCompForm();
    }
    this.clearSlValidators();

    this.currentSlBeingEdited = -1;
  }

  slNameAndVersionChecker(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      const nameAndVersion = {
        name: control.get('name').value,
        version: control.get('version').value,
      };
      if (
        this.sharedLibrariesByNameAndVersion[
          JSON.stringify(nameAndVersion).toLowerCase()
        ]
      ) {
        return {
          alreadyInContainer: true,
        };
      }
      return null;
    };
  }

  deleteSharedLibrary(index: number) {
    this.dataSource.data = this.dataSource.data.filter((el, i) => i !== index);

    this.updateSlsStatus();
  }

  editSharedLibrary(index: number) {
    this.currentSlBeingEdited = index;

    this.currentSl = {
      name: this.dataSource.data[index].name,
      version: this.dataSource.data[index].version,
    };
  }

  updateSharedLibrary() {
    this.dataSource.data = [
      ...this.dataSource.data.slice(0, this.currentSlBeingEdited),
      this.currentSl,
      ...this.dataSource.data.slice(this.currentSlBeingEdited + 1),
    ];

    this.currentSl = null;

    this.currentSlBeingEdited = -1;
    this.updateSlsStatus();
  }

  addNewSharedLibrary() {
    this.currentSlBeingEdited = this.dataSource.data.length;

    this.currentSl = {
      name: '',
      version: '',
    };

    this.dataSource.data = [...this.dataSource.data, null];

    this.resetCompForm();
    this.clearSlValidators();
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
