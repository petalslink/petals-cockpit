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
import { TestBed } from '@angular/core/testing';
import {
  EffectsTestingModule,
  EffectsRunner,
} from '@ngrx/effects/bundles/effects-testing.umd';
import { Observable } from 'rxjs/Observable';
import { NotificationsService } from 'angular2-notifications';

import { SharedLibraries } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.reducer';
import { SharedLibrariesEffects } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.effects';
import {
  SharedLibrariesService,
  ISharedLibraryBackendDetails,
} from 'app/shared/services/shared-libraries.service';

describe('SharedLibraries Effects', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [EffectsTestingModule],
      providers: [
        SharedLibrariesEffects,
        {
          provide: SharedLibrariesService,
          useValue: {
            getDetails: jest.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            success: jest.fn(),
          },
        },
      ],
    })
  );

  function setup(params?: {
    details: (id: string) => ISharedLibraryBackendDetails;
  }) {
    const services = TestBed.get(SharedLibrariesService);

    if (params && params.details) {
      services.getDetails.mockImplementation(id =>
        Observable.of(params.details(id))
      );
    }

    return {
      runner: TestBed.get(EffectsRunner) as EffectsRunner,
      effects: TestBed.get(SharedLibrariesEffects) as SharedLibrariesEffects,
      services,
    };
  }

  it('should get the details from the service', () => {
    const { runner, effects } = setup({ details: id => ({ marker: id }) });

    runner.queue({ type: SharedLibraries.FETCH_DETAILS, payload: { id: 1 } });

    effects.fetchDetails$.subscribe(res => {
      expect(res).toEqual({
        type: SharedLibraries.FETCH_DETAILS_SUCCESS,
        payload: {
          id: 1,
          data: {
            marker: 1,
          },
        },
      });
    });
  });
});
