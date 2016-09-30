import { Component, Input } from '@angular/core';
import { IBus } from '../../interfaces/petals.interface';

@Component({
  selector: 'app-buses-menu',
  templateUrl: './buses-menu.component.html',
  styleUrls: ['./buses-menu.component.scss']
})
export class BusesMenuComponent {
  @Input() buses: Array<IBus>;

  constructor() { }
}
