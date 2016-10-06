import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { IContainer } from '../../../../../../shared-module/interfaces/petals.interface';

@Component({
  selector: 'app-containers-menu',
  templateUrl: 'petals-containers-menu.component.html',
  styleUrls: ['petals-containers-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainersMenuComponent {
  @Input() containers: Array<IContainer>;

  constructor() { }
}
