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

import { Action } from '@ngrx/store';

export namespace Ui {
  export const SetLanguageType = '[UI] Set language';
  export class SetLanguage implements Action {
    readonly type = SetLanguageType;
    constructor(public readonly payload: { language: string }) {}
  }

  export const OpenSidenavType = '[UI] Open sidenav';
  export class OpenSidenav implements Action {
    readonly type = OpenSidenavType;
    constructor() {}
  }

  export const CloseSidenavType = '[UI] Close sidenav';
  export class CloseSidenav implements Action {
    readonly type = CloseSidenavType;
    constructor() {}
  }

  export const ToggleSidenavType = '[UI] Toggle sidenav';
  export class ToggleSidenav implements Action {
    readonly type = ToggleSidenavType;
    constructor() {}
  }

  export const CloseSidenavOnSmallScreenType =
    '[UI] Close sidenav on small screen';
  export class CloseSidenavOnSmallScreen implements Action {
    readonly type = CloseSidenavOnSmallScreenType;
    constructor() {}
  }

  export const OpenWorkspacesType = '[UI] Open Workspaces';
  export class OpenWorkspaces implements Action {
    readonly type = OpenWorkspacesType;
    constructor() {}
  }

  export const CloseWorkspacesType = '[UI] Close Workspaces';
  export class CloseWorkspaces implements Action {
    readonly type = CloseWorkspacesType;
    constructor() {}
  }

  export const ChangeScreenSizeType = '[UI] Change screen size';
  export class ChangeScreenSize implements Action {
    readonly type = ChangeScreenSizeType;
    constructor(public readonly payload: { screenSize: string }) {}
  }

  export const SetTitlesType = '[UI] Set titles';
  export class SetTitles implements Action {
    readonly type = SetTitlesType;
    constructor(
      public readonly payload: {
        titleMainPart1?: string;
        titleMainPart2?: string;
        titleSubPart?: string;
      }
    ) {}
  }
}