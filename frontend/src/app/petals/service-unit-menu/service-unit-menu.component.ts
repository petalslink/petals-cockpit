import { Component, Input } from '@angular/core';
import { IServiceUnit } from '../../interfaces/petals.interface';

@Component({
  selector: 'app-service-unit-menu',
  templateUrl: './service-unit-menu.component.html',
  styleUrls: ['./service-unit-menu.component.scss']
})

export class ServiceUnitMenuComponent {
  @Input() serviceUnit: IServiceUnit;

  constructor() { }
}
