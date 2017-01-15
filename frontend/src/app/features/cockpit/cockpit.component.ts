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
import { MediaChange, MatchMediaObservable, BreakPointRegistry, MatchMedia } from '@angular/flex-layout';

import { LANGUAGES } from '../../core/opaque-tokens';
import { IStore } from '../../shared/interfaces/store.interface';
import { IUi } from './../../shared/interfaces/ui.interface';
import { WorkspacesDialogComponent } from './workspaces-dialog/workspaces-dialog.component';
import { getCurrentWorkspace } from '../cockpit/workspaces/state/workspaces/workspaces.selectors';

@Component({
  selector: 'app-cockpit',
  templateUrl: './cockpit.component.html',
  styleUrls: ['./cockpit.component.scss']
})
export class CockpitComponent implements OnInit, OnDestroy, AfterViewInit {
  private workspacesDialogRef: MdDialogRef<WorkspacesDialogComponent>;

  public ui$: Observable<IUi>;
  public workspace$: Observable<IWorkspace>;
  public workspaces$: Observable<IWorkspacesTable>;
  public logoByScreenSize$: Observable<string>;

  constructor(
    private _store$: Store<IStore>,
    @Inject(LANGUAGES) public languages,
    public dialog: MdDialog,
    @Inject(MatchMediaObservable) public media$
  ) { }

  ngOnInit() {
    this.workspaces$ = this._store$.select(state => state.workspaces);

    this.workspace$ = this._store$.let(getCurrentWorkspace());

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

    this.logoByScreenSize$ = this.media$
      .map((change: MediaChange) => {
        const imgSrcBase = `assets/img`;
        const imgSrcExt = `png`;

        const screenSize = change.mqAlias;

        if (screenSize === 'lg' || screenSize === 'gt-lg') {
          return `${imgSrcBase}/logo-petals-cockpit.${imgSrcExt}`;
        } else {
          return `${imgSrcBase}/logo-petals-cockpit-without-text.${imgSrcExt}`;
        }
      });
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

  fetchWorkspaces() {
    this._store$.dispatch({ type: Workspaces.FETCH_WORKSPACES });
  }
}
