/**
 * Copyright (C) 2017-2019 Linagora
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

import { Ui } from './ui.actions';
import { IUi, ScreenSize, uiFactory } from './ui.interface';
import { Users } from './users.actions';

export namespace UiReducer {
  type All =
    | Ui.OpenSidenav
    | Ui.CloseSidenav
    | Ui.ToggleSidenav
    | Ui.OpenWorkspacesList
    | Ui.OpenCreateWorkspace
    | Ui.CloseWorkspacesList
    | Ui.CloseCreateWorkspace
    | Ui.ChangeScreenSize
    | Ui.SetTitles
    | Ui.ChangeTheme
    | Users.Disconnected;

  export function reducer(table = uiFactory(), action: All): IUi {
    switch (action.type) {
      case Ui.OpenSidenavType: {
        return openSidenav(table);
      }
      case Ui.CloseSidenavType: {
        return closeSidenav(table);
      }
      case Ui.ToggleSidenavType: {
        return toggleSidenav(table);
      }
      case Ui.OpenWorkspacesListType: {
        return openWorkspacesList(table);
      }
      case Ui.OpenCreateWorkspaceType: {
        return openCreateWorkspace(table);
      }
      case Ui.CloseWorkspacesListType: {
        return closeWorkspacesList(table);
      }
      case Ui.CloseCreateWorkspaceType: {
        return closeCreateWorkspace(table);
      }
      case Ui.ChangeScreenSizeType: {
        return changeScreenSize(table, action.payload);
      }
      case Ui.SetTitlesType: {
        return setTitles(table, action.payload);
      }
      case Ui.ChangeThemeType: {
        return changeTheme(table, action.payload);
      }
      case Users.DisconnectedType: {
        return {
          ...uiFactory(),
          isWorkspacesListVisible: table.isWorkspacesListVisible,
          screenSize: table.screenSize,
          settings: table.settings,
        };
      }
      default:
        return table;
    }
  }

  function toggleSidenav(ui: IUi): IUi {
    return {
      ...ui,
      isSidenavVisible: !ui.isSidenavVisible,
    };
  }

  function openSidenav(ui: IUi): IUi {
    return {
      ...ui,
      isSidenavVisible: true,
    };
  }

  function closeSidenav(ui: IUi): IUi {
    return {
      ...ui,
      isSidenavVisible: false,
    };
  }

  function openWorkspacesList(ui: IUi): IUi {
    return {
      ...ui,
      isWorkspacesListVisible: true,
      isCreateWorkspaceVisible: false,
    };
  }

  function openCreateWorkspace(ui: IUi): IUi {
    return {
      ...ui,
      isCreateWorkspaceVisible: true,
      isWorkspacesListVisible: false,
    };
  }

  function closeWorkspacesList(ui: IUi): IUi {
    return {
      ...ui,
      isWorkspacesListVisible: false,
    };
  }

  function closeCreateWorkspace(ui: IUi): IUi {
    return {
      ...ui,
      isCreateWorkspaceVisible: false,
    };
  }

  function setTitles(
    ui: IUi,
    payload: {
      titleMainPart1?: string;
      titleMainPart2?: string;
      titleSubPart?: string;
    }
  ): IUi {
    return {
      ...ui,
      titleMainPart1: payload.titleMainPart1
        ? payload.titleMainPart1
        : ui.titleMainPart1,
      titleMainPart2: payload.titleMainPart2
        ? payload.titleMainPart2
        : ui.titleMainPart2,
      titleSubPart: payload.titleSubPart
        ? payload.titleSubPart
        : ui.titleSubPart,
    };
  }

  function changeTheme(ui: IUi, payload: { theme: string }): IUi {
    return Object.assign({}, ui, {
      settings: {
        theme: payload.theme,
      },
    });
  }

  function changeScreenSize(ui: IUi, payload: { screenSize: ScreenSize }): IUi {
    return {
      ...ui,
      screenSize: payload.screenSize,
    };
  }
}
