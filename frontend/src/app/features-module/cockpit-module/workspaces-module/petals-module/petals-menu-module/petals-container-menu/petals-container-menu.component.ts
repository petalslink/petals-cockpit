import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import {IContainer} from "../../../../../../shared-module/interfaces/petals.interface";

@Component({
  selector: 'app-container-menu',
  templateUrl: 'petals-container-menu.component.html',
  styleUrls: ['petals-container-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerMenuComponent {
  @Input() container: IContainer;

  constructor() { }
}
