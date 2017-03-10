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

describe(`Petals service-unit content`, () => {
  let page: PetalsCockpitPage;

  beforeEach(() => {
    page = new PetalsCockpitPage();
    page.navigateTo();
    page.login(`admin`, `admin`);
    element.all(by.css(`app-workspaces-dialog md-card > div`)).first().click();
    // let's be sure everything is loaded and visible
    browser.wait(EC.visibilityOf(page.getWorkspaceTreeFolder(1)), 5000);
  });

  it(`Should open the content page`, () => {
    page.getWorkspaceTreeByName('SU 0').click();

    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+\/petals\/service-units\/\w+/);

    const pageTitle = element(by.css(`app-petals-service-unit-view md-toolbar-row .title`)).getText();
    expect(pageTitle).toEqual('SU 0');

    const state = element(by.css(`app-petals-service-unit-overview md-card.state md-card-title`)).getText();
    expect(state).toEqual('Started');
  });

  it(`Should stop/start/stop/unload a service-unit`, () => {
    page.getWorkspaceTreeByName('SU 0').click();

    const stateElem = element(by.css(`app-petals-service-unit-overview md-card.state md-card-title`));

    // the SU exists and should be present in petals tree
    page.toggleSidenav();
    expect(page.getWorkspaceTreeByName(`SU 0`).first().isPresent()).toBe(true);
    page.toggleSidenav();

    element(by.cssContainingText(`app-petals-service-unit-overview button`, `Stop`)).click();
    expect(stateElem.getText()).toEqual('Stopped');

    element(by.cssContainingText(`app-petals-service-unit-overview button`, `Start`)).click();
    expect(stateElem.getText()).toEqual('Started');

    element(by.cssContainingText(`app-petals-service-unit-overview button`, `Stop`)).click();
    expect(stateElem.getText()).toEqual('Stopped');

    // once unloaded ...
    element(by.cssContainingText(`app-petals-service-unit-overview button`, `Unload`)).click();

    // there should be a popup saying that the SU has been deleted
    expect(element(by.css(`simple-notification .sn-title`)).getText()).toBe(`Service unit unloaded`);
    expect(element(by.css(`simple-notification .sn-content`)).getText()).toBe(`"SU 0" has been unloaded`);
    element(by.css(`simple-notification`)).click();

    // we should be redirected to the workspace page ...
    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+/);

    page.toggleSidenav();
    // and the SU should have been deleted from petals tree
    expect(page.getWorkspaceTreeByName(`SU 0`).first().isPresent()).toBe(false);
  });
});
