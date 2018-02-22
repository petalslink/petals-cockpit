/**
 * Copyright (C) 2017-2018 Linagora
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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { IService } from 'app/features/cockpit/workspaces/state/services/services.interface';
import { TreeElement } from 'app/shared/components/material-tree/material-tree.component';

@Component({
  selector: 'app-services-list',
  templateUrl: './services-list.component.html',
  styleUrls: ['./services-list.component.scss'],
})
export class ServicesListComponent<TE extends TreeElement<TE>>
  implements OnInit {
  @Input() workspaceId: string;
  @Input() servicesTree: TreeElement<TE>[];

  @Output() onServiceSelected = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  select(service: IService) {
    this.onServiceSelected.emit(service);
  }
}
