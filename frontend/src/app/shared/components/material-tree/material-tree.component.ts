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
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';

export interface TreeElement<T extends TreeElement<T>> {
  name: string;
  link?: string;
  isFolded: boolean;
  children: T[];
  cssClass: string;
  svgIcon?: string;
  icon?: string;
}

@Component({
  selector: 'app-material-tree',
  templateUrl: './material-tree.component.html',
  styleUrls: ['./material-tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaterialTreeComponent<TE extends TreeElement<TE>>
  implements OnInit {
  @Input() disableRipple: boolean;
  // pass the tree to display
  @Input() tree: TreeElement<TE>[];
  // pass the search to display
  @Input() search: string;
  // pass a margin to apply on each level (in px)
  @Input() marginLeft = 0;
  // choose whether you want to display fold/unfold icon
  @Input() canBeFolded? = true;
  // only used internally
  @Input() deepLevel? = 0;
  // event when the user select a line
  @Output() evtSelect = new EventEmitter<TE>();
  // event when the user toggle a line
  @Output() evtToggleFold = new EventEmitter<TE>();

  constructor() {}

  ngOnInit() {}

  get margin() {
    return this.deepLevel === 0 ? 0 : this.marginLeft;
  }

  select(element: TE) {
    this.evtSelect.emit(element);
  }

  toggleFold(element: TE) {
    if (this.canBeFolded && (!this.search || !this.search.trim())) {
      this.evtToggleFold.emit(element);
    }

    // prevent the navigate
    return false;
  }
}
