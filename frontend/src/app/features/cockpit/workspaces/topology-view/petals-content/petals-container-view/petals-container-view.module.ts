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

import { NgModule } from '@angular/core';
import { VisModule } from 'ngx-vis';

import { SharedModule } from '@shared/shared.module';
import { PetalsContainerViewRoutingModule } from './petals-container-view-routing.module';

import { ArtifactsDeploymentComponent } from './artifacts-deployment/artifacts-deployment.component';
import { SharedLibrariesOverrideComponent } from './artifacts-deployment/shared-libraries-override/shared-libraries-override.component';
import { PetalsContainerViewComponent } from './petals-container-view.component';

@NgModule({
  imports: [SharedModule, PetalsContainerViewRoutingModule, VisModule],
  declarations: [
    PetalsContainerViewComponent,
    ArtifactsDeploymentComponent,
    SharedLibrariesOverrideComponent,
  ],
})
export class PetalsContainerViewModule {}
