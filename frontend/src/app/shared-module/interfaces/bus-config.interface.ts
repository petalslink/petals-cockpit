/**
 * Copyright (C) 2016 Linagora
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

// typed-record
import { TypedRecord } from 'typed-immutable-record';

export interface IBusConfig {
  ip: string;
  port: number;
  login: string;
  password: string;
  componentType: [{
    name: string;
    version: string;
  }];
  topology: [{
    domain: [{
      name: string;
      mode: string;
      description: string;
    }],
    registry: [{
      registry_implementation: string;
      registry_configuration: [{
        group_name: string;
        group_password: string;
        overlay_members: [{
          host_name: string;
          port: number;
        }]
      }]
    }]
  }];
}

export interface IBusConfigRecord extends TypedRecord<IBusConfigRecord>, IBusConfig { };
