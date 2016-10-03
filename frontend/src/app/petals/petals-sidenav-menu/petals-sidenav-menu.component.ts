import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { IBus } from '../../interfaces/petals.interface';
import { AppState } from '../../app.state';
import { WorkspacesState } from '../../reducers/workspaces.state';

@Component({
  selector: 'app-petals-sidenav-menu',
  templateUrl: './petals-sidenav-menu.component.html',
  styleUrls: ['./petals-sidenav-menu.component.scss']
})
export class PetalsSidenavMenuComponent {
  private buses$: Observable<WorkspacesState>;

  constructor(private store: Store<AppState>) {
    this.buses$ = <Observable<WorkspacesState>>store.select('workspaces');
  }
}
