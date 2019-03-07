/**
 * Copyright (C) 2017-2019 Linagora
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

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';

// TODO Fix Lint error: all imports on this line are unused.
// tslint:disable: no-unused-variable
import { MediaChange, ObservableMedia } from '@angular/flex-layout';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { distinctUntilChanged, map, takeUntil, tap } from 'rxjs/operators';

import { CockpitComponent } from '@feat/cockpit/cockpit.component';
import { LoginComponent } from '@feat/login/login.component';
import { SetupComponent } from '@feat/setup/setup.component';
import { IStore } from './shared/state/store.interface';
import { Ui } from './shared/state/ui.actions';
import { ScreenSize } from './shared/state/ui.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  @HostBinding('class') componentCssClass: any;

  displayLoadingAccess = true;

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
    private sanitizer: DomSanitizer,
    public overlayContainer: OverlayContainer
  ) {}

  ngOnInit() {
    this.media$
      .asObservable()
      .pipe(
        map((change: MediaChange) => change.mqAlias as ScreenSize),
        distinctUntilChanged(),
        takeUntil(this.onDestroy$),
        tap((screenSize: ScreenSize) =>
          this.store$.dispatch(new Ui.ChangeScreenSize({ screenSize }))
        )
      )
      .subscribe();

    this.store$
      .pipe(
        select(state => state.ui.settings || { theme: '' }),
        takeUntil(this.onDestroy$)
      )
      .subscribe(settings => {
        const effectiveTheme = settings.theme.toLowerCase();
        this.componentCssClass = effectiveTheme;
        const classList = this.overlayContainer.getContainerElement().classList;
        const toRemove = Array.from(classList).filter((item: string) =>
          item.includes('-theme')
        );
        classList.remove(...toRemove);
        classList.add(effectiveTheme);
      });

    // svg icons

    const petalsLogo = this.sanitizer.bypassSecurityTrustResourceUrl(
      './assets/icons/svg/petals-cockpit-logo.svg'
    );
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
    const gotoDetailsLogo = this.sanitizer.bypassSecurityTrustResourceUrl(
      './assets/icons/svg/goto-details-logo.svg'
    );
    const namespaceLogo = this.sanitizer.bypassSecurityTrustResourceUrl(
      './assets/icons/svg/namespace-logo.svg'
    );

    this.matIconRegistry.addSvgIcon('petals', petalsLogo);
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
    this.matIconRegistry.addSvgIcon('gotoDetails', gotoDetailsLogo);
    this.matIconRegistry.addSvgIcon('namespace', namespaceLogo);
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  onActivate(component: Component) {
    if (
      component instanceof LoginComponent ||
      component instanceof SetupComponent ||
      component instanceof CockpitComponent
    ) {
      this.displayLoadingAccess = false;
    } else {
      this.displayLoadingAccess = true;
    }
  }
}
