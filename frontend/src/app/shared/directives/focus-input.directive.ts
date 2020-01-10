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

import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

@Directive({
  selector: '[appFocusInput]',
})
export class FocusInputDirective implements OnInit, OnDestroy {
  @Input() appFocusInput: Observable<boolean>;

  private onDestroy$ = new Subject<void>();

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.appFocusInput
      .pipe(
        takeUntil(this.onDestroy$),
        filter(shouldFocus => !!shouldFocus),
        tap(() => this.el.nativeElement.focus())
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
