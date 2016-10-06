import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { IServiceUnit } from '../../../../../../shared-module/interfaces/petals.interface';

@Component({
  selector: 'app-service-unit-menu',
  templateUrl: 'petals-service-unit-menu.component.html',
  styleUrls: ['petals-service-unit-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ServiceUnitMenuComponent {
  @Input() serviceUnit: IServiceUnit;

  constructor() { }
}
