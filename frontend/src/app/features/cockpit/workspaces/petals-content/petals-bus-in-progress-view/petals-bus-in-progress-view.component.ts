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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { BusesInProgress } from 'app/features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.actions';
import { IBusInProgressRow } from 'app/features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.interface';
import { getCurrentBusInProgress } from 'app/features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.selectors';
import { CustomValidators } from 'app/shared/helpers/custom-validators';
import {
  disableAllFormFields,
  FormErrorStateMatcher,
  getFormErrors,
} from 'app/shared/helpers/form.helper';
import { assert } from 'app/shared/helpers/shared.helper';
import { deletable, IDeletable } from 'app/shared/operators/deletable.operator';
import { BusesService, IBusImport } from 'app/shared/services/buses.service';
import { IStore } from 'app/shared/state/store.interface';
import { Ui } from 'app/shared/state/ui.actions';

@Component({
  selector: 'app-petals-bus-in-progress-view',
  templateUrl: './petals-bus-in-progress-view.component.html',
  styleUrls: ['./petals-bus-in-progress-view.component.scss'],
})
export class PetalsBusInProgressViewComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();
  private newImportData: { isImporting: boolean; error: string };

  // needed because it is so much easier to use that than an async object in the html
  private busInProgress: IDeletable<IBusInProgressRow>;

  busImportForm: FormGroup;

  formErrors = {
    ip: '',
    port: '',
    username: '',
    password: '',
    passphrase: '',
  };

  matcher = new FormErrorStateMatcher();

  constructor(
    private store$: Store<IStore>,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private busesService: BusesService
  ) {}

  ngOnInit() {
    this.store$.dispatch(
      new Ui.SetTitles({
        titleMainPart1: 'Petals',
        titleMainPart2: 'Import bus',
      })
    );

    this.store$
      .select(state => state.busesInProgress)
      .pipe(
        takeUntil(this.onDestroy$),
        tap(bip => {
          if (!bip.selectedBusInProgressId) {
            this.newImportData = {
              isImporting: bip.isImportingBus,
              error: bip.importBusError,
            };
          }
        })
      )
      .subscribe();

    this.createFormImportBus();

    this.store$
      .select(getCurrentBusInProgress)
      .pipe(
        deletable,
        takeUntil(this.onDestroy$),
        tap(busInProgress => {
          this.busInProgress = busInProgress;

          if (this.busInProgress) {
            this.busImportForm.patchValue({
              ip: busInProgress.value.ip,
              port: busInProgress.value.port,
              username: busInProgress.value.username,
              password: busInProgress.value.password,
              passphrase: busInProgress.value.passphrase,
            });

            disableAllFormFields(this.busImportForm);
          }
        })
      )
      .subscribe();
  }

  createFormImportBus() {
    const {
      ip,
      port,
      username,
    } = this.busesService.getImportBusFormSecureParts();

    this.busImportForm = this.fb.group({
      ip: [ip, Validators.required],
      port: [
        port,
        Validators.compose([Validators.required, CustomValidators.isPort]),
      ],
      username: [username, [Validators.required]],
      password: ['', [Validators.required]],
      passphrase: ['', [Validators.required]],
    });

    this.busImportForm.valueChanges
      .pipe(
        takeUntil(this.onDestroy$),
        tap(() => {
          this.formErrors = getFormErrors(this.busImportForm, this.formErrors);
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  onSubmit({ value }: { value: IBusImport; valid: boolean }) {
    assert(this.isNewBus());
    this.store$.dispatch(new BusesInProgress.Post(value));
  }

  discardSelectedBus({ retry }: { retry: boolean } = { retry: false }) {
    assert(this.isSelectedBus());

    this.store$.dispatch(new BusesInProgress.Delete(this.busInProgress.value));

    if (retry) {
      this.saveImportDetailsAndRetry();
    }
  }

  private saveImportDetailsAndRetry() {
    this.busesService.setImportBusFormSecureParts({
      ip: this.busImportForm.get('ip').value,
      port: this.busImportForm.get('port').value,
      username: this.busImportForm.get('username').value,
    });

    this.router.navigate(['../'], { relativeTo: this.route });
  }

  reset() {
    assert(this.isNewBus());
    this.busImportForm.reset();
    this.store$.dispatch(new BusesInProgress.ResetImport());
  }

  isStillImporting() {
    if (this.isSelectedBus()) {
      return !this.busInProgress.value.importError;
    } else if (this.isNewBus()) {
      return this.newImportData.isImporting;
    } else {
      assert(false, 'impossible');
      return false;
    }
  }

  isSelectedBus() {
    return !!this.busInProgress;
  }

  isNewBus() {
    return !!this.newImportData;
  }

  newBusData() {
    assert(this.isNewBus());
    return this.newImportData;
  }

  selectedBus() {
    assert(this.isSelectedBus());
    return this.busInProgress.value;
  }

  isSelectedBusDeleted() {
    assert(this.isSelectedBus());
    return this.busInProgress.isDeleted;
  }

  getError() {
    if (this.isSelectedBus()) {
      return this.busInProgress.value.importError;
    } else if (this.isNewBus()) {
      return this.newImportData.error;
    } else {
      assert(false, 'impossible');
      return undefined;
    }
  }
}
