/**
 * Copyright (C) 2017 Linagora
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Component, ViewChild, Inject, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MdDialog, MdDialogRef } from '@angular/material';
import { MediaChange } from '@angular/flex-layout';
import { MdSidenav } from '@angular/material';
import { ObservableMedia } from '@angular/flex-layout';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';

import { IWorkspace } from './workspaces/state/workspaces/workspace.interface';
import { IWorkspacesTable } from './workspaces/state/workspaces/workspaces.interface';
import { Workspaces } from './workspaces/state/workspaces/workspaces.reducer';
import { Ui } from '../../shared/state/ui.reducer';
import { LANGUAGES } from '../../core/opaque-tokens';
import { IStore } from '../../shared/interfaces/store.interface';
import { IUi } from '../../shared/interfaces/ui.interface';
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
  private uiSub: Subscription;
  public sidenavMode$: Observable<string>;
  public workspace$: Observable<IWorkspace>;
  public workspaces$: Observable<IWorkspacesTable>;
  public logoByScreenSize$: Observable<string>;

  @ViewChild(MdSidenav) sidenav: MdSidenav;

  constructor(
    private store$: Store<IStore>,
    @Inject(LANGUAGES) public languages: any,
    public dialog: MdDialog,
    public media$: ObservableMedia,
    private router: Router
  ) { }

  ngOnInit() {
    this.workspaces$ = this.store$.select(state => state.workspaces);

    this.workspace$ = this.store$.let(getCurrentWorkspace());

    this.ui$ = this.store$.select(state => state.ui);

    // it is needed to use subscribe(...) instead of do(...).subscribe()
    // if not it won't work. TODO this should be solved or clarified...
    this.uiSub = this.ui$
      .map(ui => ui.isPopupListWorkspacesVisible)
      .distinctUntilChanged()
      .subscribe(isPopupListWorkspacesVisible => {
        if (isPopupListWorkspacesVisible) {
          this._openWorkspacesDialog();
        } else if (this.workspacesDialogRef) {
          this.workspacesDialogRef.close();
          this.workspacesDialogRef = null;
        }
      });

    this.logoByScreenSize$ = this.media$
      .asObservable()
      .map((change: MediaChange) => {
        const imgSrcBase = `./assets/img`;
        const imgSrcExt = `png`;

        const screenSize = change.mqAlias;

        if (screenSize === 'lg' || screenSize === 'gt-lg' || screenSize === 'xl') {
          return `${imgSrcBase}/logo-petals-cockpit.${imgSrcExt}`;
        } else {
          return `${imgSrcBase}/logo-petals-cockpit-without-text.${imgSrcExt}`;
        }
      });

    this.sidenavMode$ = this.media$
      .asObservable()
      .map((change: MediaChange) => {
        const screenSize = change.mqAlias;

        if (screenSize === 'xs' || screenSize === 'gt-xs' || screenSize === 'sm') {
          return `over`;
        } else {
          return `side`;
        }
      });
  }

  ngOnDestroy() {
    this.uiSub.unsubscribe();
  }

  ngAfterViewInit() {

    // TODO move that in its rightful place
    // if there's no workspace selected
    // display the popup to select one
    const re = /workspaces\/([a-zA-Z0-9]+)(\/)?/;
    const url = this.router.url;

    if (!re.test(url)) {
      this.openWorkspacesDialog();
    }

    // TODO : cf If hook available for handling escape
    // https://github.com/angular/material2/pull/2501
    // Handles the keyboard events ->
    // https://github.com/angular/material2/issues/2544
    this.sidenav.handleKeydown = () => { };
  }

  private _openWorkspacesDialog() {
    this.fetchWorkspaces();

    this.workspacesDialogRef = this.dialog.open(WorkspacesDialogComponent, {
      // TODO : If a workspace is already selected, we should be able to close it
      disableClose: true
    });

    this.workspacesDialogRef.afterClosed().subscribe(_ => {
      this.store$.dispatch({ type: Ui.CLOSE_POPUP_WORKSPACES_LIST });
      this.workspacesDialogRef = null;
    });
  }

  openWorkspacesDialog() {
    this.store$.dispatch({ type: Ui.OPEN_POPUP_WORKSPACES_LIST });
  }

  openSidenav() {
    this.store$.dispatch({ type: Ui.OPEN_SIDENAV });
  }

  closeSidenav() {
    this.store$.dispatch({ type: Ui.CLOSE_SIDENAV });
  }

  closeSidenavOnSmallScreen() {
    this.store$.dispatch({ type: Ui.CLOSE_SIDENAV_ON_SMALL_SCREEN });
  }

  toggleSidenav() {
    this.store$.dispatch({ type: Ui.TOGGLE_SIDENAV });
  }

  private fetchWorkspaces() {
    this.store$.dispatch({ type: Workspaces.FETCH_WORKSPACES });
  }
}
