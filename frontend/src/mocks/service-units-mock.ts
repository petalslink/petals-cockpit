/**
 * Copyright (C) 2017 Linagora
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

class ServiceUnits {
  private serviceUnits = new Map<string, ServiceUnit>();

  constructor() { }

  create(name?: string) {
    const serviceUnit = new ServiceUnit(name);
    this.serviceUnits.set(serviceUnit.getId(), serviceUnit);
    return serviceUnit;
  }

  get(id: string) {
    return this.serviceUnits.get(id);
  }
}

export const serviceUnitsService = new ServiceUnits();

export class ServiceUnit {
  private static cpt = 0;
  private id: string;
  private state = 'Started';
  private name: string;

  constructor(name?: string) {
    const i = ServiceUnit.cpt++;
    this.id = `idSu${i}`;
    this.name = name ? name : `SU ${i}`;
  }

  public getId() {
    return this.id;
  }

  toObj() {
    return {
      [this.id]: {
        name: this.name
      }
    };
  }

  getDetails() {
    return {
      name: this.name,
      state: this.state
    };
  }

  setState(newState: string) {
    this.state = newState;
  }
}
