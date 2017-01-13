import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

import { IBusRow } from './../../../state/buses/bus.interface';

@Component({
  selector: 'app-petals-bus-overview',
  templateUrl: './petals-bus-overview.component.html',
  styleUrls: ['./petals-bus-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetalsBusOverviewComponent implements OnInit {
  @Input() bus: IBusRow;

  constructor() { }

  ngOnInit() {
  }
}
