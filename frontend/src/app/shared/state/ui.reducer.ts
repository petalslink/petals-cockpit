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

import { IUi } from '../interfaces/ui.interface';
import { uiState } from './ui.state';
import { Workspaces } from 'app/features/cockpit/workspaces/state/workspaces/workspaces.reducer';

export class Ui {
  private static reducerName = '[Ui]';

  public static reducer(ui = uiState(), { type, payload }: Action): IUi {
    if (!Ui.mapActionsToMethod[type]) {
      return ui;
    }

    return Ui.mapActionsToMethod[type](ui, payload);
  }

  // tslint:disable-next-line:member-ordering
  public static SET_LANGUAGE = `${Ui.reducerName} Set language`;
  private static setLanguage(ui: IUi, payload): IUi {
    return {
      ...ui,
      ...<IUi>{ language: payload },
    };
  }

  // tslint:disable-next-line:member-ordering
  public static TOGGLE_SIDENAV = `${Ui.reducerName} Toggle sidenav`;
  private static toggleSidenav(ui: IUi, _payload): IUi {
    return {
      ...ui,
      ...<IUi>{ isSidenavVisible: !ui.isSidenavVisible },
    };
  }

  // tslint:disable-next-line:member-ordering
  public static OPEN_SIDENAV = `${Ui.reducerName} Open sidenav`;
  private static openSidenav(ui: IUi, _payload): IUi {
    return {
      ...ui,
      ...<IUi>{ isSidenavVisible: true },
    };
  }

  // tslint:disable-next-line:member-ordering
  public static CLOSE_SIDENAV_ON_SMALL_SCREEN = `${Ui.reducerName} Close sidenav on small screen`;

  // tslint:disable-next-line:member-ordering
  public static CLOSE_SIDENAV = `${Ui.reducerName} Close sidenav`;
  private static closeSidenav(ui: IUi, _payload): IUi {
    return {
      ...ui,
      ...<IUi>{ isSidenavVisible: false },
    };
  }

  // tslint:disable-next-line:member-ordering
  public static OPEN_POPUP_WORKSPACES_LIST = `${Ui.reducerName} Open popup workspaces list`;
  private static openPopupWorkspacesList(ui: IUi, _payload): IUi {
    return {
      ...ui,
      ...<IUi>{ isPopupListWorkspacesVisible: true },
    };
  }

  // tslint:disable-next-line:member-ordering
  public static CLOSE_POPUP_WORKSPACES_LIST = `${Ui.reducerName} Close popup workspaces list`;
  private static closePopupWorkspacesList(ui: IUi, _payload): IUi {
    return {
      ...ui,
      ...<IUi>{ isPopupListWorkspacesVisible: false },
    };
  }

  // tslint:disable-next-line:member-ordering
  public static SET_TITLES = `${Ui.reducerName} Set titles`;
  private static setTitles(
    ui: IUi,
    payload: {
      titleMainPart1: number;
      titleMainPart2: number;
      titleSubPart: number;
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

  private static closeWorkspace(ui: IUi, payload): IUi {
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

  // tslint:disable-next-line:member-ordering
  public static CHANGE_SCREEN_SIZE = `${Ui.reducerName} Change screen size`;
  private static changeScreenSize(ui: IUi, payload): IUi {
    return {
      ...ui,
      ...<IUi>{ screenSize: payload },
    };
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod: {
    [type: string]: (t: IUi, p: any) => IUi;
  } = {
    [Ui.SET_LANGUAGE]: Ui.setLanguage,
    [Ui.TOGGLE_SIDENAV]: Ui.toggleSidenav,
    [Ui.OPEN_SIDENAV]: Ui.openSidenav,
    [Ui.CLOSE_SIDENAV]: Ui.closeSidenav,
    [Ui.OPEN_POPUP_WORKSPACES_LIST]: Ui.openPopupWorkspacesList,
    [Ui.CLOSE_POPUP_WORKSPACES_LIST]: Ui.closePopupWorkspacesList,
    [Ui.SET_TITLES]: Ui.setTitles,
    [Ui.CHANGE_SCREEN_SIZE]: Ui.changeScreenSize,

    [Workspaces.CLOSE_WORKSPACE]: Ui.closeWorkspace,
  };
}
