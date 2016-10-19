import { Map } from 'immutable';

export interface IBusConfig extends Map<any, any> {
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
