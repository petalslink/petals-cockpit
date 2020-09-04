/**
 * Copyright (C) 2018-2020 Linagora
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

export const PETALS_DOM = {
  inputs: { search: `input[formcontrolname="search"]` },
  buttons: { addBus: `${bs} .btn-add-bus` },
};

export const PETALS_TREE_DOM = {
  navTree: { navTreePetals: `${bs} .mat-tree` },
  allNodes: `.petals-tree-node`,
  buttons: {
    workspaceElementBtn: `${bs} .btn-node`,
    // type = bus, container, component, serviceassembly, serviceunit, sharedlibrary, compcategory, sacategory, slcategory
    expandableBtn: (type: string, elementId: string) =>
      `.btn-expandable-${type}-${elementId}`,
  },
  texts: {
    // should get all elements even categories
    treeElementsName: `.workspace-element-name, .tree-category-name`,
    categoriesName: `${bs} .tree-category-name`,
    itemsHighlights: `${bs} .highlight`,
  },
  stateLed: `.workspace-element-state-led`,
  unreachableIcon: `.tree-icon-unreachable`,
};
