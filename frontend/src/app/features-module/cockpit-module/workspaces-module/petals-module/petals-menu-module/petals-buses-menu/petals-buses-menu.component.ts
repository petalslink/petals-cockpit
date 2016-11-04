// angular modules
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

// our interfaces
import { IBus } from '../../../../../../shared-module/interfaces/petals.interface';
import { IWorkspace } from '../../../../../../shared-module/interfaces/workspace.interface';

@Component({
  selector: 'app-buses-menu',
  templateUrl: 'petals-buses-menu.component.html',
  styleUrls: ['petals-buses-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusesMenuComponent {
  @Input() workspace: IWorkspace;
  @Input() buses: Array<IBus>;
  @Input() search: string;

  @Input() idWorkspaceSelected: number;
  @Input() idBusSelected: string;
  @Input() idContainerSelected: string;
  @Input() idComponentSelected: string;
  @Input() idServiceUnitSelected: string;

  constructor() { }
}
