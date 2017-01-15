import { Component, OnInit, Input } from '@angular/core';

import { IBusesInProgress } from './../../state/buses-in-progress/buses-in-progress.interface';

@Component({
  selector: 'app-buses-in-progress',
  templateUrl: './buses-in-progress.component.html',
  styleUrls: ['./buses-in-progress.component.scss']
})
export class BusesInProgressComponent implements OnInit {
  @Input() busesInProgress: IBusesInProgress;

  constructor() { }

  ngOnInit() {
  }
}
