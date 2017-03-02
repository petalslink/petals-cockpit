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

import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Store } from '@ngrx/store';

import { BusesServiceImpl } from './buses.service';
import { IStore } from './../interfaces/store.interface';
import { SseService } from './sse.service';
import { NotificationsService } from 'angular2-notifications';
import { busesService } from './../../../mocks/buses-mock';
import * as helper from './../helpers/mock.helper';

@Injectable()
export class BusesMockService extends BusesServiceImpl {
  constructor(
    http: Http,
    store$: Store<IStore>,
    sseService: SseService,
    notifications: NotificationsService) {
    super(http, store$, sseService, notifications);
  }

  getDetailsBus(busId: string) {
    const detailsBus = busesService.read(busId).getDetails();

    return helper.responseBody(detailsBus);
  }
}
