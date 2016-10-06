import { Component, Input } from '@angular/core';
import { IServiceUnit } from '../../../../../../shared-module/interfaces/petals.interface';

@Component({
  selector: 'app-service-units-menu',
  templateUrl: 'petals-service-units-menu.component.html',
  styleUrls: ['petals-service-units-menu.component.scss']
})
export class ServiceUnitsMenuComponent {
  @Input() serviceUnits: Array<IServiceUnit>;

  constructor() { }
}
