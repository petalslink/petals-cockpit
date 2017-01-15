import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { IBusesInProgress } from './../../state/buses-in-progress/buses-in-progress.interface';
import { IStore } from './../../../../../shared/interfaces/store.interface';

@Component({
  selector: 'app-buses-in-progress',
  templateUrl: './buses-in-progress.component.html',
  styleUrls: ['./buses-in-progress.component.scss']
})
export class BusesInProgressComponent implements OnInit {
  @Input() busesInProgress: IBusesInProgress;

  public workspaceId$: Observable<string>;

  constructor(private _store$: Store<IStore>) { }

  ngOnInit() {
    this.workspaceId$ = this._store$
      .select(state => state.workspaces)
      .map(workspaces => workspaces.selectedWorkspaceId);
  }
}
