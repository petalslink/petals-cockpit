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

// Todo: Replace namespace and localpart by IQName
export function findNamespaceLocalpart(
  str: string
): { namespace: string; localpart: string } {
  const reg = /{(.+)}(.+)/;

  if (!reg.test(str)) {
    return { namespace: '', localpart: '' };
  }

  const namespace = str.match(reg)[1];
  const localpart = str.match(reg)[2];

  return { namespace, localpart };
}

export function groupByNamespace(
  arr: { id: string; namespace: string; localpart: string }[]
): { namespace: string; localparts: { id: string; name: string }[] }[] {
  return Object.values(
    arr.reduce(
      (acc, curr) => {
        const accCurrLocalparts = acc[curr.namespace]
          ? acc[curr.namespace].localparts
          : [];

        return {
          ...acc,
          [curr.namespace]: {
            namespace: curr.namespace,
            localparts: [
              ...accCurrLocalparts,
              { id: curr.id, name: curr.localpart },
            ],
          },
        };
      },
      {} as {
        [key: string]: {
          namespace: string;
          localparts: { id: string; name: string }[];
        };
      }
    )
  );
}
