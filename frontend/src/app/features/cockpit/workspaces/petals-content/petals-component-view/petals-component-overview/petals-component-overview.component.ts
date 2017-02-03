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

import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

import { IComponentRow } from '../../../state/components/component.interface';

@Component({
  selector: 'app-petals-component-overview',
  templateUrl: './petals-component-overview.component.html',
  styleUrls: ['./petals-component-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetalsComponentOverviewComponent implements OnInit {
  @Input() component: IComponentRow;

  constructor() { }

  ngOnInit() {
  }
}