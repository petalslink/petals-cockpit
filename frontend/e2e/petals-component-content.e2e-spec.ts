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
    element.all(by.css(`app-workspaces-dialog md-card > div`)).first().click();
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
});
