import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

import { IServiceUnitRow } from '../../../state/service-units/service-unit.interface';

@Component({
  selector: 'app-petals-service-unit-overview',
  templateUrl: './petals-service-unit-overview.component.html',
  styleUrls: ['./petals-service-unit-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetalsServiceUnitOverviewComponent implements OnInit {
  @Input() serviceUnit: IServiceUnitRow;

  constructor() { }

  ngOnInit() {
  }
}
