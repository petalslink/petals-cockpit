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
  OnDestroy,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MdInputContainer } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { IStore } from '../../../../../shared/state/store.interface';
import {
  IBusesInProgressTable,
  IBusInProgressRow,
} from './../../state/buses-in-progress/buses-in-progress.interface';

import { getCurrentBusInProgressOrNull } from './../../state/buses-in-progress/buses-in-progress.selectors';
import { CustomValidators } from './../../../../../shared/helpers/custom-validators';
import {
  getFormErrors,
  disableAllFormFields,
} from './../../../../../shared/helpers/form.helper';

import { isLargeScreen } from 'app/shared/state/ui.selectors';
import { IBusImport } from 'app/shared/services/buses.service';
import { Ui } from 'app/shared/state/ui.actions';
import { BusesInProgress } from 'app/features/cockpit/workspaces/state/buses-in-progress/buses-in-progress.actions';

@Component({
  selector: 'app-petals-bus-in-progress-view',
  templateUrl: './petals-bus-in-progress-view.component.html',
  styleUrls: ['./petals-bus-in-progress-view.component.scss'],
})
export class PetalsBusInProgressViewComponent
  implements OnInit, OnDestroy, AfterViewInit {
  private onDestroy$ = new Subject<void>();

  @ViewChild('ipInput') ipInput: MdInputContainer;

  public busesInProgressTable$: Observable<IBusesInProgressTable>;
  public busInProgress$: Observable<IBusInProgressRow>;
  // needed because it is so much easier to use that than an async object in the html
  public busInProgress: IBusInProgressRow;

  public busImportForm: FormGroup;

  public formErrors = {
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
    this.busInProgress$ = this.store$.let(getCurrentBusInProgressOrNull);

    this.createFormImportBus();

    this.route.paramMap
      .takeUntil(this.onDestroy$)
      .map(paramMap => paramMap.get('busInProgressId'))
      .distinctUntilChanged()
      .do(id => this.store$.dispatch(new BusesInProgress.SetCurrent({ id })))
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
      .do(data => {
        this.formErrors = getFormErrors(
          this.busImportForm,
          this.formErrors,
          data
        );
      })
      .subscribe();
  }

  ngAfterViewInit() {
    this.store$
      .let(isLargeScreen)
      .first()
      .filter(ss => ss)
      .do(_ => this.ipInput._focusInput())
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();

    this.store$.dispatch(new BusesInProgress.SetCurrent({ id: '' }));
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
