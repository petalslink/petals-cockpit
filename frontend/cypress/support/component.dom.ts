/**
 * Copyright (C) 2018-2019 Linagora
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
const bs = `app-petals-component-view`;
const bsServiceUnitDeploy = 'app-su-deployment';

export const COMPONENT_DOM = {
  tabs: `${bs} .mat-tab-label`,
  buttons: {
    actionState: `${bs} .list-actions-name span button span span.action-name`,
  },
};

export const SERVICE_UNIT_DEPLOYMENT_DOM = {
  card: `${bsServiceUnitDeploy} .card-su-deployment`,
};
