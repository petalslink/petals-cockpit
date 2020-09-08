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
const bsEndpointView = `app-services-endpoint-view`;

export const ENDPOINT_OVERVIEW_DOM = {
  texts: {
    relatedElements: {
      interfaces: `${bsEndpointView} .interface-btn`,
      interfaceLocalpart: (intId: string) =>
        `${bsEndpointView} .interface-content-${intId} .interface-localpart`,
      interfaceNamespace: (intId: string) =>
        `${bsEndpointView} .interface-content-${intId} .interface-namespace`,
      serviceLocalpart: `${bsEndpointView} .service-localpart`,
      serviceNamespace: `${bsEndpointView} .service-namespace`,
    },
    details: {
      busName: `${bsEndpointView} .bus-button .location-name`,
      contName: `${bsEndpointView} .container-button .location-name`,
      compName: `${bsEndpointView} .component-button .location-name`,
    },
  },
  buttons: {
    interfaceBtn: (intId: string) =>
      `${bsEndpointView} .interface-content-${intId}`,
    serviceBtn: `${bsEndpointView} .service-btn`,
    busBtn: `${bsEndpointView} .bus-button button`,
    contBtn: `${bsEndpointView} .container-button button`,
    compBtn: `${bsEndpointView} .component-button button`,
  },
};
