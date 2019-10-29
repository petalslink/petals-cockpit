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

// import {
//   COMPONENT_OV_SL_DOM,
//   COMPONENT_UPLOAD_DOM,
// } from '../../support/component.dom';
// import { SL_UPLOAD_DOM } from '../../support/component.dom';

// describe('Override shared libraries', () => {
//   beforeEach(() => {
//     cy.visit(`/login`);

//     cy.login('admin', 'admin');

//     cy.expectLocationToBe(`/workspaces/idWks0`);

//     cy
//       .get('app-sidebar')
//       .find('.btn-topology')
//       .click();

//     cy.expectLocationToBe(`/workspaces/idWks0/petals`);
//   });

//   it('should add overridden shared libraries when uploading a component', () => {
//     cy
//       .get('.mat-list-item-content')
//       .contains('Cont 0')
//       .click();

//     cy
//       .get('.workspace-element .mat-tab-label')
//       .eq(1)
//       .click();

//     cy.uploadFile(
//       'petals-bc-sql-1.6.3-SNAPSHOT-red-green.zip',
//       '.deploy-component input[type=file]'
//     );

//     cy.get('mat-dialog-container').should('not.be.visible');

//     cy
//       .get(COMPONENT_OV_SL_DOM.buttons.open)
//       .should('be.enabled')
//       .click();

//     cy.get('mat-dialog-container').should('be.visible');

//     cy.checkOverrideSharedLibrariesInputs(sharedLibrariesInitial);

//     cy.get(COMPONENT_OV_SL_DOM.buttons.save).should('be.enabled');

//     cy.get(COMPONENT_OV_SL_DOM.buttons.add).click();

//     cy.checkOverrideSharedLibrariesInputs(sharedLibrariesLastEmpty);

//     cy.get(COMPONENT_OV_SL_DOM.buttons.save).should('be.disabled');

//     cy
//       .get(COMPONENT_OV_SL_DOM.slInputs)
//       .eq(4)
//       .type('SL 1');

//     cy.get(COMPONENT_OV_SL_DOM.buttons.save).should('be.disabled');

//     cy
//       .get(COMPONENT_OV_SL_DOM.slInputs)
//       .eq(5)
//       .type('2.0');

//     cy.get(COMPONENT_OV_SL_DOM.buttons.save).should('be.enabled');

//     cy
//       .get(COMPONENT_OV_SL_DOM.slInputs)
//       .eq(4)
//       .clear();

//     cy.get(COMPONENT_OV_SL_DOM.buttons.save).should('be.disabled');

//     cy
//       .get(COMPONENT_OV_SL_DOM.slInputs)
//       .eq(4)
//       .type('SL 1');

//     cy.checkOverrideSharedLibrariesInputs(sharedLibrariesOneAdded);

//     cy
//       .get(COMPONENT_OV_SL_DOM.buttons.save)
//       .should('be.enabled')
//       .click();

//     cy.get('mat-dialog-container').should('not.be.visible');

//     cy.checkUploadComponentSharedLibraries(sharedLibrariesOneAdded);
//   });

//   it('should delete overridden shared libraries when uploading a component', () => {
//     cy
//       .get('.mat-list-item-content')
//       .contains('Cont 0')
//       .click();

//     cy
//       .get('.workspace-element .mat-tab-label')
//       .eq(1)
//       .click();

//     cy.uploadFile(
//       'petals-bc-sql-1.6.3-SNAPSHOT-red-green.zip',
//       '.deploy-component input[type=file]'
//     );

//     cy.get('mat-dialog-container').should('not.be.visible');

//     cy
//       .get(COMPONENT_OV_SL_DOM.buttons.open)
//       .should('be.enabled')
//       .click();

//     cy.get('mat-dialog-container').should('be.visible');

//     cy.checkOverrideSharedLibrariesInputs(sharedLibrariesInitial);

//     cy.get(COMPONENT_OV_SL_DOM.buttons.save).should('be.enabled');

//     cy
//       .get(COMPONENT_OV_SL_DOM.buttons.deletes)
//       .eq(0)
//       .click();

//     cy.checkOverrideSharedLibrariesInputs(sharedLibrariesOneDeleted);

//     cy.get(COMPONENT_OV_SL_DOM.buttons.save).should('be.enabled');

//     cy.get(COMPONENT_OV_SL_DOM.buttons.deletes).click();

//     cy.checkOverrideSharedLibrariesInputs([]);

//     cy
//       .get(COMPONENT_OV_SL_DOM.buttons.save)
//       .should('be.enabled')
//       .click();

//     cy.get('mat-dialog-container').should('not.be.visible');

//     cy.checkUploadComponentSharedLibraries([]);
//   });

//   it('should close override shared libraries dialog only by clicking cancel', () => {
//     cy
//       .get('.mat-list-item-content')
//       .contains('Cont 0')
//       .click();

//     cy
//       .get('.workspace-element .mat-tab-label')
//       .eq(1)
//       .click();

//     cy.uploadFile(
//       'petals-bc-sql-1.6.3-SNAPSHOT-red-green.zip',
//       '.deploy-component input[type=file]'
//     );

//     cy.get('mat-dialog-container').should('not.be.visible');

//     cy
//       .get(COMPONENT_OV_SL_DOM.buttons.open)
//       .should('be.enabled')
//       .click();

//     cy.get('mat-dialog-container').should('be.visible');

//     cy.checkOverrideSharedLibrariesInputs(sharedLibrariesInitial);

//     cy.get(COMPONENT_OV_SL_DOM.buttons.save).should('be.enabled');

//     cy
//       .get(COMPONENT_OV_SL_DOM.buttons.deletes)
//       .eq(0)
//       .click();

//     cy.checkOverrideSharedLibrariesInputs(sharedLibrariesOneDeleted);

//     cy.get('body').type('{esc}');

//     cy
//       .get('mat-dialog-container')
//       .should('be.visible')
//       .click(0, -20);

//     cy.get('mat-dialog-container').should('be.visible');

//     cy.get(COMPONENT_OV_SL_DOM.buttons.cancel).click();

//     cy.checkUploadComponentSharedLibraries(sharedLibrariesInitial);
//   });

//   it('should not be able to override shared libraries while uploading', () => {
//     cy
//       .get('.mat-list-item-content')
//       .contains('Cont 0')
//       .click();

//     cy
//       .get('.workspace-element .mat-tab-label')
//       .eq(1)
//       .click();

//     cy.uploadFile(
//       'petals-bc-sql-1.6.3-SNAPSHOT-red-green.zip',
//       '.deploy-component input[type=file]'
//     );

//     cy.get(COMPONENT_OV_SL_DOM.buttons.open).should('be.enabled');

//     cy
//       .get(COMPONENT_UPLOAD_DOM.uploadBtn)
//       .should('be.enabled')
//       .click();

//     cy.get(COMPONENT_OV_SL_DOM.buttons.open).should('be.disabled');
//   });

//   it('should not be able to upload shared library with name and version already in container', () => {
//     cy
//       .get('.mat-list-item-content')
//       .contains('Cont 0')
//       .click();

//     cy
//       .get('.workspace-element .mat-tab-label')
//       .eq(1)
//       .click();

//     cy.uploadFile(
//       'petals-sl-hsql-1.8.0.10.zip',
//       '.deploy-shared-library input[type=file]'
//     );

//     cy.get(SL_UPLOAD_DOM.uploadBtn).should('be.enabled');

//     cy
//       .get('.deploy-shared-library input[type=text]')
//       .eq(0)
//       .clear();

//     cy
//       .get('.deploy-shared-library input[type=text]')
//       .eq(0)
//       .type('sl 0');

//     cy.get(SL_UPLOAD_DOM.uploadBtn).should('be.enabled');

//     cy
//       .get('.deploy-shared-library input[type=text]')
//       .eq(1)
//       .clear();

//     cy
//       .get('.deploy-shared-library input[type=text]')
//       .eq(1)
//       .type('1.0.0');

//     cy.get(SL_UPLOAD_DOM.uploadBtn).should('be.disabled');

//     cy
//       .get(SL_UPLOAD_DOM.errorMsg)
//       .should(
//         'contain',
//         'A shared library with this name and version already exists in this container'
//       );
//   });

//   const sharedLibrariesInitial = [
//     'SL 0',
//     '1.0.0',
//     'petals-sl-sqlserver-6.1.0.jre7',
//     '1.0.0-SNAPSHOT',
//   ];

//   const sharedLibrariesLastEmpty = [
//     'SL 0',
//     '1.0.0',
//     'petals-sl-sqlserver-6.1.0.jre7',
//     '1.0.0-SNAPSHOT',
//     '',
//     '',
//   ];

//   const sharedLibrariesOneAdded = [
//     'SL 0',
//     '1.0.0',
//     'petals-sl-sqlserver-6.1.0.jre7',
//     '1.0.0-SNAPSHOT',
//     'SL 1',
//     '2.0',
//   ];

//   const sharedLibrariesOneDeleted = [
//     'petals-sl-sqlserver-6.1.0.jre7',
//     '1.0.0-SNAPSHOT',
//   ];
// });
