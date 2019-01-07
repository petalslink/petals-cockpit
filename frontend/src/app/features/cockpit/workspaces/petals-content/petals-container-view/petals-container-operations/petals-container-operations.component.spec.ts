/**
 * Copyright (C) 2017-2019 Linagora
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

import { HttpClient } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, Injectable } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SimpleNotificationsModule } from 'angular2-notifications';

import { of, throwError } from 'rxjs';

import {
  ComponentsService,
  ComponentsServiceImpl,
} from '@shared/services/components.service';
import { ServiceAssembliesService } from '@shared/services/service-assemblies.service';
import { SharedLibrariesService } from '@shared/services/shared-libraries.service';
import { metaReducers, reducers } from '@shared/state/root.reducer';
import { PetalsContainerOperationsComponent } from '@wks/petals-content/petals-container-view/petals-container-operations/petals-container-operations.component';

describe(`Petals container operations`, () => {
  let pcoFixture: ComponentFixture<PetalsContainerOperationsComponent>;
  let pcoComponent: PetalsContainerOperationsComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PetalsContainerOperationsComponent],
      imports: [
        StoreModule.forRoot(reducers, {
          metaReducers,
        }),
        EffectsModule.forRoot([]),
        MatDialogModule,
        MatInputModule,
        ReactiveFormsModule,
        SimpleNotificationsModule.forRoot(),
      ],
      providers: [
        {
          provide: ComponentsService,
          useClass: ComponentsServiceImpl,
        },
        {
          provide: SharedLibrariesService,
          useClass: SharedLibrariesMockService,
        },
        {
          provide: ServiceAssembliesService,
          useClass: ServiceAssembliesMockService,
        },
        { provide: HttpClient, useValue: {} },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    pcoFixture = TestBed.createComponent(PetalsContainerOperationsComponent);
    pcoComponent = pcoFixture.componentInstance;
    pcoComponent.sharedLibrariesByNameAndVersion = {
      '{"name":"sl 0","version":"1.0.0"}': true,
    };

    pcoComponent.ngOnInit();
  });

  describe(`change component name`, () => {
    it(`should mark the name as touched into component form when a file is selected`, () => {
      pcoComponent.fileSelected('component', null);

      expect(
        pcoComponent.updateComponentDeployInfoFormGroup.get('name').touched
      ).toBe(true);
    });

    it(
      `should get the name of the component into the selected zip file and display it into the form`,
      fakeAsync(() => {
        const componentsService: ComponentsService = TestBed.get(
          ComponentsService
        );
        pcoComponent.sharedLibrariesByNameAndVersion = {};

        spyOn(
          componentsService,
          'getComponentInformationFromZipFile'
        ).and.returnValue(
          of({
            name: 'some content from zip',
            sharedLibraries: [
              { name: 'SL 1', version: '1.0' },
              { name: 'SL 2', version: '2.0' },
            ],
          })
        );

        pcoComponent.fileSelected('component', null);
        flush();

        expect(
          componentsService.getComponentInformationFromZipFile
        ).toHaveBeenCalled();

        expect(
          pcoComponent.updateComponentDeployInfoFormGroup.get('name').value
        ).toEqual('some content from zip');

        expect(pcoComponent.slsInfoReadFromZip).toEqual([
          { name: 'SL 1', version: '1.0' },
          { name: 'SL 2', version: '2.0' },
        ]);

        expect(pcoComponent.slIsInCurrentContainer).toEqual([false, false]);
      })
    );

    it(
      `should display a warning notification if the component's name couldn't be read from zip file`,
      fakeAsync(() => {
        const componentsService: ComponentsService = TestBed.get(
          ComponentsService
        );

        spyOn((<any>pcoComponent).notifications, 'warn');

        spyOn(
          componentsService,
          'getComponentInformationFromZipFile'
        ).and.returnValue(throwError(new Error('Error while reading ZIP')));

        pcoComponent.fileSelected('component', null);
        flush();

        expect(
          pcoComponent.updateComponentDeployInfoFormGroup.get('name').value
        ).toEqual('');

        expect((<any>pcoComponent).notifications.warn).toHaveBeenCalledWith(
          'File error',
          `An error occurred while trying to read the component name from this zip file`
        );
      })
    );
  });

  describe(`change shared library name`, () => {
    it(`should mark the name and version as touched into shared library form when a file is selected`, () => {
      pcoComponent.fileSelected('shared-library', null);

      expect(
        pcoComponent.updateSharedLibraryDeployInfoFormGroup.get('name').touched
      ).toBe(true);
      expect(
        pcoComponent.updateSharedLibraryDeployInfoFormGroup.get('version')
          .touched
      ).toBe(true);
    });

    it(
      `should get the name and version of the shared library into the selected zip file and display it into the form`,
      fakeAsync(() => {
        const sharedLibrariesService: SharedLibrariesMockService = TestBed.get(
          SharedLibrariesService
        );

        spyOn(
          sharedLibrariesService,
          'getSharedLibraryInformationFromZipFile'
        ).and.callThrough();

        pcoComponent.fileSelected('shared-library', null);
        flush();

        expect(
          sharedLibrariesService.getSharedLibraryInformationFromZipFile
        ).toHaveBeenCalled();
        expect(
          pcoComponent.updateSharedLibraryDeployInfoFormGroup.get('name').value
        ).toEqual('some content from zip');
        expect(
          pcoComponent.updateSharedLibraryDeployInfoFormGroup.get('version')
            .value
        ).toEqual('1.0');
      })
    );

    it(
      `should display a warning notification if the shared library's name couldn't be read from zip file`,
      fakeAsync(() => {
        const sharedLibrariesService: SharedLibrariesMockService = TestBed.get(
          SharedLibrariesService
        );

        spyOn((<any>pcoComponent).notifications, 'warn');

        spyOn(
          sharedLibrariesService,
          'getSharedLibraryInformationFromZipFile'
        ).and.returnValue(throwError(new Error('Error while reading ZIP')));

        pcoComponent.fileSelected('shared-library', null);
        flush();

        expect(
          pcoComponent.updateSharedLibraryDeployInfoFormGroup.get('name').value
        ).toEqual('');

        expect(
          pcoComponent.updateSharedLibraryDeployInfoFormGroup.get('version')
            .value
        ).toEqual('');

        expect((<any>pcoComponent).notifications.warn).toHaveBeenCalledWith(
          'File error',
          `An error occurred while trying to read the shared library information from this zip file`
        );
      })
    );
  });

  describe(`change service assembly name`, () => {
    it(`should mark the name as touched into service assembly form when a file is selected`, () => {
      pcoComponent.fileSelected('service-assembly', null);

      expect(
        pcoComponent.updateServiceAssemblyDeployInfoFormGroup.get('name')
          .touched
      ).toBe(true);
    });

    it(
      `should get the name of the service assembly into the selected zip file and display it into the form`,
      fakeAsync(() => {
        const serviceAssembliesService: ServiceAssembliesMockService = TestBed.get(
          ServiceAssembliesService
        );

        spyOn(
          serviceAssembliesService,
          'getServiceAssemblyNameFromZipFile'
        ).and.callThrough();

        pcoComponent.fileSelected('service-assembly', null);
        flush();

        expect(
          serviceAssembliesService.getServiceAssemblyNameFromZipFile
        ).toHaveBeenCalled();
        expect(
          pcoComponent.updateServiceAssemblyDeployInfoFormGroup.get('name')
            .value
        ).toEqual('some content from zip');
      })
    );

    it(
      `should display a warning notification if the service assembly's name couldn't be read from zip file`,
      fakeAsync(() => {
        const serviceAssembliesService: ServiceAssembliesMockService = TestBed.get(
          ServiceAssembliesService
        );

        spyOn((<any>pcoComponent).notifications, 'warn');

        spyOn(
          serviceAssembliesService,
          'getServiceAssemblyNameFromZipFile'
        ).and.returnValue(throwError(new Error('Error while reading ZIP')));

        pcoComponent.fileSelected('service-assembly', null);
        flush();

        expect(
          pcoComponent.updateServiceAssemblyDeployInfoFormGroup.get('name')
            .value
        ).toEqual('');

        expect((<any>pcoComponent).notifications.warn).toHaveBeenCalledWith(
          'File error',
          `An error occurred while trying to read the service assembly name from this zip file`
        );
      })
    );
  });
});

@Injectable()
export class SharedLibrariesMockService {
  constructor() {}

  getSharedLibraryInformationFromZipFile() {
    return of({ name: 'some content from zip', version: '1.0' });
  }
}

@Injectable()
export class ServiceAssembliesMockService {
  constructor() {}

  getServiceAssemblyNameFromZipFile() {
    return of('some content from zip');
  }
}
