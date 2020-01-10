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

import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
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

import { IComponentRow } from '@feat/cockpit/workspaces/state/components/components.interface';
import {
  SnackBarDeploymentProgressComponent,
  UploadComponent,
} from '@shared/components/upload/upload.component';
import { ComponentsService } from '@shared/services/components.service';
import {
  HttpProgress,
  HttpProgressType,
} from '@shared/services/http-progress-tracker.service';
import { IStore } from '@shared/state/store.interface';
import { Components } from '@wks/state/components/components.actions';

@Component({
  selector: 'app-su-deployment',
  templateUrl: './su-deployment.component.html',
})
export class SuDeploymentComponent implements OnInit, OnDestroy, OnChanges {
  private onDestroy$ = new Subject<void>();
  private percentage$ = new Subject<number>();

  private snackRef: MatSnackBarRef<SnackBarDeploymentProgressComponent>;

  @Input() component: IComponentRow;

  @ViewChild('deployServiceUnit') deployServiceUnit: UploadComponent;

  serviceUnitUploadProgress: {
    percentage: number;
  };

  isFileParsed = false;

  constructor(
    private store$: Store<IStore>,
    private actions$: Actions,
    private notifications: NotificationsService,
    private componentsService: ComponentsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (hasComponentIdChanged(changes.component)) {
      this.deployServiceUnit.reset();
    }
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  isDeployingSu(type: string) {
    if (type) {
      // to capitalize the first character of every types
      const suTitle = type.replace(/(^\w{1})|(\s{1}\w{1})/, (match: string) =>
        match.toUpperCase()
      );
      this.openSnackBarDeployment(suTitle);
    }
  }

  fileSelected(file: File) {
    if (file) {
      this.componentsService
        .getSuFromZipFile(file)
        .pipe(
          takeUntil(this.onDestroy$),
          tap(_ => {
            this.isFileParsed = true;

            this.store$.dispatch(
              new Components.CleanServiceUnitDeploymentError({
                id: this.component.id,
              })
            );
          }),
          catchError(err => {
            this.notifications.warn(
              'File error',
              `An error occurred while trying to read the service-unit zip file: ${
                err.message
              }`
            );

            this.isFileParsed = false;
            this.deployServiceUnit.reset();

            return EMPTY;
          })
        )
        .subscribe();
    } else {
      this.deployServiceUnit.reset();
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

  deploy(file: File, serviceUnitName: string) {
    const correlationId = uuid();

    this.isDeployingSu('service-unit');

    this.actions$
      .pipe(
        ofType<HttpProgress>(HttpProgressType),
        takeUntil(this.onDestroy$),
        filter(action => action.payload.correlationId === correlationId),
        // we want 1 or 0 (first wants exactly one) because of takeUntil
        take(1),
        switchMap(action => {
          this.deployServiceUnit.reset();
          return action.payload.getProgress();
        }),
        tap(percentage => {
          this.serviceUnitUploadProgress = { percentage };
          this.percentage$.next(percentage);
        }),
        tap({
          complete: () => this.snackRef.dismiss(),
        })
      )
      .subscribe();

    this.store$.dispatch(
      new Components.DeployServiceUnit({
        id: this.component.id,
        file,
        serviceUnitName: serviceUnitName.trim(),
        correlationId,
      })
    );
  }

  getSuDeploymentError() {
    return this.component.errorDeploymentServiceUnit;
  }

  cancelSelectedFile() {
    if (this.deployServiceUnit.selectedFileInformation) {
      this.deployServiceUnit.reset();
    }
  }
}

function hasComponentIdChanged(componentChange: SimpleChange) {
  const oldComponent = componentChange.previousValue;
  const newComponent = componentChange.currentValue;

  return (
    !componentChange.isFirstChange() && oldComponent.id !== newComponent.id
  );
}
