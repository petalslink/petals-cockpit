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
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import {
  FormErrorStateMatcher,
  getFormErrors,
} from '@shared/helpers/form.helper';
import { IWorkspace } from '@wks/state/workspaces/workspaces.interface';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-workspaces-create',
  templateUrl: './workspaces-create.component.html',
  styleUrls: ['./workspaces-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspacesCreateComponent implements OnInit, OnDestroy {
  onDestroy$ = new Subject<void>();

  msgError: string;

  @Input() workspace: IWorkspace;

  @Input() canCreate: boolean;
  @Input() canFocus = true;
  @Input()
  set msgErrorInput(value: string) {
    this.msgError = value;
    if (this.newWksForm !== undefined) {
      const formValues: { name: string; shortDescription: string } = this
        .newWksForm.value;

      this.newWksForm = this.fb.group({
        name: { value: formValues.name, disabled: false },
        shortDescription: {
          value: formValues.shortDescription,
          disabled: false,
        },
      });
    }
  }

  @Output()
  evtCreate = new EventEmitter<{ name?: string; shortDescription?: string }>();

  newWksForm: FormGroup;

  formErrors = {
    name: '',
    shortDescription: '',
  };

  matcher = new FormErrorStateMatcher();

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.newWksForm = this.fb.group({
      name: [
        '',
        Validators.compose([Validators.required, Validators.maxLength(200)]),
      ],
      shortDescription: '',
    });

    this.reset();

    this.newWksForm.valueChanges
      .pipe(
        takeUntil(this.onDestroy$),
        tap(() => {
          this.formErrors = getFormErrors(this.newWksForm, this.formErrors);
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  reset() {
    this.newWksForm.reset({
      name: this.workspace ? this.workspace.name : '',
      shortDescription: this.workspace ? this.workspace.shortDescription : '',
    });
  }

  doSubmit() {
    const value: { name: string; shortDescription: string } = this.newWksForm
      .value;

    this.evtCreate.emit(value);

    this.newWksForm = this.fb.group({
      name: { value: value.name, disabled: true },
      shortDescription: { value: value.shortDescription, disabled: true },
    });
  }
}
