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

import { NOTIFICATION_DOM } from './notification.dom';
import { PETALS_COCKPIT_DOM } from './petals-cockpit.dom';

Cypress.Commands.add('logout', () => {
  cy.get(PETALS_COCKPIT_DOM.buttons.logout).click();

  cy.location().should(location => {
    expect(location.pathname).to.eq('/login');
  });
});

Cypress.Commands.add('expectNotification', (type, title, message) => {
  const NOTIFICATION_DOM_WITH_TYPE = NOTIFICATION_DOM(type);

  cy.get(NOTIFICATION_DOM_WITH_TYPE.texts.title).contains(title);
  cy.get(NOTIFICATION_DOM_WITH_TYPE.texts.content).contains(message);
  // TODO: the click on the notification is not working as it's
  // expecting for the notification to close before clicking on it
  // this might help to speed up testing time as notification are
  // taking quite a long time before closing (and let other tests run)
  // cy.get(NOTIFICATION_DOM_WITH_TYPE.baseSelector).click();
});
