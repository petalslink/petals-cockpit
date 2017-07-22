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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ObservableMedia } from '@angular/flex-layout';
import { MdIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs/Subject';

import { IStore } from './shared/state/store.interface';

import { Ui } from 'app/shared/state/ui.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  public notificationOptions = {
    position: ['bottom', 'right'],
    timeOut: 2500,
    lastOnBottom: true,
    showProgressBar: true,
    pauseOnHover: true,
    clickToClose: true,
  };

  constructor(
    private store$: Store<IStore>,
    private media$: ObservableMedia,
    private mdIconRegistry: MdIconRegistry,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.media$
      .asObservable()
      .map(change => change.mqAlias)
      .distinctUntilChanged()
      .takeUntil(this.onDestroy$)
      .do(screenSize =>
        this.store$.dispatch(new Ui.ChangeScreenSize({ screenSize }))
      )
      .subscribe();

    // svg icons for petals tree & overviews
    const busLogo = this.sanitizer.bypassSecurityTrustResourceUrl(
      './assets/icons/svg/bus-logo.svg'
    );
    const compLogo = this.sanitizer.bypassSecurityTrustResourceUrl(
      './assets/icons/svg/component-logo.svg'
    );
    const saLogo = this.sanitizer.bypassSecurityTrustResourceUrl(
      './assets/icons/svg/sa-logo.svg'
    );
    const slLogo = this.sanitizer.bypassSecurityTrustResourceUrl(
      './assets/icons/svg/sl-logo.svg'
    );
    const slOverviewLogo = this.sanitizer.bypassSecurityTrustResourceUrl(
      './assets/icons/svg/sl-overview-logo.svg'
    );
    const saOverviewLogo = this.sanitizer.bypassSecurityTrustResourceUrl(
      './assets/icons/svg/sa-overview-logo.svg'
    );
    const suLogo = this.sanitizer.bypassSecurityTrustResourceUrl(
      './assets/icons/svg/su-logo.svg'
    );
    const gotoLogo = this.sanitizer.bypassSecurityTrustResourceUrl(
      './assets/icons/svg/goto-logo.svg'
    );

    this.mdIconRegistry.addSvgIcon('bus', busLogo);
    this.mdIconRegistry.addSvgIcon('component', compLogo);
    this.mdIconRegistry.addSvgIcon('sa', saLogo);
    this.mdIconRegistry.addSvgIcon('sl', slLogo);
    this.mdIconRegistry.addSvgIcon('sl-overview', slOverviewLogo);
    this.mdIconRegistry.addSvgIcon('sa-overview', saOverviewLogo);
    this.mdIconRegistry.addSvgIcon('su', suLogo);
    this.mdIconRegistry.addSvgIcon('goto', gotoLogo);
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
