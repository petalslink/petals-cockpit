/**
 * Copyright (C) 2018 Linagora
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

// base selector
const bs = `app-petals-menu-view`;
const bsBip = `app-buses-in-progress`;
const bsTree = `app-material-tree`;

export const PETALS_DOM = {
  inputs: { search: `${bs} input[formcontrolname="search"]` },
  buttons: { addBus: `${bs} .btn-add-bus` },
};

export const BIP_DOM = {
  navList: { navListBipPetals: `${bsBip} .nav-list-imports-in-progress` },
  texts: { ipPort: `${bsBip} .ip-port` },
};

export const PETALS_TREE_DOM = {
  navTree: { navTreePetals: `${bsTree} .nav-list-tree` },
  links: {
    itemsLinks: `${bsTree} .item-list a`,
  },
  texts: {
    itemsNames: `${bsTree} .item-name`,
    itemsHighlights: `${bsTree} .highlight`,
  },
};
