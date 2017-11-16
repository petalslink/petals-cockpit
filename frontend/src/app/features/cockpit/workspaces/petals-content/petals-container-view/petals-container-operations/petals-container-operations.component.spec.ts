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
import { ComponentsService } from 'app/shared/services/components.service';
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
          useClass: ComponentsMockService,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    pcoFixture = TestBed.createComponent(PetalsContainerOperationsComponent);
    pcoComponent = pcoFixture.componentInstance;

    pcoComponent.ngOnInit();
  });

  it(`should mark the name as touched into component form when a file is selected`, () => {
    pcoComponent.onFileSelected(null);

    expect(
      pcoComponent.updateComponentDeployInfoFormGroup.get('name').touched
    ).toBe(true);
  });

  it(
    `should get the name of the component into the selected zip file and display it into the form`,
    fakeAsync(() => {
      const componentsService: ComponentsMockService = TestBed.get(
        ComponentsService
      );

      spyOn(componentsService, 'getComponentNameFromZipFile').and.callThrough();

      pcoComponent.onFileSelected(null);
      flush();

      expect(componentsService.getComponentNameFromZipFile).toHaveBeenCalled();
      expect(
        pcoComponent.updateComponentDeployInfoFormGroup.get('name').value
      ).toEqual('some content from zip');
    })
  );

  it(
    `should display a warning notification if the component's name couldn't be read from zip file`,
    fakeAsync(() => {
      const componentsService: ComponentsMockService = TestBed.get(
        ComponentsService
      );

      spyOn((<any>pcoComponent).notifications, 'warn');

      spyOn(componentsService, 'getComponentNameFromZipFile').and.returnValue(
        _throw(new Error('Error while reading ZIP'))
      );

      pcoComponent.onFileSelected(null);
      flush();

      expect(
        pcoComponent.updateComponentDeployInfoFormGroup.get('name').value
      ).toEqual('');

      expect((<any>pcoComponent).notifications.warn).toHaveBeenCalledWith(
        'File error',
        `An error occurred while trying to read the component's name from zip file`
      );
    })
  );
});

@Injectable()
export class ComponentsMockService {
  constructor() {}

  getComponentNameFromZipFile() {
    return of('some content from zip');
  }
}
