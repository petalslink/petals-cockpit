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
import { browser, element, by, ExpectedConditions as EC } from 'protractor';

import { PetalsCockpitPage } from './app.po';

describe(`Petals component content`, () => {
  let page: PetalsCockpitPage;

  beforeEach(() => {
    page = new PetalsCockpitPage();
    page.navigateTo();
    page.login(`admin`, `admin`);
    // let's be sure everything is loaded and visible
    browser.wait(EC.visibilityOf(page.getWorkspaceTreeFolder(1)), 5000);
  });

  it(`Should open the content page`, () => {
    page.getWorkspaceTreeByName('Comp 0').click();

    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+\/petals\/components\/\w+/);

    const pageTitle = element(by.css(`app-petals-component-view md-toolbar-row .title`)).getText();
    expect(pageTitle).toEqual('Comp 0');

    const state = element(by.css(`app-petals-component-overview md-card.state md-card-title`)).getText();
    const type = element(by.css(`app-petals-component-overview md-card.type md-card-title`)).getText();

    expect(state).toEqual('Started');
    expect(type).toEqual('BC');
  });

  it(`Should stop/start/stop/unload a component`, () => {
    const stateElem = element(by.css(`app-petals-component-overview md-card.state md-card-title`));

    // the component exists and should be present in petals tree
    expect(page.getWorkspaceTreeByName(`Comp 0`).first().isPresent()).toBe(true);

    page.getWorkspaceTreeByName('Comp 0').click();

    element(by.cssContainingText(`app-petals-component-overview button`, `Stop`)).click();
    expect(stateElem.getText()).toEqual('Stopped');

    element(by.cssContainingText(`app-petals-component-overview button`, `Start`)).click();
    expect(stateElem.getText()).toEqual('Started');

    element(by.cssContainingText(`app-petals-component-overview button`, `Stop`)).click();
    expect(stateElem.getText()).toEqual('Stopped');

    // as the comp 0 still have 2 SUs (SU 0, SU 1), we can't unload it yet
    expect(element(by.cssContainingText(`app-petals-component-overview button`, `Unload`)).isEnabled()).toBe(false);

    // unload the 2 SU
    page.openSidenav();
    page.getWorkspaceTreeByName('SU 0').click();
    element(by.cssContainingText(`app-petals-service-unit-overview button`, `Stop`)).click();
    element(by.cssContainingText(`app-petals-service-unit-overview button`, `Unload`)).click();
    element(by.css(`simple-notification`)).click();

    page.openSidenav();
    page.getWorkspaceTreeByName('SU 1').click();
    element(by.cssContainingText(`app-petals-service-unit-overview button`, `Stop`)).click();
    element(by.cssContainingText(`app-petals-service-unit-overview button`, `Unload`)).click();
    element(by.css(`simple-notification`)).click();

    // we should now be able to unload the comp 0
    page.openSidenav();
    page.getWorkspaceTreeByName('Comp 0').click();
    expect(element(by.cssContainingText(`app-petals-component-overview button`, `Unload`)).isEnabled()).toBe(true);

    // once unloaded ...
    element(by.cssContainingText(`app-petals-component-overview button`, `Unload`)).click();
    element(by.css(`simple-notification`)).click();

    // we should be redirected to the workspace page ...
    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+/);

    // and the component should have been deleted from petals tree
    page.openSidenav();
    expect(page.getWorkspaceTreeByName(`Comp 0`).first().isPresent()).toBe(false);
  });
});
