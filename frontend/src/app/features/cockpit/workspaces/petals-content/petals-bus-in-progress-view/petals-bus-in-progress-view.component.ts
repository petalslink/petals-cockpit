import { Component, Input, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MdInputContainer } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { IStore } from './../../../../../shared/interfaces/store.interface';
import { IBusesInProgressTable } from './../../state/buses-in-progress/buses-in-progress.interface';
import { IBusInProgress, IBusInProgressRow, IBusInProgressImport } from './../../state/buses-in-progress/bus-in-progress.interface';
import { Ui } from './../../../../../shared/state/ui.reducer';
import { BusesInProgress } from './../../state/buses-in-progress/buses-in-progress.reducer';
import { getCurrentBusInProgressEvenIfNull } from './../../state/buses-in-progress/buses-in-progress.selectors';
import { environment } from './../../../../../../environments/environment.dev-e2e';
import { CustomValidators } from './../../../../../shared/helpers/custom-validators';
import { getFormErrors, enableAllFormFields, disableAllFormFields } from './../../../../../shared/helpers/form.helper';

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
  private _busImportFormSubscription: Subscription;

  private _routeSub: Subscription;

  private formErrors = {
    'ip': '',
    'port': '',
    'username': '',
    'password': '',
    'passphrase': ''
  };

  constructor(private _store$: Store<IStore>, private _fb: FormBuilder, private _route: ActivatedRoute) { }

  ngOnInit() {
    this._store$.dispatch({ type: Ui.SET_TITLES, payload: { titleMainPart1: 'Petals', titleMainPart2: 'Import bus' } });

    this.busesInProgressTable$ = this._store$.select(state => state.busesInProgress);
    this.busInProgress$ = this._store$.let(getCurrentBusInProgressEvenIfNull());

    this.createFormImportBus();

    this._routeSub = this._route
      .params
      .map(({ busInProgressId }: { busInProgressId: string }) => {
        // displays the last thing in url if no params (bug ?)
        busInProgressId = (busInProgressId === 'buses-in-progress' ? '' : busInProgressId);

        this._store$.dispatch({ type: BusesInProgress.SET_SELECTED_BUS_IN_PROGRESS, payload: busInProgressId });
      })
      .subscribe();

    // TODO : there's a small bug when retrieving values :
    // the label is not floating and is in front of our text
    // there's a PR ongoing to fix that : https://github.com/angular/material2/pull/2443
    // and an issue https://github.com/angular/material2/issues/2441
    // TODO : Unsubscribe
    this.busInProgress$
      .filter(busInProgress => typeof busInProgress !== 'undefined')
      .map(busInProgress => {
        this.busInProgress = busInProgress;

        if (environment.mock && this.busInProgress === null) {
          enableAllFormFields(this.busImportForm);
        } else if (this.busInProgress !== null) {
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
    this.busImportForm = this._fb.group({
      ip: ['', Validators.compose([Validators.required, CustomValidators.isIp])],
      port: ['', Validators.compose([Validators.required, CustomValidators.isPort])],
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      passphrase: ['', [Validators.required]],
    });

    this._busImportFormSubscription = this
      .busImportForm
      .valueChanges
      .map(data => {
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
    this._routeSub.unsubscribe();
    this._busImportFormSubscription.unsubscribe();
  }

  onSubmit({value, valid}: { value: IBusInProgressImport, valid: boolean }) {
    if (this.busImportForm.valid) {
      this._store$.dispatch({ type: BusesInProgress.POST_BUS_IN_PROGRESS, payload: value });
    }
  }

  reset() {
    this.busImportForm.reset();
  }
}
