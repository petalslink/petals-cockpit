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
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { IStore } from '@shared/state/store.interface';
import { ISettings } from '@shared/state/ui.interface';

import { Ui } from '@shared/state/ui.actions';

@Component({
  selector: 'app-settings-theme-color',
  templateUrl: './settings-theme-color.component.html',
  styleUrls: ['./settings-theme-color.component.scss'],
})
export class SettingsThemeColorComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  settings: ISettings;
  selected: string;

  themes = [
    { value: 'DEFAULT-THEME', label: 'Petals' },
    { value: 'BLUE-THEME', label: 'Blue' },
    { value: 'DARK-BLUE-THEME', label: 'Dark Blue' },
    { value: 'BLUE-GREY-THEME', label: 'Blue Grey' },
    { value: 'GREEN-THEME', label: 'Green' },
    { value: 'PURPLE-THEME', label: 'Purple' },
    { value: 'NATURE-THEME', label: 'Nature' },
    { value: 'MATERIAL-THEME', label: 'Material' },
    { value: 'UNICORN-THEME', label: 'Unicorn' },
  ];

  themesFormGroup: FormGroup;

  constructor(private store$: Store<IStore>, private fb: FormBuilder) {}

  ngOnInit() {
    this.store$
      .select(state => state.ui.settings)
      .pipe(
        takeUntil(this.onDestroy$),
        tap(settings => {
          this.settings = settings;
        })
      )
      .subscribe();

    this.themesFormGroup = this.fb.group({ theme: this.settings.theme });

    this.themesFormGroup.valueChanges
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(value => this.onThemeSelect({ value: value.theme }));
  }

  onThemeSelect({ value: theme }: any) {
    this.store$.dispatch(new Ui.ChangeTheme({ theme }));
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
