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
      {
        name: 'Bus 1',
        containers: [
          {
            name: 'Container 1',
            components: [
              {
                name: 'Component 1',
                serviceUnits: [
                  {name: 'SU 1'},
                  {name: 'SU 2'}
                ]
              },
              {
                name: 'Component 2',
                serviceUnits: [
                  {name: 'SU 3'},
                  {name: 'SU 4'},
                  {name: 'SU 5'}
                ]
              }
            ]
          },
          {
            name: 'Container 2',
            components: [
              {
                name: 'Component 3',
                serviceUnits: [
                  {name: 'SU 6'}
                ]
              },
              {
                name: 'Component 4',
                serviceUnits: [
                  {name: 'SU 7'},
                  {name: 'SU 8'}
                ]
              }
            ]
          }
        ]
      }
    ];
  }
}
