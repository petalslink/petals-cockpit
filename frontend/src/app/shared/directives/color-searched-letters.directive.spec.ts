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

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorSearchedLettersDirective } from '@shared/directives/color-searched-letters.directive';
import { getElementBySelector } from 'testing';

describe(`appColorSearchedLetters`, () => {
  let component: HostComponent;
  let fixture: ComponentFixture<HostComponent>;

  const DOM = {
    get renderedHtml() {
      return getElementBySelector<HTMLDivElement>(fixture, 'div').innerHTML;
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HostComponent, ColorSearchedLettersDirective],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it(`should write the same text if you pass only the search input`, () => {
    component.text = 'Learn one way to build applications with Angular';
    fixture.detectChanges();

    expect(DOM.renderedHtml).toEqual(
      'Learn one way to build applications with Angular'
    );
  });

  it(`should write the same text if you pass text, search, but not classToApply`, () => {
    component.text = 'Learn one way to build applications with Angular';
    component.search = 'build applications';
    fixture.detectChanges();

    expect(DOM.renderedHtml).toEqual(
      'Learn one way to build applications with Angular'
    );
  });

  it(`should write the text and wrap every match with a span containing the given class`, () => {
    component.text = 'Learn one way to build applications with Angular';
    component.search = 'on';
    component.classToApply = 'some-class';
    fixture.detectChanges();

    expect(DOM.renderedHtml).toEqual(
      'Learn <span class="some-class">on</span>e way to build applicati<span class="some-class">on</span>s with Angular'
    );
  });
});

@Component({
  selector: 'app-host-component',
  template: `
    <div
      appColorSearchedLetters
      [text]="text"
      [search]="search"
      [classToApply]="classToApply"></div>
  `,
})
class HostComponent {
  text: string;
  search: string;
  classToApply: string;
}
