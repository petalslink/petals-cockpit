import { BusesService } from 'app/shared/services/buses.service';
import { BusesServiceMock } from 'app/shared/services/buses.service.mock';
import { ComponentsService } from 'app/shared/services/components.service';
import { ComponentsServiceMock } from 'app/shared/services/components.service.mock';
import { ContainersService } from 'app/shared/services/containers.service';
import { ContainersServiceMock } from 'app/shared/services/containers.service.mock';
import { ServiceAssembliesService } from 'app/shared/services/service-assemblies.service';
import { ServiceAssembliesServiceMock } from 'app/shared/services/service-assemblies.service.mock';
import { ServiceUnitsService } from 'app/shared/services/service-units.service';
import { ServiceUnitsServiceMock } from 'app/shared/services/service-units.service.mock';
import { SharedLibrariesService } from 'app/shared/services/shared-libraries.service';
import { SharedLibrariesServiceMock } from 'app/shared/services/shared-libraries.service.mock';
import { SseService } from 'app/shared/services/sse.service';
import { SseServiceMock } from 'app/shared/services/sse.service.mock';
import { UsersService } from 'app/shared/services/users.service';
import { UsersServiceMock } from 'app/shared/services/users.service.mock';
import { WorkspacesService } from 'app/shared/services/workspaces.service';
import { WorkspacesServiceMock } from 'app/shared/services/workspaces.service.mock';
import { IEnvironment } from './environment.interface';

export const environment: IEnvironment = {
  production: false,
  strictCoherence: true,
  urlBackend: './api',
  hashLocationStrategy: false,
  debug: true,
  services: [
    {
      provide: SseService,
      useClass: SseServiceMock,
    },
    {
      provide: BusesService,
      useClass: BusesServiceMock,
    },
    {
      provide: ContainersService,
      useClass: ContainersServiceMock,
    },
    {
      provide: ComponentsService,
      useClass: ComponentsServiceMock,
    },
    {
      provide: ServiceAssembliesService,
      useClass: ServiceAssembliesServiceMock,
    },
    {
      provide: ServiceUnitsService,
      useClass: ServiceUnitsServiceMock,
    },
    {
      provide: SharedLibrariesService,
      useClass: SharedLibrariesServiceMock,
    },
    {
      provide: WorkspacesService,
      useClass: WorkspacesServiceMock,
    },
    {
      provide: UsersService,
      useClass: UsersServiceMock,
    },
  ],
  mock: {
    httpDelay: 500,
    sseDelay: 500,
    alreadyConnected: true,
  },
};
