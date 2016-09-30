import { Component, Input } from '@angular/core';
import { IServiceUnit } from '../../interfaces/petals.interface';

@Component({
  selector: 'app-service-units-menu',
  templateUrl: './service-units-menu.component.html',
  styleUrls: ['./service-units-menu.component.scss']
})
export class ServiceUnitsMenuComponent {
  @Input() serviceUnits: Array<IServiceUnit>;

  constructor() { }
}
