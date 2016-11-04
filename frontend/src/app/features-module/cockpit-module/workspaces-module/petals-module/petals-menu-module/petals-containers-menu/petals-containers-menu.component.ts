// angular modules
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

// our interfaces
import { IContainer } from '../../../../../../shared-module/interfaces/petals.interface';

@Component({
  selector: 'app-containers-menu',
  templateUrl: 'petals-containers-menu.component.html',
  styleUrls: ['petals-containers-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainersMenuComponent {
  @Input() containers: Array<IContainer>;
  @Input() search: string;

  @Input() idBus: number;

  @Input() idWorkspaceSelected: number;
  @Input() idContainerSelected: string;
  @Input() idComponentSelected: string;
  @Input() idServiceUnitSelected: string;

  constructor() { }
}
