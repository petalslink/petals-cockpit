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

// ***********************************************************
// This example support/index.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Index of commands declarations
import 'cypress-pipe';
// LDAP
import './administration.commands';
import './component.commands';
import './container.commands';
import './endpoint.commands';
import './helper.commands';
import './interface.commands';
import './login.commands';
import './menu.commands';
import './petals-cockpit.commands';
import './petals.commands';
import './service.commands';
import './services.commands';
import './setup.commands';
import './topology.commands';
import './workspace.commands';
import './workspaces.commands';

// NO LDAP
import './setup-no-ldap.commands';
