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

import { IUi, uiFactory } from './ui.interface';

import { Ui } from 'app/shared/state/ui.actions';
import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.actions';

export namespace UiReducer {
  type All =
    | Ui.SetLanguage
    | Ui.OpenSidenav
    | Ui.CloseSidenav
    | Ui.ToggleSidenav
    | Ui.OpenWorkspaces
    | Ui.CloseWorkspaces
    | Ui.ChangeScreenSize
    | Ui.SetTitles
    | Workspaces.Close;

  export function reducer(table = uiFactory(), action: All): IUi {
    switch (action.type) {
      case Ui.SetLanguageType: {
        return setLanguage(table, action.payload);
      }
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
      case Workspaces.CloseType: {
        return closeWorkspace(table, action.payload);
      }
      default:
        return table;
    }
  }

  function setLanguage(ui: IUi, payload: { language: string }): IUi {
    return {
      ...ui,
      ...<IUi>{ language: payload.language },
    };
  }

  function toggleSidenav(ui: IUi): IUi {
    return {
      ...ui,
      ...<IUi>{ isSidenavVisible: !ui.isSidenavVisible },
    };
  }

  function openSidenav(ui: IUi): IUi {
    return {
      ...ui,
      ...<IUi>{ isSidenavVisible: true },
    };
  }

  function closeSidenav(ui: IUi): IUi {
    return {
      ...ui,
      ...<IUi>{ isSidenavVisible: false },
    };
  }

  function openWorkspaces(ui: IUi): IUi {
    return {
      ...ui,
      ...<IUi>{ isPopupListWorkspacesVisible: true },
    };
  }

  function closeWorkspaces(ui: IUi): IUi {
    return {
      ...ui,
      ...<IUi>{ isPopupListWorkspacesVisible: false },
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
      ...<IUi>{
        titleMainPart1: payload.titleMainPart1
          ? payload.titleMainPart1
          : ui.titleMainPart1,
        titleMainPart2: payload.titleMainPart2
          ? payload.titleMainPart2
          : ui.titleMainPart2,
        titleSubPart: payload.titleSubPart
          ? payload.titleSubPart
          : ui.titleSubPart,
      },
    };
  }

  function changeScreenSize(ui: IUi, payload: { screenSize: string }): IUi {
    return {
      ...ui,
      ...<IUi>{ screenSize: payload.screenSize },
    };
  }

  function closeWorkspace(ui: IUi, payload: { delete: boolean }): IUi {
    if (payload && payload.delete) {
      return {
        ...ui,
        isSidenavVisible: false,
        isPopupListWorkspacesVisible: true,
      };
    } else {
      return ui;
    }
  }
}
