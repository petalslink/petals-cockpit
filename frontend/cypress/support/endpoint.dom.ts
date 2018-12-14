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
const bsEndpointOverview = `app-services-endpoint-overview`;

export const ENDPOINT_DOM = {};

export const ENDPOINT_OVERVIEW_DOM = {
  texts: {
    endpointOverviewDetails: `${bsEndpointOverview} .card-endpoint-details`,
    busName: `${bsEndpointOverview} .item-endpoint-bus .bus-name`,
    containerName: `${bsEndpointOverview} .item-endpoint-container .container-name`,
    componentName: `${bsEndpointOverview} .item-endpoint-component .component-name`,
    serviceLocalpart: `${bsEndpointOverview} .item-service-content .item-localpart`,
    serviceNamespace: `${bsEndpointOverview} .item-service-content .item-namespace`,
    interfacesLocalparts: `${bsEndpointOverview} .item-interface-content .item-localpart`,
    interfacesNamespaces: `${bsEndpointOverview} .item-interface-content .item-namespace`,
  },
  navList: {
    navListEndpointLocation: `${bsEndpointOverview} .nav-list-endpoint-location`,
    navListService: `${bsEndpointOverview} .nav-list-endpoint-service`,
    navListInterfaces: `${bsEndpointOverview} .nav-list-endpoint-interfaces`,
  },
  listItem: {
    itemBus: `${bsEndpointOverview} .item-endpoint-bus`,
    itemContainer: `${bsEndpointOverview} .item-endpoint-container`,
    itemComponent: `${bsEndpointOverview} .item-endpoint-component`,
    itemInterfaces: `${bsEndpointOverview} .item-interface-content`,
    itemService: `${bsEndpointOverview} .item-service-content`,
  },
  avatars: {
    imgInterface: `${bsEndpointOverview} .img-card-interface`,
    imgService: `${bsEndpointOverview} .img-card-service`,
    imgEndpoint: `${bsEndpointOverview} .img-card-endpoint`,
  },
};
