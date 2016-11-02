// angular modules
import { Component, Input } from '@angular/core';

// our interfaces
import { IBus } from '../../../../../../../shared-module/interfaces/petals.interface';

@Component({
  selector: 'app-bus-overview',
  templateUrl: './bus-overview.component.html',
  styleUrls: ['./bus-overview.component.scss']
})
export class BusOverviewComponent {
  @Input() bus: IBus;

  constructor() { }
}
