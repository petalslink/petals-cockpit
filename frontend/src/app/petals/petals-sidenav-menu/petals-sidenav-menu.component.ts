import { Component } from '@angular/core';
import { IBus } from '../../interfaces/petals.interface';

@Component({
  selector: 'app-petals-sidenav-menu',
  templateUrl: './petals-sidenav-menu.component.html',
  styleUrls: ['./petals-sidenav-menu.component.scss']
})
export class PetalsSidenavMenuComponent {
  private buses: Array<IBus>;

  constructor() {
    this.buses = [
      {name: 'Bus 1'},
      {name: 'Bus 2'},
      {name: 'Bus 3'},
      {name: 'Bus 4'}
    ];
  }
}
