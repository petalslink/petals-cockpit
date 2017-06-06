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

import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

import { IBusRow } from '../../../state/buses/buses.interface';
import { IContainerRow } from 'app/features/cockpit/workspaces/state/containers/containers.interface';

@Component({
  selector: 'app-petals-bus-overview',
  templateUrl: './petals-bus-overview.component.html',
  styleUrls: ['./petals-bus-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetalsBusOverviewComponent implements OnInit {
  @Input() bus: IBusRow;
  @Input() containers: IContainerRow[];
  @Input() workspaceId: string;

  public config: any = {
    pagination: '.swiper-pagination',
    nextButton: '.swiper-button-next',
    prevButton: '.swiper-button-prev',
    direction: 'horizontal',
    mousewheelControl: true,
    slidesPerView: 'auto',
    centeredSlides: false,
    paginationClickable: true,
    keyboardControl: true,
    spaceBetween: 4,
    freeMode: true,
    grabCursor: true,
    paginationHide: false,
    paginationType: 'fraction',
  };

  constructor() { }

  ngOnInit() {
  }
}
