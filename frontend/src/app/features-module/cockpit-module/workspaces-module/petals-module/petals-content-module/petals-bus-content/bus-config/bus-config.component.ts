/**
 * Copyright (C) 2016 Linagora
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

// angular modules
import { Component, Input, Output, EventEmitter } from '@angular/core';

// our interfaces
import { IBus } from '../../../../../../../shared-module/interfaces/petals.interface';

// our services
import { WorkspaceService } from '../../../../../../../shared-module/services/workspace.service';

@Component({
  selector: 'app-bus-config',
  templateUrl: './bus-config.component.html',
  styleUrls: ['./bus-config.component.scss']
})
export class BusConfigComponent {
  @Input() bus: IBus;
  @Output() onUpdate: EventEmitter<any> = new EventEmitter();

  constructor(private workspaceService: WorkspaceService) { }

  updateBusConfig() {
    this.onUpdate.next();

    // TODO: Do not use service directly from a component
    // use effects from ngrx
    // this.workspaceService
    //   .saveBusConfig(this.bus)
    //   .subscribe(
    //     (r: Response) => {console.log('success');}
    //   );
  }
}
