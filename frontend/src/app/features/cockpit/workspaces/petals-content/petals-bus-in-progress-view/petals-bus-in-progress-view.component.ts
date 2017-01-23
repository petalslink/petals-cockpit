import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { IStore } from './../../../../../shared/interfaces/store.interface';
import { Ui } from './../../../../../shared/state/ui.reducer';
import { CustomValidators } from './../../../../../shared/helpers/custom-validators';
import { IBusInProgress, IBusInProgressRow, IBusInProgressImport } from './../../state/buses-in-progress/bus-in-progress.interface';
import { environment } from './../../../../../../environments/environment.dev-e2e';
import { BusesInProgress } from './../../state/buses-in-progress/buses-in-progress.reducer';
import { getCurrentBusInProgressEvenIfNull } from './../../state/buses-in-progress/buses-in-progress.selectors';
import { IBusesInProgressTable } from './../../state/buses-in-progress/buses-in-progress.interface';

@Component({
  selector: 'app-petals-bus-in-progress-view',
  templateUrl: './petals-bus-in-progress-view.component.html',
  styleUrls: ['./petals-bus-in-progress-view.component.scss']
})
export class PetalsBusInProgressViewComponent implements OnInit, OnDestroy {
  public busesInProgressTable$: Observable<IBusesInProgressTable>;
  public busInProgress$: Observable<IBusInProgressRow>;
  public busInProgress: IBusInProgressRow;

  public busImportForm: FormGroup;

  private _routeSub: Subscription;

  formErrors = {
    'ip': '',
    'port': '',
    'username': '',
    'password': '',
    'passphrase': ''
  };
  validationMessages = {
    'ip': {
      'required': 'Required !',
      'isIp': 'Invalid IP format'
    },
    'port': {
      'required': 'Required !',
      'isPort': 'Invalid port format. Should be 0 <= port <= 65535'
    },
    'username': {
      'required': 'Required !'
    },
    'password': {
      'required': 'Required !'
    },
    'passphrase': {
      'required': 'Required !'
    }
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

        let ip, port, username, password, passphrase;

        if (environment.mock && this.busInProgress === null) {
          // if dev env + no busInProgressId : Fill the form with random data
          // ip = '192.168.1.1';
          // port = '2000';
          // username = 'admin';
          // password = 'admin';
          // passphrase = 'somePassphrase';

          this.busImportForm.controls['ip'].enable();
          this.busImportForm.controls['port'].enable();
          this.busImportForm.controls['username'].enable();
          this.busImportForm.controls['password'].enable();
          this.busImportForm.controls['passphrase'].enable();
        } else if (this.busInProgress !== null) {
          ip = busInProgress.ip;
          port = busInProgress.port;
          username = busInProgress.username;
          password = busInProgress.password;
          passphrase = busInProgress.passphrase;

          this.busImportForm.controls['ip'].disable();
          this.busImportForm.controls['port'].disable();
          this.busImportForm.controls['username'].disable();
          this.busImportForm.controls['password'].disable();
          this.busImportForm.controls['passphrase'].disable();
        }

        this.busImportForm.patchValue({ ip });
        this.busImportForm.patchValue({ port });
        this.busImportForm.patchValue({ username });
        this.busImportForm.patchValue({ password });
        this.busImportForm.patchValue({ passphrase });
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

    this.busImportForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
  }

  onValueChanged(data?: any) {
    const form = this.busImportForm;
    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  ngOnDestroy() {
    this._routeSub.unsubscribe();
  }

  onSubmit({value, valid}: { value: IBusInProgressImport, valid: boolean }) {
    this._store$.dispatch({ type: BusesInProgress.POST_BUS_IN_PROGRESS, payload: value });
  }
}
