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

import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appDisableControl]',
})
export class DisableControlDirective implements OnChanges {
  /**
   * ngOnChanges seems avoid this error: Cannot read property 'disable' of undefined.
   */
  @Input() appDisableControl: NgControl;
  ngOnChanges(changes: SimpleChanges) {
    if (changes['appDisableControl']) {
      const action = this.appDisableControl ? 'disable' : 'enable';
      this.ngControl.control[action]();
    }
  }

  constructor(private ngControl: NgControl) {}
}
