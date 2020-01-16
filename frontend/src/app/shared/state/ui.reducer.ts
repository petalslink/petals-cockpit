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

import { Ui } from './ui.actions';
import { IUi, ScreenSize, uiFactory } from './ui.interface';
import { Users } from './users.actions';

export namespace UiReducer {
  type All = Ui.ChangeScreenSize | Ui.ChangeTheme | Users.Disconnected;

  export function reducer(table = uiFactory(), action: All): IUi {
    switch (action.type) {
      case Ui.ChangeScreenSizeType: {
        return changeScreenSize(table, action.payload);
      }
      case Ui.ChangeThemeType: {
        return changeTheme(table, action.payload);
      }
      case Users.DisconnectedType: {
        return {
          ...uiFactory(),
          screenSize: table.screenSize,
          settings: table.settings,
        };
      }
      default:
        return table;
    }
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
