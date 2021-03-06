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
      title: RegExp | string,
      message: RegExp | string
    ): any;
    logout(): any;

    // workspaces.commands
    expectWorkspacesListToBe(list: string[]): any;
    addWorkspace(name: string, description?: string): any;
    addWorkspaceAndExpectToFail(
      msgError: string,
      name: string,
      description?: string
    ): any;
    expectDialogDeletionWksDescriptionToBe(description: string[]): any;
    deleteWks(shouldSuccess?: boolean): any;
    detachBusAndCheck(username: string, shouldSuccess?: boolean): any;

    // workspace.commands
    expectBusListToBe(list: string[]): any;
    expectDetachBusListToBe(list: string[]): any;
    openDialogToDeleteWks(): any;
    updateWorkspaceName(
      workspaceNameText: string,
      hintLabel?: string,
      errorLabel?: string
    ): any;
    updateDescription(shortDescriptionText: string, hintLabel?: string): any;
    updateShortDescription(
      shortDescriptionText: string,
      hintLabel?: string,
      errorLabel?: string
    ): any;
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
    cancelImportBusAndCheck(
      ip: string,
      port: string,
      username: string,
      password: string,
      passphrase: string,
      shouldCancel?: boolean
    ): any;

    // buses.commands
    expectContainerListToBe(expectedContainerList: string[]): any;

    // menu.commands
    expectWorkspacesListMenuToBe(list: string[]): any;

    // petals.commands
    expectPetalsTreeToBe(
      tree: { elementName: string; state?: string; unreachable?: boolean }[]
    ): any;
    getElementInPetalsTree(type: string, name: string): any;
    foldElementInTree(type: string, name: string): any;
    unfoldElementInTree(type: string, name: string): any;
    expectHighlightedElementToBe(tree: string[]): any;

    // services.commands
    expectServicesTreeToBe(
      tree: { elementName: string }[],
      filtred?: string
    ): any;
    clickElementInTree(serviceType: string, id: string): any;
    triggerSSEForComp(name: string, id: string): any;
    triggerSSEForWks(name: string, id: string): any;

    // containers.commands
    expectSlListToBe(expectedSlList: string[]): any;

    // components.commands
    checkOverrideSharedLibrariesInputs(expectedSharedLibraries: string[]): any;
    checkUploadComponentSharedLibraries(expectedSharedLibraries: string[]): any;
    expectParametersListToBe(expectedParametersList: string[]): any;
    getParameterInLifecycleComponent(label: string, value: string): any;

    // interface.commands
    expectServicesListToBe(listServicesLocalpartsNamespace: string[]): any;
    expectItfEndpointsListToBe(expectItfEndpointsListToBe: string[]): any;
    expectInterfaceNamespaceToBe(interfaceNamespace: string): any;

    // service.commands
    expectInterfacesListToBe(listInterfacesLocalpartsNamespace: string[]): any;
    expectEndpointsSvcListToBe(
      endpointsList: {
        name: string;
        interfaces: string[];
        component: string;
        container: string;
        bus: string;
      }[]
    ): any;

    expectEndpointsItfListToBe(
      endpointsList: {
        name: string;
        interfaces: string[];
        component: string;
        container: string;
        bus: string;
      }[]
    ): any;

    // endpoint.commands
    expectEdpInterfacesListToBe(
      interfacesList: { localpart: string; namespace: string }[]
    ): any;

    // helper.commands
    expectFocused(): any;
    expectLocationToBe(pathname: string): any;
    expectMessageToBe(element: string, type: string, message: string): any;
    expectPossibleStatesListToBe(
      element: string,
      listOfPossibleState: string[]
    ): any;
    expectBreadcrumbsToBe(elements: string[]): any;
    checkLifecycleState(element: string, state: string): any;

    uploadFile(fileName: string, selector: string): any;
  }
}
