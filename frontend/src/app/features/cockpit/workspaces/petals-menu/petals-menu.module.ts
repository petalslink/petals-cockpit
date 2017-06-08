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

import { NgModule } from '@angular/core';

import { SharedModule } from '../../../../shared/shared.module';
import { PetalsMenuViewComponent } from './petals-menu-view/petals-menu-view.component';
import { MaterialTreeComponent } from './material-tree/material-tree.component';
import { BusesInProgressComponent } from './buses-in-progress/buses-in-progress.component';

@NgModule({
  imports: [
    SharedModule,
    // PetalsMenuRoutingModule
  ],
  declarations: [
    PetalsMenuViewComponent,
    MaterialTreeComponent,
    BusesInProgressComponent,
  ],
  exports: [PetalsMenuViewComponent],
})
export class PetalsMenuModule {}
