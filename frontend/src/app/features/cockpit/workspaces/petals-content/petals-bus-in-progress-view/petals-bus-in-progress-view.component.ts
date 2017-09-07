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

import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { BusesInProgress } from 'app/features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.actions';
import { IBusImport } from 'app/shared/services/buses.service';
import { Ui } from 'app/shared/state/ui.actions';
import { IStore } from '../../../../../shared/state/store.interface';
import { CustomValidators } from './../../../../../shared/helpers/custom-validators';
import {
  disableAllFormFields,
  formErrorStateMatcher,
  getFormErrors,
} from './../../../../../shared/helpers/form.helper';
import {
  IBusesInProgressTable,
  IBusInProgressRow,
} from './../../state/buses-in-progress/buses-in-progress.interface';
import { getCurrentBusInProgress } from './../../state/buses-in-progress/buses-in-progress.selectors';

@Component({
  selector: 'app-petals-bus-in-progress-view',
  templateUrl: './petals-bus-in-progress-view.component.html',
  styleUrls: ['./petals-bus-in-progress-view.component.scss'],
})
export class PetalsBusInProgressViewComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  busesInProgressTable$: Observable<IBusesInProgressTable>;
  busInProgress$: Observable<IBusInProgressRow>;
  // needed because it is so much easier to use that than an async object in the html
  busInProgress: IBusInProgressRow;

  busImportForm: FormGroup;

  formErrors = {
    ip: '',
    port: '',
    username: '',
    password: '',
    passphrase: '',
  };

  constructor(
    private store$: Store<IStore>,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.store$.dispatch(
      new Ui.SetTitles({
        titleMainPart1: 'Petals',
        titleMainPart2: 'Import bus',
      })
    );

    this.busesInProgressTable$ = this.store$.select(
      state => state.busesInProgress
    );
    this.busInProgress$ = this.store$.select(getCurrentBusInProgress);

    this.createFormImportBus();

    this.route.paramMap
      .takeUntil(this.onDestroy$)
      .map(paramMap => paramMap.get('busInProgressId'))
      .distinctUntilChanged()
      .do(id => this.store$.dispatch(new BusesInProgress.SetCurrent({ id })))
      .finally(() =>
        this.store$.dispatch(new BusesInProgress.SetCurrent({ id: '' }))
      )
      .subscribe();

    this.busInProgress$
      .takeUntil(this.onDestroy$)
      .do(busInProgress => {
        this.busInProgress = busInProgress;

        if (this.busInProgress) {
          this.busImportForm.patchValue({
            ip: busInProgress.ip,
            port: busInProgress.port,
            username: busInProgress.username,
            password: busInProgress.password,
            passphrase: busInProgress.passphrase,
          });

          disableAllFormFields(this.busImportForm);
        }
      })
      .subscribe();
  }

  createFormImportBus() {
    this.busImportForm = this.fb.group({
      ip: ['', Validators.required],
      port: [
        '',
        Validators.compose([Validators.required, CustomValidators.isPort]),
      ],
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      passphrase: ['', [Validators.required]],
    });

    this.busImportForm.valueChanges
      .takeUntil(this.onDestroy$)
      .do(() => {
        this.formErrors = getFormErrors(this.busImportForm, this.formErrors);
      })
      .subscribe();
  }

  createFormErrorStateMatcher(
    control: FormControl,
    formToCheck: FormGroupDirective | NgForm
  ): boolean {
    return formErrorStateMatcher(control, formToCheck);
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  onSubmit({ value }: { value: IBusImport; valid: boolean }) {
    this.store$.dispatch(new BusesInProgress.Post(value));
  }

  discard(busInProgress: IBusInProgressRow) {
    this.store$.dispatch(new BusesInProgress.Delete(busInProgress));
  }

  reset() {
    this.busImportForm.reset();
    this.store$.dispatch(new BusesInProgress.SetCurrent({ id: '' }));
  }
}
