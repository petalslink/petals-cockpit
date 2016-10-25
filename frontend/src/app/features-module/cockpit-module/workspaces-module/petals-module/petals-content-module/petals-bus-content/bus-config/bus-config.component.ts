import { Component, Input, Output, EventEmitter } from '@angular/core';

// our interfaces
import { IBus } from '../../../../../../../shared-module/interfaces/petals.interface';
import { Response } from '@angular/http';
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
/*    this.onUpdate.next();
    console.log('Update Bus ...');
    alert(`Config Bus Saved works ! ${JSON.stringify(this.bus)}`);*/
    this.onUpdate.next();
    this.workspaceService
      .saveBusConfig(this.bus)
      .subscribe(
        (r: Response) => {console.log('success');}
      );
  }
}
