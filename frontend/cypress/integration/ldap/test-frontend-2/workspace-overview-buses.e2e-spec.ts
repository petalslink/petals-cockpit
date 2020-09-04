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

import { BREADCRUMB_DOM } from '../../../support/breadcrumb.dom';
import {
  expectedInitializedWks0ServiceTree,
  expectedWks0ServiceTreeAdded,
} from '../../../support/helper.const';
import { MENU_DOM } from '../../../support/menu.dom';
import { MESSAGE_DOM } from '../../../support/message.dom';
import {
  WORKSPACE_BUS_DETACH_DIALOG_DOM,
  WORKSPACE_BUS_IMPORT_DIALOG_DOM,
  WORKSPACE_OVERVIEW_DOM,
} from '../../../support/workspace.dom';

describe('Buses', () => {
  beforeEach(() => {
    cy.visit(`/login`);
    cy.login('admin', 'admin');

    cy.expectLocationToBe(`/workspaces/idWks0`);
    cy.expectBusListToBe([`Bus 0`]);
  });

  it('should display the bus names list', () => {
    cy
      .get(MENU_DOM.buttons.toggleMenu)
      .should('be.visible')
      .click();

    cy
      .get(MENU_DOM.links.itemsWksNames)
      .last()
      .should('not.have.class', 'active')
      .and('not.have.attr', 'disabled', 'disabled')
      .find(MENU_DOM.texts.wksNames)
      .should('contain', `Workspace 1`)
      .and('be.visible')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks1`);

    cy.expectBusListToBe([`Bus 1`]);
  });

  it('should navigate to the selected bus page from the bus list', () => {
    cy.get(WORKSPACE_OVERVIEW_DOM.listGridItem.itemBus).click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals/buses/idBus0`);
  });

  it('should detach selected bus and update the bus names list', () => {
    cy
      .get(WORKSPACE_OVERVIEW_DOM.listGridItem.itemDetachBus)
      .should('not.be.visible');

    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editDetachBus).click();

    cy
      .get(WORKSPACE_OVERVIEW_DOM.listGridItem.itemBus)
      .should('not.be.visible');

    cy.get(WORKSPACE_OVERVIEW_DOM.listGridItem.itemDetachBus).click();

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.openDialogDetachBus)
      .should('be.enabled')
      .click()
      .should('be.disabled');

    cy
      .get(WORKSPACE_BUS_DETACH_DIALOG_DOM.texts.infoTitle)
      .contains(`Detach bus?`);

    cy
      .get(WORKSPACE_BUS_DETACH_DIALOG_DOM.texts.description)
      .should('contain', `This will detach Bus 0.`);

    // cancel the dialog
    cy.detachBusAndCheck('admin', false);

    cy.get(WORKSPACE_OVERVIEW_DOM.listGridItem.itemDetachBus).click();

    // check if the button dialog detach bus is disabled
    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.openDialogDetachBus)
      .should('be.disabled');

    // the button detach the bus must be activated after selecting the bus
    cy.get(WORKSPACE_OVERVIEW_DOM.listGridItem.itemDetachBus).click();

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.openDialogDetachBus)
      .should('be.enabled')
      .click();

    // detach the bus selected
    cy.detachBusAndCheck('admin');

    cy.expectDetachBusListToBe([]);

    cy.expectMessageToBe(
      `.info-no-buses`,
      'info',
      `There are no buses attached to this workspace.`
    );
  });

  it('should have empty form fields when clicking attach bus', () => {
    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

    cy.expectBusImportFields().should('be.empty');

    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.cancelAttachBus).should('be.enabled');

    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.importNewBus).should('be.enabled');
  });

  it('should clear fields when closing attach bus form', () => {
    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

    cy.addBusImportInformations(
      'ip',
      '7700',
      'admin',
      'password',
      'passphrase'
    );

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.cancelAttachBus)
      .should('be.enabled')
      .click();

    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

    cy.expectBusImportFields().should('be.empty');
  });

  it(`should not have formField error when clearing attach bus form`, () => {
    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

    cy.expectBusImportFields().should('be.empty');

    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.importNewBus).should('be.enabled');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.formFields.ipFormField)
      .find(`mat-error`)
      .should('not.be.visible');
    cy
      .get(WORKSPACE_OVERVIEW_DOM.formFields.portFormField)
      .find(`mat-error`)
      .should('not.be.visible');
    cy
      .get(WORKSPACE_OVERVIEW_DOM.formFields.usernameFormField)
      .find(`mat-error`)
      .should('not.be.visible');
    cy
      .get(WORKSPACE_OVERVIEW_DOM.formFields.passwordFormField)
      .find(`mat-error`)
      .should('not.be.visible');
    cy
      .get(WORKSPACE_OVERVIEW_DOM.formFields.passphraseFormField)
      .find(`mat-error`)
      .should('not.be.visible');

    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.importNewBus).should('be.enabled');

    cy.addBusImportInformations(
      `hostname`,
      'abcd',
      'admin',
      'password',
      'passphrase'
    );

    cy
      .get(WORKSPACE_OVERVIEW_DOM.formFields.ipFormField)
      .find(`mat-error`)
      .should('not.be.visible');
    cy
      .get(WORKSPACE_OVERVIEW_DOM.formFields.portFormField)
      .find(`mat-error`)
      .should('be.visible');
    cy
      .get(WORKSPACE_OVERVIEW_DOM.formFields.usernameFormField)
      .find(`mat-error`)
      .should('not.be.visible');
    cy
      .get(WORKSPACE_OVERVIEW_DOM.formFields.passwordFormField)
      .find(`mat-error`)
      .should('not.be.visible');
    cy
      .get(WORKSPACE_OVERVIEW_DOM.formFields.passphraseFormField)
      .find(`mat-error`)
      .should('not.be.visible');

    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.importNewBus).should('be.disabled');

    cy.expectBusImportFields().clear();

    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.importNewBus).should('be.enabled');
  });

  it('should update buses info like buses and services list when attaching bus', () => {
    cy
      .get('app-sidebar')
      .find('.btn-services')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/services`);

    cy.expectServicesTreeToBe(expectedInitializedWks0ServiceTree);

    cy
      .get(BREADCRUMB_DOM.buttons.breadcrumbItemLink)
      .eq(0)
      .should('not.have.class', 'active-link')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0`);

    cy
      .get(BREADCRUMB_DOM.buttons.breadcrumbItemLink)
      .eq(0)
      .should('have.class', 'active-link');

    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

    cy.importBusAndCheck(
      'IMPORT_OK_IP',
      '7700',
      'admin',
      'password',
      'passphrase',
      true
    );

    cy.expectBusListToBe([`Bus 0`, `Bus 2`]);

    cy
      .get(WORKSPACE_OVERVIEW_DOM.listGridItem.itemBus)
      .contains(`Bus 2`)
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/petals/buses/idBus2`);

    cy
      .get('app-sidebar')
      .find('.btn-services')
      .click();

    cy.expectLocationToBe(`/workspaces/idWks0/services`);

    cy.expectServicesTreeToBe(expectedWks0ServiceTreeAdded);
  });

  it('should show POST import error', () => {
    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

    cy.addBusImportInformations(
      `IMPORT_HTTP_ERROR_IP`,
      '7700',
      'admin',
      'password',
      'passphrase'
    );

    cy
      .get(WORKSPACE_BUS_IMPORT_DIALOG_DOM.dialog.dialogImportBus)
      .should('not.be.visible');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.messages.importBusDetailsError)
      .should('not.be.visible');

    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.importNewBus).click();

    cy
      .get(WORKSPACE_BUS_IMPORT_DIALOG_DOM.dialog.dialogImportBus)
      .should('not.be.visible');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.messages.importBusDetailsError)
      .contains(`Error backend`)
      .should('be.visible');
  });

  it('should have complete message import error when clicking view more', () => {
    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

    cy.addBusImportInformations(
      `IMPORT_HTTP_ERROR_IP_LONG_TEXT`,
      '7700',
      'admin',
      'password',
      'passphrase'
    );

    cy
      .get(WORKSPACE_BUS_IMPORT_DIALOG_DOM.dialog.dialogImportBus)
      .should('not.be.visible');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.messages.importBusDetailsError)
      .should('not.be.visible');

    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.importNewBus).click();

    cy
      .get(WORKSPACE_BUS_IMPORT_DIALOG_DOM.dialog.dialogImportBus)
      .should('not.be.visible');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.messages.importBusDetailsError)
      .contains(postImportErrorTroncateTxt)
      .should('be.visible');

    cy.get(MESSAGE_DOM.buttons.viewMore).click();

    cy.get(`.msg-dialog`).should('be.visible');

    cy
      .get(`.msg-dialog .msg-dialog-details`)
      .contains(postImportErrorLongText)
      .should('be.visible');

    cy.get(`.msg-dialog button.btn-close-dialog`).click();

    cy.get(`.msg-dialog`).should('not.be.visible');
  });

  it('should show SSE import error', () => {
    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

    cy.importBusAndCheck(
      `IMPORT_ERROR_IP`,
      '7700',
      'admin',
      'password',
      'passphrase',
      false
    );

    cy
      .get(WORKSPACE_OVERVIEW_DOM.messages.importBusDetailsError)
      .contains(`Can't connect to IMPORT_ERROR_IP:7700`);
  });

  it('should clear message import error when closing attach bus form', () => {
    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

    cy.addBusImportInformations(
      `hostname`,
      '7700',
      'admin',
      'password',
      'passphrase'
    );

    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.importNewBus).click();

    cy
      .get(WORKSPACE_OVERVIEW_DOM.messages.importBusDetailsError)
      .contains(`Can't connect to hostname:7700`)
      .should('be.visible');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.cancelAttachBus)
      .should('be.enabled')
      .click();

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus)
      .should('be.enabled')
      .click();

    cy
      .get(WORKSPACE_OVERVIEW_DOM.messages.importBusDetailsError)
      .contains(`Can't connect to hostname:7700`)
      .should('not.be.visible');
  });

  it('should be able to retry import bus after a failed import', () => {
    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

    cy.importBusAndCheck(
      `hostname`,
      '7700',
      'admin',
      'password',
      'passphrase',
      false
    );

    cy
      .get(WORKSPACE_OVERVIEW_DOM.messages.importBusDetailsError)
      .contains(`Can't connect to hostname:7700`)
      .should('be.visible');

    cy
      .get(WORKSPACE_OVERVIEW_DOM.inputs.ip)
      .clear()
      .type('192.168.0.1');

    // retry import with good ip
    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.importNewBus).click();

    cy
      .get(WORKSPACE_BUS_IMPORT_DIALOG_DOM.dialog.dialogImportBus)
      .should('not.be.visible');

    cy.expectBusListToBe([`Bus 0`, `Bus 3`]);

    cy
      .get(WORKSPACE_OVERVIEW_DOM.messages.importBusDetailsError)
      .should('not.be.visible');
  });

  it('should be able to cancel import', () => {
    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

    // should not have to import the canceled bus
    cy.cancelImportBusAndCheck(
      `IMPORT_CANCEL_IP`,
      '7700',
      'admin',
      'password',
      'passphrase',
      true
    );

    cy
      .get(WORKSPACE_OVERVIEW_DOM.buttons.cancelAttachBus)
      .should('be.enabled')
      .click();

    cy.expectBusListToBe([`Bus 0`]);
  });

  it('should handle receiving SSE import error before POST response', () => {
    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

    cy.importBusAndCheck(
      `FAST_IMPORT_ERROR_IP`,
      '7700',
      'admin',
      'password',
      'passphrase',
      false
    );

    // check if the new bus has not been imported
    cy.expectBusListToBe([`Bus 0`]);

    cy
      .get(WORKSPACE_OVERVIEW_DOM.messages.importBusDetailsError)
      .contains(`Can't connect to FAST_IMPORT_ERROR_IP:7700`);
  });

  it('should handle receiving SSE import OK before POST response', () => {
    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

    cy.importBusAndCheck(
      `FAST_IMPORT_OK_IP`,
      '7700',
      'admin',
      'password',
      'passphrase',
      true
    );

    cy.expectBusListToBe([`Bus 0`, `Bus 2`]);
  });

  it('should remove the error import bus message when user switch workspaces', () => {
    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

    cy.importBusAndCheck(
      `FAST_IMPORT_ERROR_IP`,
      '7700',
      'admin',
      'password',
      'passphrase',
      false
    );

    cy
      .get(WORKSPACE_OVERVIEW_DOM.messages.importBusDetailsError)
      .contains(`Can't connect to FAST_IMPORT_ERROR_IP:7700`);

    cy
      .get(MENU_DOM.buttons.toggleMenu)
      .should('be.visible')
      .click();

    cy.expectWorkspacesListMenuToBe(['Workspace 0', 'Workspace 1']);

    cy
      .get(MENU_DOM.links.itemsWksNames)
      .find(MENU_DOM.texts.wksNames)
      .contains(`Workspace 1`)
      .click();

    cy.expectLocationToBe(`/workspaces/idWks1`);

    cy
      .get(WORKSPACE_OVERVIEW_DOM.messages.importBusDetailsError)
      .should('not.contain', `Can't connect to FAST_IMPORT_ERROR_IP:7700`);
  });

  it('should import with default values on empty fields', () => {
    cy.expectBusListToBe([`Bus 0`]);

    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.editImportBus).click();

    cy.get(WORKSPACE_OVERVIEW_DOM.buttons.importNewBus).click();

    cy
      .get(WORKSPACE_BUS_IMPORT_DIALOG_DOM.dialog.dialogImportBus)
      .should('not.be.visible');

    // check if the bus is added
    cy.expectBusListToBe([`Bus 0`, `Bus 2`]);
  });

  const postImportErrorTroncateTxt = `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec qu...`;

  const postImportErrorLongText = `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi`;
});
