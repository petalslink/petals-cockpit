/**
 * Copyright (C) 2017 Linagora
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
  Component,
  Input,
  ChangeDetectionStrategy,
  OnChanges,
  AfterViewInit,
  AfterViewChecked,
  SimpleChanges
} from '@angular/core';

declare const jdenticon;
declare const md5;

@Component({
  selector: 'app-generate-icon',
  templateUrl: './generate-icon.component.html',
  styleUrls: ['./generate-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenerateIconComponent implements AfterViewInit, OnChanges {
  @Input() size: number;
  @Input() text: number;

  public hashMd5: string;

  constructor() { }

  ngAfterViewInit() {
    this._updateSvg();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['text'].currentValue !== changes['text'].previousValue) {
      this._updateSvg();
    }
  }

  private _updateSvg() {
    this.hashMd5 = md5(this.text);

    // use a setTimeout otherwise jdenticon's called **before**
    // the view's updated and the svg is draw with an old MD5 hash
    // AfterViewChecked is not a good solution because it's checked
    // too many times
    setTimeout(() => jdenticon(), 500);
  }

  get wrapperSize() {
    return `${this.size + 5}`;
  }
}
