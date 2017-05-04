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

import { page } from './common';

describe(`Petals service-unit content`, () => {
  beforeEach(() => {
    page.navigateTo();
    page.login(`admin`, `admin`);
    // let's be sure everything is loaded and visible
    browser.wait(EC.visibilityOf(page.getWorkspaceTreeFolder(1)), 5000);
  });

  it(`should open the content page`, () => {
    page.getWorkspaceTreeByName('SU 0').click();

    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+\/petals\/service-units\/\w+/);

    const pageTitle = element(by.css(`app-petals-service-unit-view md-toolbar-row .title`)).getText();
    expect(pageTitle).toEqual('SU 0');

    const state = element(by.css(`app-petals-service-unit-overview md-card.state md-card-title`)).getText();
    expect(state).toEqual('Started');
  });

  it(`should stop/start/stop/unload a service-unit`, () => {
    page.getWorkspaceTreeByName('SU 0').click();

    const stateElem = element(by.css(`app-petals-service-unit-overview md-card.state md-card-title`));

    // the SU exists and should be present in petals tree
    expect(page.getWorkspaceTreeByName(`SU 0`).first().isPresent()).toBe(true);

    element(by.cssContainingText(`app-petals-service-unit-overview button`, `Stop`)).click();
    expect(stateElem.getText()).toEqual('Stopped');

    element(by.cssContainingText(`app-petals-service-unit-overview button`, `Start`)).click();
    expect(stateElem.getText()).toEqual('Started');

    element(by.cssContainingText(`app-petals-service-unit-overview button`, `Stop`)).click();
    expect(stateElem.getText()).toEqual('Stopped');

    // once unloaded ...
    // there should be a popup saying that the SU has been deleted
    page.clickAndExpectNotification(
      element(by.cssContainingText(`app-petals-service-unit-overview button`, `Unload`)),
      'Service unit unloaded', '"SU 0" has been unloaded');

    // we should be redirected to the workspace page ...
    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+/);

    // and the SU should have been deleted from petals tree
    expect(page.getWorkspaceTreeByName(`SU 0`).first().isPresent()).toBe(false);
  });
});
