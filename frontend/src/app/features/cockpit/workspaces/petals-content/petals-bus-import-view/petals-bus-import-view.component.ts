import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { IStore } from './../../../../../shared/interfaces/store.interface';
import { Ui } from './../../../../../shared/state/ui.reducer';
import { CustomValidators } from './../../../../../shared/helpers/custom-validators';
import { IBusInProgressImport } from './../../state/buses-in-progress/bus-in-progress.interface';

@Component({
  selector: 'app-petals-bus-import-view',
  templateUrl: './petals-bus-import-view.component.html',
  styleUrls: ['./petals-bus-import-view.component.scss']
})
export class PetalsBusImportViewComponent implements OnInit {
  public busImportForm: FormGroup;

  constructor(private _store$: Store<IStore>, private _fb: FormBuilder) { }

  ngOnInit() {
    this._store$.dispatch({ type: Ui.SET_TITLES, payload: { titleMainPart1: 'Petals', titleMainPart2: 'Import bus' } });

    // TODO : If dev env, fill the fields
    this.busImportForm = this._fb.group({
      ip: ['', [Validators.required, CustomValidators.isIp]],
      port: ['', [Validators.required, CustomValidators.isPort]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      passphrase: ['', [Validators.required]],
    });
  }

  onSubmit({value, valid}: {value: IBusInProgressImport, valid: boolean}) {
    console.log('submit');
    console.log('is the form valid ?', valid);
    console.log('value of the form ', value);
  }
}
