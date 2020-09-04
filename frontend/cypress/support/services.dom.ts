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
const bs = `app-services-menu-view`;

export const SERVICES_DOM = {
  inputs: { search: `${bs} input[formcontrolname="search"]` },
  refreshBtn: `${bs} .btn-refresh-services`,
  refreshSpinner: `${bs} .wrapper-search-services mat-spinner`,
};

export const SERVICES_TREE_DOM = {
  navTree: { navTreeServices: `${bs} mat-tree.services-tree` },
  allNodes: `.cockpit-tree-node`,
  treeNodeVisible: `.tree-node-visible`,
  treeNodeHidden: `.tree-node-hidden`,
  buttons: {
    elementBtn: `${bs} .btn-node`,
    expandableBtn: (type: string, path: string) =>
      `.btn-expandable-${type}-${path}`,
  },
  texts: {
    treeElementsName: `.service-element-name`,
    itemsHighlights: `${bs} .highlight`,
  },
};
