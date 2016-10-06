// angular modules
import { Component, ChangeDetectionStrategy } from '@angular/core';

// rxjs
import { Observable } from 'rxjs/Observable';

// ngrx
import { Store } from '@ngrx/store';

// our states
import { AppState } from '../../../../../../app.state';
import { WorkspacesState } from '../../../../../../shared-module/reducers/workspaces.state';

@Component({
  selector: 'app-petals-sidenav-menu',
  templateUrl: 'petals-sidenav-menu.component.html',
  styleUrls: ['petals-sidenav-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetalsSidenavMenuComponent {
  private workspaces$: Observable<WorkspacesState>;

  constructor(private store: Store<AppState>) {
    this.workspaces$ = <Observable<WorkspacesState>>store.select('workspaces');
  }
}
