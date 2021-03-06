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
  OnInit,
} from '@angular/core';

import { IUi } from '@shared/state/ui.interface';
import {
  IWorkspace,
  IWorkspaces,
} from '@wks/state/workspaces/workspaces.interface';
import { IBreadcrumb } from '@wks/state/workspaces/workspaces.selectors';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  @Input() isLargeScreen: boolean;
  @Input() ui: IUi;
  @Input() workspace: IWorkspace;
  @Input() workspacesList: IWorkspaces;
  @Input() breadcrumbList: IBreadcrumb[];

  constructor() {}

  ngOnInit() {}
}
