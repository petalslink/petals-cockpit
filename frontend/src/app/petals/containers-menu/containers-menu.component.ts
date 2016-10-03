import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { IContainer } from '../../interfaces/petals.interface';

@Component({
  selector: 'app-containers-menu',
  templateUrl: './containers-menu.component.html',
  styleUrls: ['./containers-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainersMenuComponent {
  @Input() containers: Array<IContainer>;

  constructor() { }
}
