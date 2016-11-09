/**
 * Copyright (C) 2016 Linagora
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

// angular modules
import { Component, Input } from '@angular/core';

// our interfaces
import { IBus } from '../../../../../../../shared-module/interfaces/petals.interface';

@Component({
  selector: 'app-bus-overview',
  templateUrl: './bus-overview.component.html',
  styleUrls: ['./bus-overview.component.scss']
})
export class BusOverviewComponent {
  @Input() bus: IBus;

  constructor() { }
}
