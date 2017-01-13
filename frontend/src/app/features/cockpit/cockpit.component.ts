import { ServiceUnits } from './workspaces/state/service-units/service-units.reducer';
import { Components } from './workspaces/state/components/components.reducer';
import { Containers } from './workspaces/state/containers/containers.reducer';
import { Buses } from './workspaces/state/buses/buses.reducer';
import { IWorkspace } from './workspaces/state/workspaces/workspace.interface';
import { IWorkspaces, IWorkspacesTable } from './workspaces/state/workspaces/workspaces.interface';
import { Workspaces } from './workspaces/state/workspaces/workspaces.reducer';
import { Ui } from './../../shared/state/ui.reducer';
import { Component, Inject, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { TranslateService } from 'ng2-translate';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import { MdDialog, MdDialogRef } from '@angular/material';

import { LANGUAGES } from '../../core/opaque-tokens';
import { IStore } from '../../shared/interfaces/store.interface';
import { IUi } from './../../shared/interfaces/ui.interface';
import { WorkspacesDialogComponent } from './workspaces-dialog/workspaces-dialog.component';
import { getCurrentWorkspace, getCurrentTree } from '../cockpit/workspaces/state/workspaces/workspaces.selectors';

@Component({
  selector: 'app-cockpit',
  templateUrl: './cockpit.component.html',
  styleUrls: ['./cockpit.component.scss']
})
export class CockpitComponent implements OnInit, OnDestroy, AfterViewInit {
  private workspacesDialogRef: MdDialogRef<WorkspacesDialogComponent>;

  public ui$: Observable<IUi>;
  public workspace$: Observable<IWorkspace>;
  public tree$: Observable<any>;
  public workspaces$: Observable<IWorkspacesTable>;

  constructor(
    private _store$: Store<IStore>,
    @Inject(LANGUAGES) public languages,
    public dialog: MdDialog
  ) { }

  ngOnInit() {
    this.workspaces$ = this._store$.select(state => state.workspaces);

    this.workspace$ = this._store$.let(getCurrentWorkspace());

    this.tree$ = this._store$.let(getCurrentTree());

    this.ui$ = this._store$.select(state => state.ui);

    this.ui$
      .map(ui => ui.isPopupListWorkspacesVisible)
      .distinctUntilChanged()
      .map(isPopupListWorkspacesVisible => {
        if (isPopupListWorkspacesVisible) {
          this._openWorkspacesDialog();
        } else if (typeof this.workspacesDialogRef !== 'undefined') {
          this.workspacesDialogRef.close();
        }
      })
      .subscribe();
  }

  ngOnDestroy() { }

  ngAfterViewInit() {
    this.openWorkspacesDialog();
  }

  private _openWorkspacesDialog() {
    this.fetchWorkspaces();

    this.workspacesDialogRef = this.dialog.open(WorkspacesDialogComponent, {
      disableClose: false
    });

    this.workspacesDialogRef.afterClosed().subscribe(result => {
      this._store$.dispatch({ type: Ui.CLOSE_POPUP_WORKSPACES_LIST });
      this.workspacesDialogRef = null;
    });
  }

  openWorkspacesDialog() {
    this._store$.dispatch({ type: Ui.OPEN_POPUP_WORKSPACES_LIST });
  }

  openSidenav() {
    this._store$.dispatch({ type: Ui.OPEN_SIDENAV });
  }

  closeSidenav() {
    this._store$.dispatch({ type: Ui.CLOSE_SIDENAV });
  }

  toggleSidenav() {
    this._store$.dispatch({ type: Ui.TOGGLE_SIDENAV });
  }

  onTreeToggleFold(e) {
    switch (e.item.typeId) {
      case 'busId':
        this._store$.dispatch({ type: Buses.TOGGLE_FOLD_BUS, payload: { busId: e.item.id } });
        break;
      case 'containerId':
        this._store$.dispatch({ type: Containers.TOGGLE_FOLD_CONTAINER, payload: { containerId: e.item.id } });
        break;
      case 'componentId':
        this._store$.dispatch({ type: Components.TOGGLE_FOLD_COMPONENT, payload: { componentId: e.item.id } });
    }
  }

  onTreeSelect(e) {
    // TODO: Dispatch an action to save the current bus/container/component/su
    // Instead of dispatching it from here maybe it's a better idea to dispatch it once the
    // component is loaded
  }

  fetchWorkspaces() {
    this._store$.dispatch({ type: Workspaces.FETCH_WORKSPACES });
  }
}
