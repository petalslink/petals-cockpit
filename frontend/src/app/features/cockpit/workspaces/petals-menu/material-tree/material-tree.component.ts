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

import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

interface TreeEvent {
  deepLevel: number;
  index: number;
  item: any;
}

@Component({
  selector: 'app-material-tree',
  templateUrl: './material-tree.component.html',
  styleUrls: ['./material-tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaterialTreeComponent implements OnInit {
  // pass the tree to display
  @Input() tree;
  // pass the search to display
  @Input() search;
  // pass a margin to apply on each level (in px)
  @Input() marginLeft = 0;
  // only used internally
  @Input() deepLevel? = 0;
  // event when the user select a line
  @Output() onSelect = new EventEmitter();
  // event when the user toggle a line
  @Output() onToggleFold = new EventEmitter();

  constructor() { }

  ngOnInit() { }

  get margin() {
    return this.deepLevel === 0 ? 0 : this.marginLeft;
  }

  select(treeEvent: TreeEvent) {
    this.onSelect.emit(treeEvent);
  }

  toggleFold(treeEvent: TreeEvent) {
    if (this.search === '') {
      this.onToggleFold.emit(treeEvent);
    }

    return false;
  }
}
