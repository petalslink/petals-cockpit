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

import { SharedModule } from '@shared/shared.module';
import {
  WorkspaceElementComponent,
  WorkspaceElementTabDirective,
} from '@wks/workspace-element/workspace-element.component';

const declarationsAndExports = [
  WorkspaceElementComponent,
  WorkspaceElementTabDirective,
];

@NgModule({
  imports: [SharedModule],
  declarations: declarationsAndExports,
  exports: declarationsAndExports,
})
export class WorkspaceSharedModule {}
