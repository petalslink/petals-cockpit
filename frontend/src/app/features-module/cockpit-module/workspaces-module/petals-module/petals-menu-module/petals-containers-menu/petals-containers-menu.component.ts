// angular modules
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

// ngrx
import { Store } from '@ngrx/store';

// rxjs
import { Observable } from 'rxjs';

// our interfaces
import { IContainer } from '../../../../../../shared-module/interfaces/petals.interface';

// our states
import { AppState } from '../../../../../../app.state';
import { WorkspacesState, WorkspacesStateRecord } from '../../../../../../shared-module/reducers/workspaces.state';

@Component({
  selector: 'app-containers-menu',
  templateUrl: 'petals-containers-menu.component.html',
  styleUrls: ['petals-containers-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainersMenuComponent {
  private workspaces$: Observable<WorkspacesState>;

  @Input() containers: Array<IContainer>;
  @Input() idWorkspace: number;
  @Input() idBus: number;
  @Input() search: string;

  constructor(private store: Store<AppState>) {
    this.workspaces$ = <Observable<WorkspacesStateRecord>>store.select('workspaces');
  }
}
