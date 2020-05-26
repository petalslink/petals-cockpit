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
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { IWorkspaces } from '@feat/cockpit/workspaces/state/workspaces/workspaces.interface';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MenuComponent {
  onDestroy$ = new Subject<void>();

  workspacesListMenu: IWorkspaces;

  // 28 characters max > width size of menu panel
  @Input() maxLength = 28;
  @Input() selectedWksId: string;

  @Input('workspacesList')
  set workspacesList(workspacesListInput: IWorkspaces) {
    this.workspacesListMenu = {
      ...workspacesListInput,
      list: [
        workspacesListInput.list.find(
          selectedWks => selectedWks.id === this.selectedWksId
        ),
        ...workspacesListInput.list.filter(
          wks => wks.id !== this.selectedWksId
        ),
      ],
    };
  }

  constructor() {}
}
