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
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { IStore } from '@shared/state/store.interface';
import { isLargeScreen } from '@shared/state/ui.selectors';

@Directive({
  selector: '[appFocusInputIfLargeScreen]',
})
export class FocusInputIfLargeScreenDirective
  implements OnInit, OnChanges, OnDestroy {
  // you can activate this directive conditionally by passing true or false
  @Input() appFocusInputIfLargeScreen: string | boolean = true;

  private isFocusInputActivated$ = new BehaviorSubject<boolean>(false);
  private onDestroy$ = new Subject<void>();

  constructor(private el: ElementRef, private store$: Store<IStore>) {}

  ngOnInit() {
    const largeScreen$ = this.store$.pipe(
      isLargeScreen,
      filter(pIsLargeScreen => pIsLargeScreen)
    );

    this.isFocusInputActivated$
      .pipe(
        takeUntil(this.onDestroy$),
        filter(shouldFocus => shouldFocus),
        withLatestFrom(largeScreen$),
        tap(() => this.el.nativeElement.focus())
      )
      .subscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    const shouldFocusBeActivated =
      !!this.appFocusInputIfLargeScreen ||
      // when we call the directive without passing
      // any parameter, we receive an empty string
      this.appFocusInputIfLargeScreen === '';

    this.isFocusInputActivated$.next(shouldFocusBeActivated);
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
