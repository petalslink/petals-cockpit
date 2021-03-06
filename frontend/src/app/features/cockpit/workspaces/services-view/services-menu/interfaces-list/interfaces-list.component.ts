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

import { Component, Input, OnInit } from '@angular/core';

import { TreeElement } from '@shared/components/material-tree/material-tree.component';

@Component({
  selector: 'app-interfaces-list',
  templateUrl: './interfaces-list.component.html',
  styleUrls: ['./interfaces-list.component.scss'],
})
export class InterfacesListComponent<TE extends TreeElement<TE>>
  implements OnInit {
  @Input() interfacesTree: TreeElement<TE>[];
  @Input() search: string;

  constructor() {}

  ngOnInit() {}
}
