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

import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SharedModule } from '@shared/shared.module';

import { Subject } from 'rxjs';

describe(`appFocusInput`, () => {
  let hostComponent: HostWithParamsComponent;
  let hostFixture: ComponentFixture<HostWithParamsComponent>;
  let hostDebugElement: DebugElement;
  let inputNativeElement: HTMLInputElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule.forRoot()],
      declarations: [HostWithParamsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    hostFixture = TestBed.createComponent(HostWithParamsComponent);
    hostComponent = hostFixture.componentInstance;
    hostDebugElement = hostFixture.debugElement;
    inputNativeElement = hostDebugElement.query(By.css('input')).nativeElement;
  });

  it(`should focus the current input when a new value is sent in observable with true`, () => {
    hostFixture.detectChanges();

    expect(document.activeElement).not.toBe(inputNativeElement);

    hostComponent._focusSearchInput$.next(true);
    hostFixture.detectChanges();

    expect(document.activeElement).toBe(inputNativeElement);
  });
});

@Component({
  selector: 'app-host-default-component',
  template: `
    <input type="text" name="inpt" [appFocusInput]="focusSearchInput$">
  `,
})
export class HostWithParamsComponent {
  _focusSearchInput$ = new Subject<boolean>();
  focusSearchInput$ = this._focusSearchInput$.asObservable();
}
