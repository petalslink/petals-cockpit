/**
 * Copyright (C) 2018-2019 Linagora
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

const bs = `app-menu`;

export const MENU_DOM = {
  buttons: {
    toggleMenu: `${bs} .btn-menu`,
  },
  links: {
    goToWksList: `${bs} .menu-item-back-wks-list`,
    goToCreateWks: `${bs} .menu-item-create-wks`,
    itemList: `${bs} .item-list`,
    itemsWksNames: `${bs} .item-list .menu-item-wks-name`,
  },
  texts: {
    itemNameWksList: `span .back-to-wks`,
    itemNameCreateWks: `span .create-new-wks`,
    wksNames: `span .workspace-name`,
  },
};