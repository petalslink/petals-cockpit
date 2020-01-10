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

export const expectedTreeBeforeDeploy = [
  `Bus 0`,
  `Cont 0`,
  `Components`,
  `Comp 0`,
  `SU 0`,
  `SU 2`,
  `Comp 1`,
  `SU 1`,
  `SU 3`,
  `Comp 2`,
  `Service Assemblies`,
  `SA 0`,
  `SA 1`,
  `SA 2`,
  `Shared Libraries`,
  `SL 0`,
  `Cont 1`,
  `Components`,
  `Comp 3`,
  `SU 4`,
  `SU 6`,
  `Comp 4`,
  `SU 5`,
  `SU 7`,
  `Comp 5`,
  `Service Assemblies`,
  `SA 3`,
  `SA 4`,
  `SA 5`,
  `Shared Libraries`,
  `SL 1`,
];

export const correctSetupToken = 'CORRECT_SETUP_TOKEN';

export const goneSetupToken = 'GONE_SETUP_TOKEN';

export const badSetupUser = 'BAD_SETUP_USER';
