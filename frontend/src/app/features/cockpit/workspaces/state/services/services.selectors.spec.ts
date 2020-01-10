/**
 * Copyright (C) 2017-2020 Linagora
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

/**
 * Need to get fixed. Return it type error when we use createSelector in this unit testing
 * See : https://gitlab.com/linagora/petals-cockpit/issues/421
 * https://stackoverflow.com/questions/48154330/uncaught-typeerror-cannot-read-property-release-of-undefined
 */

// import { getCurrentServiceTree } from '@wks/state/services/services.selectors';
// import { TreeElement } from '@shared/components/material-tree/material-tree.component';
// import { IStore } from '@shared/state/store.interface';

// describe(`Service selector`, () => {
//   describe(`getCurrentServiceTree`, () => {
//     it(`should build the generic service tree`, () => {
//       const services = [
//         '{http://namespace-example.fr/service/technique/version/1.0}Localpart0',
//         '{http://namespace-example.fr/service/technique/version/1.0}Localpart1',
//         '{http://namespace-example.fr/service/technique/version/2.0}Localpart2',
//         '{http://namespace-example.fr/service/technique/version/3.0}Localpart3',
//         '{http://namespace-example.fr/service/technique/version/3.0}Localpart4',
//       ];

//       const expectedTree: TreeElement<any>[] = [
//         {
//           name: 'http://namespace-example.fr/service/technique/version/1.0',
//           children: [
//             {
//               name: 'Localpart0',
//               children: [],
//               isFolded: false,
//               cssClass: 'item-localpart',
//             },
//             {
//               name: 'Localpart1',
//               children: [],
//               isFolded: false,
//               cssClass: 'item-localpart',
//             },
//           ],
//           isFolded: false,
//           cssClass: 'item-namespace',
//         },
//         {
//           name: 'http://namespace-example.fr/service/technique/version/2.0',
//           children: [
//             {
//               name: 'Localpart2',
//               children: [],
//               isFolded: false,
//               cssClass: 'item-localpart',
//             },
//           ],
//           isFolded: false,
//           cssClass: 'item-namespace',
//         },
//         {
//           name: 'http://namespace-example.fr/service/technique/version/3.0',
//           children: [
//             {
//               name: 'Localpart3',
//               children: [],
//               isFolded: false,
//               cssClass: 'item-localpart',
//             },
//             {
//               name: 'Localpart4',
//               children: [],
//               isFolded: false,
//               cssClass: 'item-localpart',
//             },
//           ],
//           isFolded: false,
//           cssClass: 'item-namespace',
//         },
//       ];

//       const generatedStore: Partial<IStore> = {
//         services: {
//           byId: services.reduce(
//             (acc, name, index) => ({ ...acc, [`service${index}`]: { name } }),
//             {}
//           ),
//           allIds: services.map((_, index) => `service${index}`),
//           selectedServiceId: '',
//         },
//       };

//       expect(getCurrentServiceTree(generatedStore as any)).toEqual(
//         expectedTree
//       );
//     });
//   });
// });
