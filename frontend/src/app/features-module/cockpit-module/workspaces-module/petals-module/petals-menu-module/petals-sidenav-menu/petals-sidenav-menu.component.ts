import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import {WorkspacesState} from "../../../../../../shared-module/reducers/workspaces.state";
import {AppState} from "../../../../../../app.state";

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
