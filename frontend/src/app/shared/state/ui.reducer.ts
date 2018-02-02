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

import { Ui } from 'app/shared/state/ui.actions';
import { Users } from 'app/shared/state/users.actions';
import { IUi, ScreenSize, uiFactory } from './ui.interface';

export namespace UiReducer {
  type All =
    | Ui.OpenSidenav
    | Ui.CloseSidenav
    | Ui.ToggleSidenav
    | Ui.OpenWorkspaces
    | Ui.CloseWorkspaces
    | Ui.ChangeScreenSize
    | Ui.SetTitles
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
      case Ui.OpenWorkspacesType: {
        return openWorkspaces(table);
      }
      case Ui.CloseWorkspacesType: {
        return closeWorkspaces(table);
      }
      case Ui.ChangeScreenSizeType: {
        return changeScreenSize(table, action.payload);
      }
      case Ui.SetTitlesType: {
        return setTitles(table, action.payload);
      }
      case Users.DisconnectedType: {
        return {
          ...uiFactory(),
          screenSize: table.screenSize,
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

  function openWorkspaces(ui: IUi): IUi {
    return {
      ...ui,
      isPopupListWorkspacesVisible: true,
    };
  }

  function closeWorkspaces(ui: IUi): IUi {
    return {
      ...ui,
      isPopupListWorkspacesVisible: false,
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

  function changeScreenSize(ui: IUi, payload: { screenSize: ScreenSize }): IUi {
    return {
      ...ui,
      screenSize: payload.screenSize,
    };
  }
}
