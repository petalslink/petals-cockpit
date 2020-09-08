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
    relatedElements: {
      interfaces: `${bsServiceOverview} .interface-btn`,
      interfaceLocalpart: (intId: string) =>
        `${bsServiceOverview} .interface-content-${intId} .interface-localpart`,
      interfaceNamespace: (intId: string) =>
        `${bsServiceOverview} .interface-content-${intId} .interface-namespace`,
    },
    details: {
      endpoints: `${bsServiceOverview} .endpoint-button .location-name`,
      endpoint: (edpId: string) =>
        `${bsServiceOverview} .endpoint-button.endpoint-${edpId}`,
    },
  },
  buttons: {
    interfaceBtn: (intId: string) =>
      `${bsServiceOverview} .interface-content-${intId}`,
    endpointBtn: (edpId: string) =>
      `${bsServiceOverview} .endpoint-button.endpoint-${edpId} button`,
  },
};
