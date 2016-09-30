import { Component, Input } from '@angular/core';
import { IComponent } from '../../interfaces/petals.interface';

@Component({
  selector: 'app-components-menu',
  templateUrl: './components-menu.component.html',
  styleUrls: ['./components-menu.component.scss']
})
export class ComponentsMenuComponent {
  @Input() components: Array<IComponent>;

  constructor() { }
}
