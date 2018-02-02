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

export type ScreenSize =
  | ''
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | 'lt-sm'
  | 'lt-md'
  | 'lt-lg'
  | 'lt-xl'
  | 'gt-xs'
  | 'gt-sm'
  | 'gt-md'
  | 'gt-lg';

export interface IUi {
  screenSize: ScreenSize;
  // workspace
  isSidenavVisible: boolean;
  // workspaces
  isPopupListWorkspacesVisible: boolean;
  // header
  titleMainPart1: string;
  titleMainPart2: string;
  titleSubPart: string;
}

export function uiFactory(): IUi {
  return {
    isSidenavVisible: true,
    screenSize: '',
    isPopupListWorkspacesVisible: false,
    titleMainPart1: 'Petals Cockpit',
    titleMainPart2: '',
    titleSubPart: '',
  };
}
