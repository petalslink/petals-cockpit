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
