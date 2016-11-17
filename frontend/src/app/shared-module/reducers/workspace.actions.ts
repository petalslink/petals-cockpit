/**
 * Copyright (C) 2016 Linagora
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

export const WorkspaceActions = {
  FETCH_WORKSPACE: 'FETCH_WORKSPACE',
  FETCH_WORKSPACE_SUCCESS: 'FETCH_WORKSPACE_SUCCESS',
  FETCH_WORKSPACE_FAILED: 'FETCH_WORKSPACE_FAILED',

  RESET_WORKSPACE: 'RESET_WORKSPACE',

  EDIT_PETALS_SEARCH: 'EDIT_PETALS_SEARCH',
  DELETE_PETALS_SEARCH: 'DELETE_PETALS_SEARCH',

  IMPORT_BUS: 'IMPORT_BUS',
  // once the http request is launched to import a bus,
  // the server returns us an id (bus id) so we can display at least the name (that we already have)
  // and update the object later according to the id
  IMPORT_BUS_SUCCESS: 'IMPORT_BUS_SUCCESS',
  IMPORT_BUS_FAILED: 'IMPORT_BUS_FAILED',

  IMPORT_BUS_MINIMAL_CONFIG: 'IMPORT_BUS_MINIMAL_CONFIG',

  ADD_BUS_SUCCESS: 'ADD_BUS_SUCCESS',
  ADD_BUS_FAILED: 'ADD_BUS_FAILED',

  REMOVE_BUS: 'REMOVE_BUS',
  REMOVE_BUS_SUCCESS: 'REMOVE_BUS_SUCCESS',
  REMOVE_BUS_FAILED: 'REMOVE_BUS_FAILED',

  FETCH_BUS_CONFIG: 'FETCH_BUS_CONFIG',
  FETCH_BUS_CONFIG_SUCCESS: 'FETCH_BUS_CONFIG_SUCCESS',
  FETCH_BUS_CONFIG_FAILED: 'FETCH_BUS_CONFIG_FAILED',

  SET_ID_BUS_CONTAINER_COMPONENT_SERVICE_UNIT: 'SET_ID_BUS_CONTAINER_COMPONENT_SERVICE_UNIT'
};
