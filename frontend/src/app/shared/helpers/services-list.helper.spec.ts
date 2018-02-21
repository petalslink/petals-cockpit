/**
 * Copyright (C) 2017-2018 Linagora
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

import {
  findNamespaceLocalpart,
  groupByNamespace,
} from 'app/shared/helpers/services-list.helper';

describe('Services list', () => {
  describe('findNamespaceLocalpart', () => {
    it(`should have services organized by namespace`, () => {
      const services = [
        '{http://namespace-example.fr/service/technique/version/1.0}Localpart0',
        '{http://namespace-example.fr/service/technique/version/1.1}Localpart0',
        '{http://namespace-example.fr/service/technique/version/1.2}Localpart1',
        '{http://namespace-example.fr/service/technique/version/1.3}Localpart2',
      ];

      const expectedNamespaceLocalpart = [
        {
          namespace:
            'http://namespace-example.fr/service/technique/version/1.0',
          localpart: 'Localpart0',
        },
        {
          namespace:
            'http://namespace-example.fr/service/technique/version/1.1',
          localpart: 'Localpart0',
        },
        {
          namespace:
            'http://namespace-example.fr/service/technique/version/1.2',
          localpart: 'Localpart1',
        },
        {
          namespace:
            'http://namespace-example.fr/service/technique/version/1.3',
          localpart: 'Localpart2',
        },
      ];

      const transformedServices = services.map(findNamespaceLocalpart);
      expect(transformedServices).toEqual(expectedNamespaceLocalpart);
    });

    it(`should return empty namespace and empty localpart if not found`, () => {
      expect(findNamespaceLocalpart('random')).toEqual({
        namespace: '',
        localpart: '',
      });
    });
  });

  describe('groupByNamespace', () => {
    it(`should group by namespace`, () => {
      const namespaceAndLocalpartList = [
        {
          namespace:
            'http://namespace-example.fr/service/technique/version/1.0',
          localpart: 'Localpart0',
          id: 'idService1',
        },
        {
          namespace:
            'http://namespace-example.fr/service/technique/version/1.0',
          localpart: 'Localpart1',
          id: 'idService2',
        },
        {
          namespace:
            'http://namespace-example.fr/service/technique/version/2.0',
          localpart: 'Localpart3',
          id: 'idService3',
        },
      ];

      const expected: {
        namespace: string;
        localparts: { id: string; name: string }[];
      }[] = [
        {
          namespace:
            'http://namespace-example.fr/service/technique/version/1.0',
          localparts: [
            { id: 'idService1', name: 'Localpart0' },
            { id: 'idService2', name: 'Localpart1' },
          ],
        },
        {
          namespace:
            'http://namespace-example.fr/service/technique/version/2.0',
          localparts: [{ id: 'idService3', name: 'Localpart3' }],
        },
      ];

      expect(groupByNamespace(namespaceAndLocalpartList)).toEqual(expected);
    });
  });
});
