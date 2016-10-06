import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { IBus } from '../../../../../../shared-module/interfaces/petals.interface';

@Component({
  selector: 'app-bus-menu',
  templateUrl: 'petals-bus-menu.component.html',
  styleUrls: ['petals-bus-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusMenuComponent {
  @Input() bus: IBus;

  constructor() {

  }
}
