import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import { IContainerRow } from '../../../state/containers/container.interface';
import { IStore } from './../../../../../../shared/interfaces/store.interface';

@Component({
  selector: 'app-petals-container-overview',
  templateUrl: './petals-container-overview.component.html',
  styleUrls: ['./petals-container-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetalsContainerOverviewComponent implements OnInit {
  public idWorkspace$: Observable<string>;

  @Input() container: IContainerRow;

  constructor(private _store$: Store<IStore>) {
    this.idWorkspace$ = this._store$.select(state => state.workspaces.selectedWorkspaceId);
  }

  ngOnInit() {
  }
}
