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

// This file gathers the contents shared between the test files.
// It avoids duplicating the code in multiple files.

export const expectedInterfacesTreeWks0 = [
  `http://namespace-example.fr/interface/technique/version/1.0`,
  `Interface-Localpart0`,
  `Interface-Localpart1`,
  `http://namespace-example.fr/interface/technique/version/2.0`,
  `Interface-Localpart2`,
  `http://namespace-example.fr/interface/technique/version/3.0`,
  `Interface-Localpart3`,
  `Interface-Localpart4`,
];

export const expectedServicesTreeWks0 = [
  `http://namespace-example.fr/service/technique/version/1.0`,
  `Localpart0`,
  `Localpart1`,
  `http://namespace-example.fr/service/technique/version/2.0`,
  `Localpart2`,
  `http://namespace-example.fr/service/technique/version/3.0`,
  `Localpart3`,
  `Localpart4`,
];

export const expectedEndpointsTreeWks0 = [
  `edpt-89p82661-test-31o4-l391-00`,
  `edpt-89p82661-test-31o4-l391-01`,
  `edpt-89p82661-test-31o4-l391-02`,
  `edpt-89p82661-test-31o4-l391-03`,
  `edpt-89p82661-test-31o4-l391-04`,
];

export const expectedInitializedWks0Tree = [
  { elementName: `Bus 0` },
  { elementName: `Cont 0` },
  { elementName: `Components` },
  { elementName: `Comp 0`, state: 'Started' },
  { elementName: `SU 0`, state: 'Started' },
  { elementName: `SU 2`, state: 'Started' },
  { elementName: `Comp 1`, state: 'Started' },
  { elementName: `SU 1`, state: 'Started' },
  { elementName: `SU 3`, state: 'Started' },
  { elementName: `Comp 2`, state: 'Started' },
  { elementName: `Service Assemblies` },
  { elementName: `SA 0`, state: 'Started' },
  { elementName: `SA 1`, state: 'Started' },
  { elementName: `SA 2`, state: 'Started' },
  { elementName: `Shared Libraries` },
  { elementName: `SL 0` },
  { elementName: `Cont 1` },
  { elementName: `Components` },
  { elementName: `Comp 3`, state: 'Started' },
  { elementName: `SU 4`, state: 'Started' },
  { elementName: `SU 6`, state: 'Started' },
  { elementName: `Comp 4`, state: 'Started' },
  { elementName: `SU 5`, state: 'Started' },
  { elementName: `SU 7`, state: 'Started' },
  { elementName: `Comp 5`, state: 'Started' },
  { elementName: `Service Assemblies` },
  { elementName: `SA 3`, state: 'Started' },
  { elementName: `SA 4`, state: 'Started' },
  { elementName: `SA 5`, state: 'Started' },
  { elementName: `Shared Libraries` },
  { elementName: `SL 1` },
];

export const expectedInitializedWks1Tree = [
  { elementName: `Bus 1` },
  { elementName: `Cont 2` },
  { elementName: `Components` },
  { elementName: `Comp 6`, state: 'Started' },
  { elementName: `SU 8`, state: 'Started' },
  { elementName: `SU 10`, state: 'Started' },
  { elementName: `Comp 7`, state: 'Started' },
  { elementName: `SU 9`, state: 'Started' },
  { elementName: `SU 11`, state: 'Started' },
  { elementName: `Comp 8`, state: 'Started' },
  { elementName: `Service Assemblies` },
  { elementName: `SA 6`, state: 'Started' },
  { elementName: `SA 7`, state: 'Started' },
  { elementName: `SA 8`, state: 'Started' },
  { elementName: `Shared Libraries` },
  { elementName: `SL 2` },
  { elementName: `Cont 3`, unreachable: true },
];

export const correctSetupToken = 'CORRECT_SETUP_TOKEN';

export const goneSetupToken = 'GONE_SETUP_TOKEN';

export const badSetupUser = 'BAD_SETUP_USER';

export const expectedDefaultUserDetailsList = [
  {
    id: 'admin',
    name: 'Administrator',
    adminWorkspace: true,
    deployArtifact: true,
    lifecycleArtifact: true,
  },
  {
    id: 'adminldap',
    name: 'Administrator LDAP',
    adminWorkspace: true,
    deployArtifact: true,
    lifecycleArtifact: true,
  },
  {
    id: 'bescudie',
    name: 'Bertrand ESCUDIE',
    adminWorkspace: false,
    deployArtifact: false,
    lifecycleArtifact: false,
  },
  {
    id: 'cchevalier',
    name: 'Christophe CHEVALIER',
    adminWorkspace: false,
    deployArtifact: true,
    lifecycleArtifact: false,
  },
  {
    id: 'mrobert',
    name: 'Maxime ROBERT',
    adminWorkspace: false,
    deployArtifact: true,
    lifecycleArtifact: true,
  },
  {
    id: 'vnoel',
    name: 'Victor NOEL',
    adminWorkspace: false,
    deployArtifact: false,
    lifecycleArtifact: true,
  },
];
