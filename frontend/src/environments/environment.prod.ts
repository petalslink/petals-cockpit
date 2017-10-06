import {
  BusesService,
  BusesServiceImpl,
} from 'app/shared/services/buses.service';
import {
  ComponentsService,
  ComponentsServiceImpl,
} from 'app/shared/services/components.service';
import {
  ContainersService,
  ContainersServiceImpl,
} from 'app/shared/services/containers.service';
import {
  ServiceAssembliesService,
  ServiceAssembliesServiceImpl,
} from 'app/shared/services/service-assemblies.service';
import {
  ServiceUnitsService,
  ServiceUnitsServiceImpl,
} from 'app/shared/services/service-units.service';
import {
  SharedLibrariesService,
  SharedLibrariesServiceImpl,
} from 'app/shared/services/shared-libraries.service';
import { SseService, SseServiceImpl } from 'app/shared/services/sse.service';
import {
  UsersService,
  UsersServiceImpl,
} from 'app/shared/services/users.service';
import {
  WorkspacesService,
  WorkspacesServiceImpl,
} from 'app/shared/services/workspaces.service';
import { IEnvironment } from './environment.interface';

// CAREFUL: do NOT reference any of the dev files because it would import all of the mocks in the production build!

export const environment: IEnvironment = {
  urlBackend: './api',
  hashLocationStrategy: false,
  production: true,
  strictCoherence: false,
  debug: false,
  services: [
    {
      provide: SseService,
      useClass: SseServiceImpl,
    },
    {
      provide: BusesService,
      useClass: BusesServiceImpl,
    },
    {
      provide: ContainersService,
      useClass: ContainersServiceImpl,
    },
    {
      provide: ComponentsService,
      useClass: ComponentsServiceImpl,
    },
    {
      provide: ServiceAssembliesService,
      useClass: ServiceAssembliesServiceImpl,
    },
    {
      provide: ServiceUnitsService,
      useClass: ServiceUnitsServiceImpl,
    },
    {
      provide: SharedLibrariesService,
      useClass: SharedLibrariesServiceImpl,
    },
    {
      provide: WorkspacesService,
      useClass: WorkspacesServiceImpl,
    },
    {
      provide: UsersService,
      useClass: UsersServiceImpl,
    },
  ],
  mock: undefined,
};
