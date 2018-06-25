import { BusesService, BusesServiceImpl } from '@shared/services/buses.service';
import {
  ComponentsService,
  ComponentsServiceImpl,
} from '@shared/services/components.service';
import {
  ContainersService,
  ContainersServiceImpl,
} from '@shared/services/containers.service';
import {
  EndpointsService,
  EndpointsServiceImpl,
} from '@shared/services/endpoints.service';
import {
  InterfacesService,
  InterfacesServiceImpl,
} from '@shared/services/interfaces.service';
import {
  ServiceAssembliesService,
  ServiceAssembliesServiceImpl,
} from '@shared/services/service-assemblies.service';
import {
  ServiceUnitsService,
  ServiceUnitsServiceImpl,
} from '@shared/services/service-units.service';
import {
  ServicesService,
  ServicesServiceImpl,
} from '@shared/services/services.service';
import {
  SharedLibrariesService,
  SharedLibrariesServiceImpl,
} from '@shared/services/shared-libraries.service';
import { SseService, SseServiceImpl } from '@shared/services/sse.service';
import { UsersService, UsersServiceImpl } from '@shared/services/users.service';
import {
  WorkspacesService,
  WorkspacesServiceImpl,
} from '@shared/services/workspaces.service';
import { IEnvironment } from './environment.interface';

// CAREFUL: do NOT reference any of the dev files because it would import all of the mocks in the production build!

export const environment: IEnvironment = {
  urlBackend: './api',
  hashLocationStrategy: false,
  production: true,
  strictCoherence: false,
  debug: false,
  services: [
    { provide: SseService, useClass: SseServiceImpl },
    { provide: BusesService, useClass: BusesServiceImpl },
    { provide: ContainersService, useClass: ContainersServiceImpl },
    { provide: ComponentsService, useClass: ComponentsServiceImpl },
    { provide: EndpointsService, useClass: EndpointsServiceImpl },
    { provide: InterfacesService, useClass: InterfacesServiceImpl },
    {
      provide: ServiceAssembliesService,
      useClass: ServiceAssembliesServiceImpl,
    },
    { provide: ServiceUnitsService, useClass: ServiceUnitsServiceImpl },
    { provide: ServicesService, useClass: ServicesServiceImpl },
    { provide: SharedLibrariesService, useClass: SharedLibrariesServiceImpl },
    { provide: WorkspacesService, useClass: WorkspacesServiceImpl },
    { provide: UsersService, useClass: UsersServiceImpl },
  ],
  mock: undefined,
};
