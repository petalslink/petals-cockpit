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
const bsInterfaceView = `app-services-interface-view`;
export const INTERFACE_DOM = {};

export const INTERFACE_VIEW_DOM = {
  texts: {
    relatedElements: {
      services: `${bsInterfaceView} .service-btn`,
      serviceLocalpart: (intId: string) =>
        `${bsInterfaceView} .service-content-${intId} .service-localpart`,
      serviceNamespace: (intId: string) =>
        `${bsInterfaceView} .service-content-${intId} .service-namespace`,
    },
    details: {
      endpoints: `${bsInterfaceView} tr.endpoint-rows`,
      endpoint: (edpId: string) => `${bsInterfaceView} tr.endpoint-${edpId}`,
      endpointName: `.endpoint-name`,
      endpointComponent: `.endpoint-component`,
      endpointInterfaces: `.endpoint-interfaces`,
      endpointContainer: `.endpoint-container`,
      endpointBus: `.endpoint-bus`,
    },
  },
  buttons: {
    serviceBtn: (intId: string) =>
      `${bsInterfaceView} .service-content-${intId}`,
    endpointBtn: `.endpoint-action button`,
  },
};
