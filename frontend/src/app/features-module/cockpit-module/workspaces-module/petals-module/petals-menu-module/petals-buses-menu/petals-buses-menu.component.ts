import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import {IBus} from "../../../../../../shared-module/interfaces/petals.interface";

@Component({
  selector: 'app-buses-menu',
  templateUrl: 'petals-buses-menu.component.html',
  styleUrls: ['petals-buses-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusesMenuComponent {
  @Input() buses: Array<IBus>;

  constructor() { }
}
