// angular modules
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

// ngrx
import { Store } from '@ngrx/store';

// rxjs
import { Observable } from 'rxjs';

// our interfaces
import { IBus } from '../../../../../../shared-module/interfaces/petals.interface';

// our states
import { AppState } from '../../../../../../app.state';
import { WorkspacesState, WorkspacesStateRecord } from '../../../../../../shared-module/reducers/workspaces.state';

@Component({
  selector: 'app-buses-menu',
  templateUrl: 'petals-buses-menu.component.html',
  styleUrls: ['petals-buses-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusesMenuComponent {
  private workspaces$: Observable<WorkspacesState>;

  @Input() buses: Array<IBus>;
  @Input() idWorkspace: number;

  constructor(private store: Store<AppState>) {
    this.workspaces$ = <Observable<WorkspacesStateRecord>>store.select('workspaces');
  }
}
