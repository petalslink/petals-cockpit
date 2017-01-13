import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

import { IComponentRow } from './../../../state/components/component.interface';

@Component({
  selector: 'app-petals-component-overview',
  templateUrl: './petals-component-overview.component.html',
  styleUrls: ['./petals-component-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetalsComponentOverviewComponent implements OnInit {
  @Input() component: IComponentRow;

  constructor() { }

  ngOnInit() {
  }

}
