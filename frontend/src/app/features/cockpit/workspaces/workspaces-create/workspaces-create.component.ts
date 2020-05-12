/**
 * Copyright (C) 2017-2020 Linagora
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

import { Store } from '@ngrx/store';
import { CustomValidators } from '@shared/helpers/custom-validators';
import {
  FormErrorStateMatcher,
  getFormErrors,
} from '@shared/helpers/form.helper';
import { IStore } from '@shared/state/store.interface';
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

  @Input() canCreate: boolean;
  @Input() canFocus = true;
  @Input()
  set msgErrorInput(value: string) {
    this.msgError = value;
    if (this.newWksFormGroup !== undefined) {
      const formValues: {
        workspaceName: string;
        shortDescription: string;
      } = this.newWksFormGroup.value;

      this.newWksFormGroup = this.fb.group({
        workspaceName: {
          value: formValues.workspaceName,
          disabled: false,
        },
        shortDescription: {
          value: formValues.shortDescription,
          disabled: false,
        },
      });
    }
  }

  @Output()
  evtCreate = new EventEmitter<{ name?: string; shortDescription?: string }>();

  newWksFormGroup: FormGroup;

  formErrors = {
    workspaceName: '',
    shortDescription: '',
  };

  matcher = new FormErrorStateMatcher();

  constructor(private fb: FormBuilder, private store$: Store<IStore>) {}

  ngOnInit() {
    this.newWksFormGroup = this.fb.group({
      workspaceName: [
        '',
        Validators.compose([Validators.required, Validators.maxLength(100)]),
        CustomValidators.existingWorkspaceWithSimilarNameValidator(this.store$),
      ],
      shortDescription: '',
    });

    this.reset();

    this.newWksFormGroup.valueChanges
      .pipe(
        takeUntil(this.onDestroy$),
        tap(() => {
          this.formErrors = getFormErrors(
            this.newWksFormGroup,
            this.formErrors
          );
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  reset() {
    this.newWksFormGroup.reset({
      workspaceName: '',
      shortDescription: '',
    });
  }

  doSubmit() {
    const value: { name: string; shortDescription: string } = {
      name: this.newWksFormGroup.value.workspaceName,
      shortDescription: this.newWksFormGroup.value.shortDescription,
    };

    this.evtCreate.emit(value);

    this.newWksFormGroup = this.fb.group({
      workspaceName: { value: value.name, disabled: true },
      shortDescription: { value: value.shortDescription, disabled: true },
    });
  }
}
