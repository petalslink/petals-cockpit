import { Type } from '@angular/core';

import { BusesService } from '@shared/services/buses.service';
import { ComponentsService } from '@shared/services/components.service';
import { ContainersService } from '@shared/services/containers.service';
import { EndpointsService } from '@shared/services/endpoints.service';
import { InterfacesService } from '@shared/services/interfaces.service';
import { ServiceAssembliesService } from '@shared/services/service-assemblies.service';
import { ServiceUnitsService } from '@shared/services/service-units.service';
import { ServicesService } from '@shared/services/services.service';
import { SharedLibrariesService } from '@shared/services/shared-libraries.service';
import { SseService } from '@shared/services/sse.service';
import { UsersService } from '@shared/services/users.service';
import { WorkspacesService } from '@shared/services/workspaces.service';

export interface IEnvironment {
  /**
   * angular can optimize some part of his code
   * (make more or less checks) according to an environment
   */
  production: boolean;

  /**
   * should throw an Error if there is incoherencs in the store for example
   * only use for tests!
   */
  strictCoherence: boolean;

  /**
   * you can then use it for example in a service
   * `${environment.urlBackend}/some/resource`
   */
  urlBackend: string;

  /**
   * should the URL be
   * http://some-domain#/your/app/routes (true)
   * or
   * http://some-domain/your/app/routes (false)
   */
  hashLocationStrategy: boolean;

  /**
   * wether to display debug informations or not
   * TIP : Use console debug, console warn and console error
   * console log should be used only in dev and never commited
   * this way you can find every console log very easily
   */
  debug: boolean;

  services: IMockableServices;

  /**
   * should you keep mocks when building the app
   * or hit the real API
   */
  mock: {
    /**
     * when using mocked data, you can use that
     * variable with .delay to simulate a network latency
     */
    httpDelay: number;

    /**
     * when using mocked data, you can use that
     * variable with .delay to simulate a network latency
     */
    sseDelay: number;

    /**
     * define wether we should consider
     * that the user's already logged or not
     */
    alreadyConnected: boolean;
  };
}

export type IMockableServices = [
  {
    provide: typeof SseService;
    useClass: Type<any>;
  },
  {
    provide: typeof BusesService;
    useClass: Type<any>;
  },
  {
    provide: typeof ContainersService;
    useClass: Type<any>;
  },
  {
    provide: typeof ComponentsService;
    useClass: Type<any>;
  },
  {
    provide: typeof EndpointsService;
    useClass: Type<any>;
  },
  {
    provide: typeof InterfacesService;
    useClass: Type<any>;
  },
  {
    provide: typeof ServiceAssembliesService;
    useClass: Type<any>;
  },
  {
    provide: typeof ServiceUnitsService;
    useClass: Type<any>;
  },
  {
    provide: typeof ServicesService;
    useClass: Type<any>;
  },
  {
    provide: typeof SharedLibrariesService;
    useClass: Type<any>;
  },
  {
    provide: typeof WorkspacesService;
    useClass: Type<any>;
  },
  {
    provide: typeof UsersService;
    useClass: Type<any>;
  }
];
