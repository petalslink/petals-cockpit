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
const bsServiceOverview = `app-services-service-overview`;

export const SERVICE_DOM = {};

export const SERVICE_OVERVIEW_DOM = {
  texts: {
    serviceOverviewDetails: `${bsServiceOverview} .card-service-details`,
    aboutService: `${bsServiceOverview} .about-service`,
    serviceNamespace: `${bsServiceOverview} .item-service-content .item-namespace`,
    interfacesLocalparts: `${bsServiceOverview} .item-interface-content .item-localpart`,
    interfacesNamespaces: `${bsServiceOverview} .item-interface-content .item-namespace`,
    endpointsNames: `${bsServiceOverview} .item-endpoint-content .item-name`,
  },
  navList: {
    navListInterfaces: `${bsServiceOverview} .nav-list-service-interfaces`,
    navListEndpoints: `${bsServiceOverview} .nav-list-service-endpoints`,
  },
  listItem: {
    itemServices: `${bsServiceOverview} .item-service-content`,
    itemInterfaces: `${bsServiceOverview} .item-interface-content`,
    itemEndpoints: `${bsServiceOverview} .item-endpoint-content`,
  },
  avatars: {
    imgService: `${bsServiceOverview} .img-card-service`,
    imgInterface: `${bsServiceOverview} .img-card-interface`,
    imgEndpoint: `${bsServiceOverview} .img-card-endpoint`,
  },
};
