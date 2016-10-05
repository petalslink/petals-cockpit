import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import {IComponent} from "../../../../../../shared-module/interfaces/petals.interface";

@Component({
  selector: 'app-components-menu',
  templateUrl: 'petals-components-menu.component.html',
  styleUrls: ['petals-components-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentsMenuComponent {
  @Input() components: Array<IComponent>;

  constructor() { }
}
