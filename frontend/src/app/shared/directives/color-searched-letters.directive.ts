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
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  Renderer2,
  SimpleChanges,
} from '@angular/core';

import { escapeStringRegexp } from '@shared/helpers/shared.helper';

@Directive({
  selector: '[appColorSearchedLetters]',
})
export class ColorSearchedLettersDirective implements OnInit, OnChanges {
  @Input() search: string;
  @Input() text: string;
  @Input() classToApply: string;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.classToApply) {
      this.classToApply = '';
    }

    if (!this.search || !this.search.trim() || !this.classToApply) {
      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', this.text);
      return;
    }

    const search = escapeStringRegexp(this.search.trim());
    this.renderer.setProperty(
      this.el.nativeElement,
      'innerHTML',
      this.replace(this.text, search)
    );
  }

  replace(txt = '', search: string) {
    const searchRgx = new RegExp(`(${search})`, 'gi');
    return txt.replace(
      searchRgx,
      `<span class="${this.classToApply}">$1</span>`
    );
  }
}
