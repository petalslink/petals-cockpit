import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { IComponent } from '../../../../../../shared-module/interfaces/petals.interface';

@Component({
  selector: 'app-component-menu',
  templateUrl: 'petals-component-menu.component.html',
  styleUrls: ['petals-component-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentMenuComponent {
  @Input() component: IComponent;

  constructor() { }
}
