/**
 * Copyright (C) 2018 Linagora
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

declare namespace Cypress {
  interface Chainable<Subject = any> {
    // login.commands
    login(username: string, password: string, shouldSuccess?: boolean): any;

    // setup.commands
    setupUserAndExpectToFail(username: string, msgError: string): any;

    // setup-no-ldap.commands
    setupNoLdapUserAndExpectToFail(
      username: string,
      password: string,
      name: string,
      msgError: string
    ): any;

    // administration.commands
    expectLdapSearchUsersListToBe(
      listUserNames: string[],
      listUserIds: string[]
    ): any;
    expectHighlightedUserIdToBe(listIds: string[]): any;
    expectHighlightedUserNameToBe(listNames: string[]): any;
    expectLdapUsersListToBe(titleIds: string[], titleNames: string[]): any;
    expectUsersListToBe(titleIds: string[], titleNames: string[]): any;

    // petals-cockpit.commands
    expectNotification(
      type: string,
      title: string,
      message: RegExp | string
    ): any;
    logout(): any;

    // workspaces.commands
    expectWorkspacesListToBe(list: string[]): any;
    addWorkspace(name: string): any;
    expectDialogDeletionWksDescriptionToBe(description: string[]): any;
    deleteWks(shouldSuccess?: boolean): any;

    // workspace.commands
    openDialogToDeleteWks(): any;

    // petals.commands
    expectPetalsTreeToBe(tree: string[]): any;
    getElementInPetalsTree(type: string, name: string): any;
    foldElementInTree(type: string, name: string): any;
    unfoldElementInTree(type: string, name: string): any;
    expectHighlightedElementToBe(tree: string[]): any;

    // services.commands
    expectInterfacesTreeToBe(tree: string[]): any;
    expectServicesTreeToBe(tree: string[]): any;
    expectEndpointsTreeToBe(tree: string[]): any;
    clickElementInTree(expPanel: string, name: string): any;
    triggerSSEForComp(name: string, id: string): any;
    triggerSSEForWks(name: string, id: string): any;

    // import-bus.commands
    expectBusImportFields(): any;
    addBusImportInformations(
      ip: string,
      port: string,
      username: string,
      password: string,
      passphrase: string
    ): any;
    importBusAndCheck(
      ip: string,
      port: string,
      username: string,
      password: string,
      passphrase: string,
      shouldSuccess?: boolean
    ): any;

    // components.commands
    getActionStateInLifecycleComponent(name: string): any;
    checkOverrideSharedLibrariesInputs(expectedSharedLibraries: string[]): any;
    checkUploadComponentSharedLibraries(expectedSharedLibraries: string[]): any;

    // interface.commands
    expectServicesListToBe(listServicesLocalpartsNamespace: string[]): any;
    expectItfEndpointsListToBe(expectItfEndpointsListToBe: string[]): any;
    expectInterfaceNamespaceToBe(interfaceNamespace: string): any;

    // service.commands
    expectInterfacesListToBe(listInterfacesLocalpartsNamespace: string[]): any;
    expectServiceNamespaceToBe(serviceNamespace: string): any;
    expectEndpointsListToBe(list: string[]): any;

    // endpoint.commands
    expectEdpInterfacesListToBe(
      listInterfacesLocalpartsNamespaces: string[]
    ): any;

    // helper.commands
    expectFocused(): any;
    expectLocationToBe(pathname: string): any;
    expectMessageToBe(element: string, type: string, message: string): any;
    uploadFile(fileName: string, selector: string): any;
  }
}
