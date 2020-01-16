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
const bsInterfaceOverview = `app-services-interface-overview`;

export const INTERFACE_DOM = {};

export const INTERFACE_OVERVIEW_DOM = {
  texts: {
    interfaceOverviewDetails: `${bsInterfaceOverview} .card-interface-details`,
    aboutInterface: `${bsInterfaceOverview} .about-interface`,
    interfaceNamespace: `${bsInterfaceOverview} .item-interface-content .item-namespace`,
    servicesLocalparts: `${bsInterfaceOverview} .item-service-content .item-localpart`,
    servicesNamespaces: `${bsInterfaceOverview} .item-service-content .item-namespace`,
    endpointsNames: `${bsInterfaceOverview} .item-endpoint-content .item-name`,
  },
  navList: {
    navListServices: `${bsInterfaceOverview} .nav-list-interface-services`,
    navListEndpoints: `${bsInterfaceOverview} .nav-list-interface-endpoints`,
  },
  listItem: {
    itemInterfaces: `${bsInterfaceOverview} .item-interface-content`,
    itemServices: `${bsInterfaceOverview} .item-service-content`,
    itemEndpoints: `${bsInterfaceOverview} .item-endpoint-content`,
  },
  avatars: {
    imgInterface: `${bsInterfaceOverview} .img-card-interface`,
    imgService: `${bsInterfaceOverview} .img-card-service`,
    imgEndpoint: `${bsInterfaceOverview} .img-card-endpoint`,
  },
};
