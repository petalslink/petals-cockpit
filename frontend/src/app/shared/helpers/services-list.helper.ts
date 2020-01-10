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

export interface IQName {
  namespace: string;
  localpart: string;
}

export function findNamespaceLocalpart(str: string): IQName {
  if (str) {
    const res = str.match(/{(.+)}(.+)/);
    if (res) {
      return { namespace: res[1], localpart: res[2] };
    }
  }
  return { namespace: '', localpart: '' };
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
