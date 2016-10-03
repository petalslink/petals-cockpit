import { Component, Input } from '@angular/core';
import { IComponent } from '../../interfaces/petals.interface';

@Component({
  selector: 'app-component-menu',
  templateUrl: './component-menu.component.html',
  styleUrls: ['./component-menu.component.scss']
})
export class ComponentMenuComponent {
  @Input() component: IComponent;

  constructor() { }
}