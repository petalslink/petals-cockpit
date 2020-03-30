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
import { ContainersService } from '@shared/services/containers.service';
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

  artifact: DeploymentArtifact;

  constructor(
    private fb: FormBuilder,
    private store$: Store<IStore>,
    private actions$: Actions,
    private notifications: NotificationsService,
    private containersService: ContainersService,
    private snackBar: MatSnackBar
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.container && hasContainerIdChanged(changes.container)) {
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
        name: '',
        version: '',
      },
      { validator: this.slNameAndVersionChecker() }
    );

    this.updateServiceAssemblyDeployInfoFormGroup = this.fb.group({
      name: '',
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  getTitle() {
    if (!this.isFileParsed) {
      return 'Artifact Deployment';
    } else {
      return this.artifact.getTitle();
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
    if (file) {
      this.containersService
        .getArtifactFromZipFile(file)
        .pipe(
          takeUntil(this.onDestroy$),
          tap(artifactFromZip => {
            switch (artifactFromZip.type) {
              case 'component':
                this.artifact = new Comp(
                  this,
                  artifactFromZip.name,
                  artifactFromZip.sharedLibraries
                );
                break;
              case 'service-assembly':
                this.artifact = new Sa(this, artifactFromZip.name);
                break;
              case 'shared-library':
                this.artifact = new Sl(
                  this,
                  artifactFromZip.name,
                  artifactFromZip.version
                );
                break;

              default:
                break;
            }

            this.artifact.init();
            this.store$.dispatch(
              new Containers.CleanArtifactDeploymentError({
                id: this.container.id,
              })
            );
          }),
          catchError(err => {
            this.notifications.warn(
              'File error',
              `An error occurred while trying to read the artifact zip file: ${
                err.message
              }`
            );

            this.isFileParsed = false;
            this.deployArtifact.reset();

            return EMPTY;
          })
        )
        .subscribe();
    } else {
      this.deployArtifact.reset();
    }
  }

  openSnackBarDeployment(type: string) {
    this.snackRef = this.snackBar.openFromComponent(
      SnackBarDeploymentProgressComponent,
      {
        verticalPosition: 'top',
        horizontalPosition: 'center',
        data: {
          type,
          uploadProgress$: this.percentage$.asObservable(),
        },
      }
    );

    this.percentage$.next(0);
  }

  deploy(file: File) {
    const correlationId = uuid();

    this.artifact.isDeployingArtifact();

    const actionToDispatch: Action = this.artifact.fetchActionToDispatch(
      file,
      correlationId
    );

    const deployActions = {
      onProgressUpdate: (percentage: number) => {
        this.artifactUploadProgress = { percentage };
        this.percentage$.next(percentage);
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
        switchMap(action => {
          this.deployArtifact.reset();
          return action.payload.getProgress();
        }),
        tap(deployActions.onProgressUpdate),
        tap({
          complete: deployActions.onComplete,
        })
      )
      .subscribe();

    this.store$.dispatch(deployActions.actionToDispatch);
  }

  getArtifactDeploymentError() {
    if (this.artifact) {
      return this.artifact.getArtifactDeploymentError();
    }
  }

  isDisabledDeployArtifact() {
    if (this.artifact) {
      return this.artifact.isDisabledDeployArtifact();
    }
  }

  cancelSelectedFile() {
    this.isFileParsed = false;
    this.canFocus = false;

    if (this.artifact) {
      this.artifact.cancelSelectedFile();
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

function hasContainerIdChanged(containerChange: SimpleChange) {
  const oldContainer = containerChange.previousValue;
  const newContainer = containerChange.currentValue;

  return (
    !containerChange.isFirstChange() && oldContainer.id !== newContainer.id
  );
}

abstract class DeploymentArtifact {
  protected constructor(
    readonly parent: ArtifactsDeploymentComponent,
    readonly type: string,
    readonly name: string,
    readonly version?: string
  ) {}
  abstract init(): void;
  abstract getTitle(): string;
  abstract getArtifactDeploymentError(): string;
  abstract isDisabledDeployArtifact(): boolean;
  abstract cancelSelectedFile(): void;
  abstract fetchActionToDispatch(file: File, correlationId: string): Action;
  isDeployingArtifact() {
    if (this.type) {
      // to capitalize the first character of every types
      const titleArtifactType = this.type.replace(
        /(^\w{1})|(\s{1}\w{1})/,
        (match: string) => match.toUpperCase()
      );
      this.parent.openSnackBarDeployment(titleArtifactType);
    }
  }
}

class Comp extends DeploymentArtifact {
  constructor(
    parent: ArtifactsDeploymentComponent,
    name: string,
    readonly sharedLibraries: ISharedLibrarySimplified[]
  ) {
    super(parent, 'component', name);
  }

  init() {
    // when using mat-error with material, if there's an error it'll be display
    // only when the control is set to touched and thus we won't have a
    // "real time" feedback, especially when there's only one input
    this.parent.updateComponentDeployInfoFormGroup.get('name').enable();

    this.parent.updateComponentDeployInfoFormGroup.get('name').markAsTouched();

    this.parent.updateComponentDeployInfoFormGroup
      .get('name')
      .setValue(this.name);

    this.parent.countSlsNotInContainer = null;
    this.parent.slIsInCurrentContainer = null;

    this.parent.dataSource = new MatTableDataSource<ISharedLibrarySimplified>(
      this.sharedLibraries
    );

    this.parent.updateSlsStatus();

    this.parent.updateComponentDeployInfoFormGroup.setValue({
      name: this.name,
      slName: null,
      slVersion: null,
    });

    this.parent.isFileParsed = true;
  }

  getTitle() {
    return 'Component Deployment';
  }

  getArtifactDeploymentError() {
    return this.parent.container.errorDeploymentComponent;
  }

  isDisabledDeployArtifact() {
    return (
      this.parent.updateComponentDeployInfoFormGroup.invalid ||
      this.parent.isEditingSl()
    );
  }

  cancelSelectedFile() {
    this.parent.updateComponentDeployInfoFormGroup.reset();
    this.parent.cancelOverrideSl();
  }

  fetchActionToDispatch(file: File, correlationId: string) {
    return new Containers.DeployComponent({
      correlationId,
      id: this.parent.container.id,
      file,
      name: this.parent.updateComponentDeployInfoFormGroup.get('name').value,
      sharedLibraries: this.parent.dataSource.data,
    });
  }
}

class Sa extends DeploymentArtifact {
  constructor(parent: ArtifactsDeploymentComponent, name: string) {
    super(parent, 'service-assembly', name);
  }

  init() {
    this.parent.updateServiceAssemblyDeployInfoFormGroup
      .get('name')
      .markAsTouched();

    this.parent.updateServiceAssemblyDeployInfoFormGroup
      .get('name')
      .setValue(this.name);

    this.parent.isFileParsed = true;
    this.parent.canFocus = true;
  }

  getTitle() {
    return 'Service Assembly Deployment';
  }

  getArtifactDeploymentError() {
    return this.parent.container.errorDeploymentServiceAssembly;
  }

  isDisabledDeployArtifact() {
    return this.parent.updateServiceAssemblyDeployInfoFormGroup.invalid;
  }

  cancelSelectedFile() {
    this.parent.updateServiceAssemblyDeployInfoFormGroup.reset();
  }

  fetchActionToDispatch(file: File, correlationId: string) {
    return new Containers.DeployServiceAssembly({
      correlationId,
      id: this.parent.container.id,
      file,
      name: this.parent.updateServiceAssemblyDeployInfoFormGroup.get('name')
        .value,
    });
  }
}

class Sl extends DeploymentArtifact {
  constructor(
    parent: ArtifactsDeploymentComponent,
    name: string,
    version: string
  ) {
    super(parent, 'shared-library', name, version);
  }

  init() {
    ['name', 'version'].forEach(attr =>
      this.parent.updateSharedLibraryDeployInfoFormGroup
        .get(attr)
        .markAsTouched()
    );

    this.parent.updateSharedLibraryDeployInfoFormGroup
      .get('name')
      .setValue(this.name);

    this.parent.updateSharedLibraryDeployInfoFormGroup
      .get('version')
      .setValue(this.version);

    this.parent.isFileParsed = true;
    this.parent.canFocus = true;
  }

  getTitle() {
    return 'Shared Library Deployment';
  }

  getArtifactDeploymentError() {
    return this.parent.container.errorDeploymentSharedLibrary;
  }

  isDisabledDeployArtifact() {
    return this.parent.updateSharedLibraryDeployInfoFormGroup.invalid;
  }

  cancelSelectedFile() {
    this.parent.updateSharedLibraryDeployInfoFormGroup.reset();
  }

  fetchActionToDispatch(file: File, correlationId: string) {
    return new Containers.DeploySharedLibrary({
      correlationId,
      id: this.parent.container.id,
      file,
      name: this.parent.updateSharedLibraryDeployInfoFormGroup.get('name')
        .value,
      version: this.parent.updateSharedLibraryDeployInfoFormGroup.get('version')
        .value,
    });
  }
}
