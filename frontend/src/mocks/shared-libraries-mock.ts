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

import {
  ISharedLibraryBackendDetails,
  ISharedLibraryBackendSSE,
} from '@shared/services/shared-libraries.service';
import { Component } from './components-mock';
import { Container } from './containers-mock';

class SharedLibraries {
  private readonly sharedLibraries = new Map<string, SharedLibrary>();

  constructor() {}

  create(container: Container, name?: string, version?: string) {
    const sl = new SharedLibrary(container, name, version);
    this.sharedLibraries.set(sl.id, sl);
    return sl;
  }

  get(id: string) {
    return this.sharedLibraries.get(id);
  }

  remove(id: string) {
    const sl = this.get(id);
    this.sharedLibraries.delete(id);
    sl.container.removeSharedLibrary(id);
  }
}

export const sharedLibrariesService = new SharedLibraries();

export class SharedLibrary {
  private static cpt = 0;
  public readonly id: string;
  public readonly name: string;
  public readonly version: string;
  public readonly container: Container;
  private readonly components = new Map<string, Component>();

  constructor(container: Container, name?: string, version?: string) {
    const i = SharedLibrary.cpt++;
    this.id = `idSl${i}`;
    this.name = name ? name : `SL ${i}`;
    this.version = version ? version : `1.0.0`;
    this.container = container;
  }

  getComponents() {
    return Array.from(this.components.values());
  }

  registerComponent(component: Component) {
    this.components.set(component.id, component);
  }

  unregisterComponent(id: string) {
    this.components.delete(id);
  }

  toObj(): { [id: string]: ISharedLibraryBackendSSE } {
    return {
      [this.id]: {
        id: this.id,
        name: this.name,
        version: this.version,
        containerId: this.container.id,
        components: Array.from(this.components.keys()),
      },
    };
  }

  getDetails(): ISharedLibraryBackendDetails {
    return {};
  }
}
