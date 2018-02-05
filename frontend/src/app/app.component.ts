/**
 * Copyright (C) 2017-2018 Linagora
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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ObservableMedia } from '@angular/flex-layout';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, map, takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

import { IStore } from './shared/state/store.interface';

import { Ui } from 'app/shared/state/ui.actions';
import { ScreenSize } from 'app/shared/state/ui.interface';

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
    private matIconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.media$
      .asObservable()
      .pipe(
        map(change => change.mqAlias as ScreenSize),
        distinctUntilChanged(),
        takeUntil(this.onDestroy$),
        tap(screenSize =>
          this.store$.dispatch(new Ui.ChangeScreenSize({ screenSize }))
        )
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
    const serviceLogo = this.sanitizer.bypassSecurityTrustResourceUrl(
      './assets/icons/svg/service-logo.svg'
    );
    const interfaceLogo = this.sanitizer.bypassSecurityTrustResourceUrl(
      './assets/icons/svg/interface-logo.svg'
    );
    const endpointLogo = this.sanitizer.bypassSecurityTrustResourceUrl(
      './assets/icons/svg/endpoint-logo.svg'
    );
    const gotoLogo = this.sanitizer.bypassSecurityTrustResourceUrl(
      './assets/icons/svg/goto-logo.svg'
    );

    this.matIconRegistry.addSvgIcon('bus', busLogo);
    this.matIconRegistry.addSvgIcon('component', compLogo);
    this.matIconRegistry.addSvgIcon('sa', saLogo);
    this.matIconRegistry.addSvgIcon('sl', slLogo);
    this.matIconRegistry.addSvgIcon('sl-overview', slOverviewLogo);
    this.matIconRegistry.addSvgIcon('sa-overview', saOverviewLogo);
    this.matIconRegistry.addSvgIcon('su', suLogo);
    this.matIconRegistry.addSvgIcon('service', serviceLogo);
    this.matIconRegistry.addSvgIcon('interface', interfaceLogo);
    this.matIconRegistry.addSvgIcon('endpoint', endpointLogo);
    this.matIconRegistry.addSvgIcon('goto', gotoLogo);
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
