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

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { SharedModule } from '@shared/shared.module';
import { getInputByName } from '@testing/index';

describe(`appDisableControl`, () => {
  let fixture: ComponentFixture<HostComponent>;
  let inputElement: HTMLInputElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule.forRoot()],
      declarations: [HostComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    inputElement = getInputByName(fixture, 'name');
    fixture.detectChanges();
  });

  it('input should be disabled', () => {
    expect(inputElement.disabled).toBe(true);
  });
});

@Component({
  selector: 'app-host-component',
  template: `
    <form [formGroup]="fg">
      <input type="text" formControlName="name" id="name" [appDisableControl]="isDisabled">
    </form>
  `,
})
export class HostComponent {
  fg = new FormGroup({
    name: new FormControl({ value: '', disable: false }),
  });
  isDisabled = true;
}
