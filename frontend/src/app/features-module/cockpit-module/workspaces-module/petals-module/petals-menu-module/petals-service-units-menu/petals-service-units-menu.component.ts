// angular modules
import { Component, Input } from '@angular/core';

// our interfaces
import { IServiceUnit } from '../../../../../../shared-module/interfaces/petals.interface';

@Component({
  selector: 'app-service-units-menu',
  templateUrl: 'petals-service-units-menu.component.html',
  styleUrls: ['petals-service-units-menu.component.scss']
})
export class ServiceUnitsMenuComponent {
  @Input() serviceUnits: Array<IServiceUnit>;

  @Input() idWorkspace: number;
  @Input() idBus: number;
  @Input() idContainer: number;
  @Input() idComponent: number;

  constructor() { }

  generateLink(serviceUnitId) {
    return [
      '/cockpit',
      'workspaces', this.idWorkspace,
      'petals', 'bus', this.idBus,
      'container', this.idContainer,
      'component', this.idComponent,
      'serviceUnit', serviceUnitId
    ].join('/');
  }
}
