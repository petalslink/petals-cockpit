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
import { ActivatedRoute, Router } from '@angular/router';
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
import { arrayEquals } from 'app/shared/helpers/shared.helper';

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
  private redirectSub: Subscription;
  private busInProgressSub: Subscription;

  private formErrors = {
    'ip': '',
    'port': '',
    'username': '',
    'password': '',
    'passphrase': ''
  };

  constructor(
    private store$: Store<IStore>,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.store$.dispatch({ type: Ui.SET_TITLES, payload: { titleMainPart1: 'Petals', titleMainPart2: 'Import bus' } });

    this.busesInProgressTable$ = this.store$.select(state => state.busesInProgress);
    this.busInProgress$ = this.store$.let(getCurrentBusInProgressEvenIfNull());

    this.createFormImportBus();

    const id = this.route.params
      .map(({ busInProgressId }: { busInProgressId: string }) => busInProgressId)
      // displays the last thing in url if no params (bug ?)
      // TODO clean that, it's not the correct way to handle empty form versus completed form
      .map(bId => bId === 'buses-in-progress' ? '' : bId)
      .distinctUntilChanged();

    this.routeSub = id
      .do(bId => this.store$.dispatch({ type: BusesInProgress.SET_SELECTED_BUS_IN_PROGRESS, payload: bId }))
      .subscribe();

    // takes care of redirecting to the right URL after the shown bus in progress is deleted
    // this is here because it only makes sense if we are on this page for the given bus
    this.redirectSub = id
      // only if we currently are on a given bus
      .filter(bId => !!bId)
      .switchMap(bId => this.store$
        // when either the bus in progress is deleted or it became a real bus
        // (note: this can happen in two passes)
        .select(state => [!!state.busesInProgress.byId[bId], !!state.buses.byId[bId]])
        .distinctUntilChanged(arrayEquals)
        // only interested in deleted bus in progress
        .filter(([bip, _]) => !bip)
        .do(([_, bus]) => {
          if (bus) {
            this.router.navigate(['/workspaces', this.route.snapshot.params.workspaceId, 'petals', 'buses', bId]);
          } else {
            this.router.navigate(['/workspaces', this.route.snapshot.params.workspaceId]);
          }
        })
      ).subscribe();

    this.busInProgressSub = this.busInProgress$
      .do(busInProgress => {
        this.busInProgress = busInProgress;

        if (this.busInProgress) {
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
    this.redirectSub.unsubscribe();
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
