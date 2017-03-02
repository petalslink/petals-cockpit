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

import { Component, Input, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MdInputContainer } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { IStore } from './../../../../../shared/interfaces/store.interface';
import { IBusesInProgressTable } from './../../state/buses-in-progress/buses-in-progress.interface';
import { IBusInProgressRow, IBusInProgressImport } from './../../state/buses-in-progress/bus-in-progress.interface';
import { Ui } from './../../../../../shared/state/ui.reducer';
import { BusesInProgress } from './../../state/buses-in-progress/buses-in-progress.reducer';
import { getCurrentBusInProgressEvenIfNull } from './../../state/buses-in-progress/buses-in-progress.selectors';
import { CustomValidators } from './../../../../../shared/helpers/custom-validators';
import { getFormErrors, disableAllFormFields } from './../../../../../shared/helpers/form.helper';

@Component({
  selector: 'app-petals-bus-in-progress-view',
  templateUrl: './petals-bus-in-progress-view.component.html',
  styleUrls: ['./petals-bus-in-progress-view.component.scss']
})
export class PetalsBusInProgressViewComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() isImportingBus = false;
  @ViewChild('ipInput') ipInput: MdInputContainer;

  public busesInProgressTable$: Observable<IBusesInProgressTable>;
  public busInProgress$: Observable<IBusInProgressRow>;
  public busInProgress: IBusInProgressRow;

  public busImportForm: FormGroup;
  private busImportFormSubscription: Subscription;

  private routeSub: Subscription;
  private busInProgressSub: Subscription;

  private formErrors = {
    'ip': '',
    'port': '',
    'username': '',
    'password': '',
    'passphrase': ''
  };

  constructor(private store$: Store<IStore>, private fb: FormBuilder, private route: ActivatedRoute) { }

  ngOnInit() {
    this.store$.dispatch({ type: Ui.SET_TITLES, payload: { titleMainPart1: 'Petals', titleMainPart2: 'Import bus' } });

    this.busesInProgressTable$ = this.store$.select(state => state.busesInProgress);
    this.busInProgress$ = this.store$.let(getCurrentBusInProgressEvenIfNull());

    this.createFormImportBus();

    this.routeSub = this.route
      .params
      .do(({ busInProgressId }: { busInProgressId: string }) => {
        // displays the last thing in url if no params (bug ?)
        // TODO clean that, it's not the correct way to handle empty form versus completed form
        busInProgressId = (busInProgressId === 'buses-in-progress' ? '' : busInProgressId);

        this.store$.dispatch({ type: BusesInProgress.SET_SELECTED_BUS_IN_PROGRESS, payload: busInProgressId });
      })
      .subscribe();

    this.busInProgressSub = this.busInProgress$
      .do(busInProgress => {
        this.busInProgress = busInProgress;

        if (this.busInProgress !== null) {
          this.busImportForm.patchValue({
            ip: busInProgress.ip,
            port: busInProgress.port,
            username: busInProgress.username,
            password: busInProgress.password,
            passphrase: busInProgress.passphrase
          });

          disableAllFormFields(this.busImportForm);
        }
      })
      .subscribe();
  }

  createFormImportBus() {
    this.busImportForm = this.fb.group({
      ip: ['', Validators.compose([Validators.required])],
      port: ['', Validators.compose([Validators.required, CustomValidators.isPort])],
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      passphrase: ['', [Validators.required]],
    });

    this.busImportFormSubscription = this
      .busImportForm
      .valueChanges
      .do(data => {
        this.formErrors = getFormErrors(this.busImportForm, this.formErrors, data);
      })
      .subscribe();
  }

  ngAfterViewInit() {
    if (!this.isImportingBus) {
      this.ipInput._focusInput();
    }
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
    this.busImportFormSubscription.unsubscribe();
    this.busInProgressSub.unsubscribe();
  }

  onSubmit({ value }: { value: IBusInProgressImport, valid: boolean }) {
    this.store$.dispatch({ type: BusesInProgress.POST_BUS_IN_PROGRESS, payload: value });
  }

  discard(busInProgress: IBusInProgressRow) {
    this.store$.dispatch({ type: BusesInProgress.DELETE_BUS_IN_PROGRESS, payload: busInProgress });
  }

  reset() {
    this.busImportForm.reset();
  }
}
