import { IEnvironment } from '@env/environment.interface';
import { BusesService } from '@shared/services/buses.service';
import { BusesServiceMock } from '@shared/services/buses.service.mock';
import { ComponentsService } from '@shared/services/components.service';
import { ComponentsServiceMock } from '@shared/services/components.service.mock';
import { ContainersService } from '@shared/services/containers.service';
import { ContainersServiceMock } from '@shared/services/containers.service.mock';
import { EndpointsService } from '@shared/services/endpoints.service';
import { EndpointsServiceMock } from '@shared/services/endpoints.service.mock';
import { InterfacesService } from '@shared/services/interfaces.service';
import { InterfacesServiceMock } from '@shared/services/interfaces.service.mock';
import { LdapService } from '@shared/services/ldap.service';
import { LdapServiceMock } from '@shared/services/ldap.service.mock';
import { ServiceAssembliesService } from '@shared/services/service-assemblies.service';
import { ServiceAssembliesServiceMock } from '@shared/services/service-assemblies.service.mock';
import { ServiceUnitsService } from '@shared/services/service-units.service';
import { ServiceUnitsServiceMock } from '@shared/services/service-units.service.mock';
import { ServicesService } from '@shared/services/services.service';
import { ServicesServiceMock } from '@shared/services/services.service.mock';
import { SharedLibrariesService } from '@shared/services/shared-libraries.service';
import { SharedLibrariesServiceMock } from '@shared/services/shared-libraries.service.mock';
import { SseService } from '@shared/services/sse.service';
import { SseServiceMock } from '@shared/services/sse.service.mock';
import { UsersService } from '@shared/services/users.service';
import { UsersServiceMock } from '@shared/services/users.service.mock';
import { WorkspacesService } from '@shared/services/workspaces.service';
import { WorkspacesServiceMock } from '@shared/services/workspaces.service.mock';

export const environment: IEnvironment = {
  production: false,
  strictCoherence: true,
  urlBackend: './api',
  hashLocationStrategy: false,
  debug: true,
  services: [
    { provide: SseService, useClass: SseServiceMock },
    { provide: BusesService, useClass: BusesServiceMock },
    { provide: ContainersService, useClass: ContainersServiceMock },
    { provide: ComponentsService, useClass: ComponentsServiceMock },
    { provide: EndpointsService, useClass: EndpointsServiceMock },
    { provide: InterfacesService, useClass: InterfacesServiceMock },
    { provide: LdapService, useClass: LdapServiceMock },
    {
      provide: ServiceAssembliesService,
      useClass: ServiceAssembliesServiceMock,
    },
    { provide: ServiceUnitsService, useClass: ServiceUnitsServiceMock },
    { provide: ServicesService, useClass: ServicesServiceMock },
    { provide: SharedLibrariesService, useClass: SharedLibrariesServiceMock },
    { provide: WorkspacesService, useClass: WorkspacesServiceMock },
    { provide: UsersService, useClass: UsersServiceMock },
  ],
  mock: {
    httpDelay: 500,
    sseDelay: 500,
    alreadyConnected: true,
    ldapMode: true,
  },
};
