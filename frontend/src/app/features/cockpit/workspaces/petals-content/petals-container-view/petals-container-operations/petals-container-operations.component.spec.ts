/**
 * Copyright (C) 2017 Linagora
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
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { of } from 'rxjs/observable/of';
import { _throw } from 'rxjs/observable/throw';

import { PetalsContainerOperationsComponent } from 'app/features/cockpit/workspaces/petals-content/petals-container-view/petals-container-operations/petals-container-operations.component';
import {
  ComponentsService,
  ComponentsServiceImpl,
} from 'app/shared/services/components.service';
import { ServiceAssembliesService } from 'app/shared/services/service-assemblies.service';
import { SharedLibrariesService } from 'app/shared/services/shared-libraries.service';
import { metaReducers, reducers } from 'app/shared/state/root.reducer';

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

    pcoComponent.ngOnInit();
  });

  describe(`change component name`, () => {
    it(`should mark the name as touched into component form when a file is selected`, () => {
      pcoComponent.onFileSelected('component', null);

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
        pcoComponent.sharedLibrariesByName = {};

        spyOn(
          componentsService,
          'getComponentInformationFromZipFile'
        ).and.returnValue(
          of({
            name: 'some content from zip',
            sharedLibrariesName: ['SL 1', 'SL 2'],
          })
        );

        pcoComponent.onFileSelected('component', null);
        flush();

        expect(
          componentsService.getComponentInformationFromZipFile
        ).toHaveBeenCalled();

        expect(
          pcoComponent.updateComponentDeployInfoFormGroup.get('name').value
        ).toEqual('some content from zip');

        expect(pcoComponent.slsInfoReadFromZip).toEqual([
          { name: 'SL 1', isInCurrentContainer: false },
          { name: 'SL 2', isInCurrentContainer: false },
        ]);
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
        ).and.returnValue(_throw(new Error('Error while reading ZIP')));

        pcoComponent.onFileSelected('component', null);
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
      pcoComponent.onFileSelected('shared-library', null);

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

        pcoComponent.onFileSelected('shared-library', null);
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
        ).and.returnValue(_throw(new Error('Error while reading ZIP')));

        pcoComponent.onFileSelected('shared-library', null);
        flush();

        expect(
          pcoComponent.updateSharedLibraryDeployInfoFormGroup.get('name').value
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
      pcoComponent.onFileSelected('service-assembly', null);

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

        pcoComponent.onFileSelected('service-assembly', null);
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
        ).and.returnValue(_throw(new Error('Error while reading ZIP')));

        pcoComponent.onFileSelected('service-assembly', null);
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