import { Component, Input } from '@angular/core';
import { IBus } from '../../interfaces/petals.interface';

@Component({
  selector: 'app-bus-menu',
  templateUrl: './bus-menu.component.html',
  styleUrls: ['./bus-menu.component.scss']
})
export class BusMenuComponent {
  @Input() bus: IBus;

  constructor() {

  }
}
