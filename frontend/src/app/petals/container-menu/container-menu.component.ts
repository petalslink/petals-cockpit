import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { IContainer } from '../../interfaces/petals.interface';

@Component({
  selector: 'app-container-menu',
  templateUrl: './container-menu.component.html',
  styleUrls: ['./container-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerMenuComponent {
  @Input() container: IContainer;

  constructor() { }
}
