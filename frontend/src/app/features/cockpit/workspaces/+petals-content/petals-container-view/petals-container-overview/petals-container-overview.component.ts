import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

import { IContainerRow } from './../../../state/containers/container.interface';

@Component({
  selector: 'app-petals-container-overview',
  templateUrl: './petals-container-overview.component.html',
  styleUrls: ['./petals-container-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetalsContainerOverviewComponent implements OnInit {
  @Input() container: IContainerRow;

  constructor() { }

  ngOnInit() {
  }
}
