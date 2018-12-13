// ***********************************************************
// This example support/index.js is processed and
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

// Import commands.js using ES2015 syntax:
// LDAP
import './component.commands';
import './helper.commands';
import './import-bus.commands';
import './setup.commands';
import './login.commands';
import './petals-cockpit.commands';
import './petals.commands';
import './service.commands';
import './interface.commands';
import './endpoint.commands';
import './services.commands';
import './workspace.commands';
import './workspaces.commands';
import './administration.commands';

// NO LDAP
import './setup-no-ldap.commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')
