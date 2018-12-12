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
const bs = `app-services-menu-view`;
const bsTreeInterfaces = `app-interfaces-list`;
const bsTreeServices = `app-services-list`;
const bsTreeEndpoints = `app-endpoints-list`;

export const SERVICES_DOM = {
  inputs: { search: `${bs} input[formcontrolname="search"]` },
  refreshBtn: `${bs} .btn-refresh-services`,
  refreshSpinner: `${bs} .wrapper-search-services mat-spinner`,
};

export const SERVICES_TREE_DOM = {
  expPanel: {
    expPanelInterfaces: `${bs} .exp-pnl-interfaces-tree`,
    expPanelServices: `${bs} .exp-pnl-services-tree`,
    expPanelEndpoints: `${bs} .exp-pnl-endpoints-tree`,
  },
  navTree: {
    navTreeInterfaces: `${bsTreeInterfaces} .nav-list-tree`,
    navTreeServices: `${bsTreeServices} .nav-list-tree`,
    navTreeEndpoints: `${bsTreeEndpoints} .nav-list-tree`,
  },
  texts: {
    title: `${bs} .pnl-title`,
    interfacesNames: `${bsTreeInterfaces} .item-name`,
    servicesNames: `${bsTreeServices} .item-name`,
    endpointsNames: `${bsTreeEndpoints} .item-name`,
  },
};
