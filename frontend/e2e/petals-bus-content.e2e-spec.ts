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

describe(`Petals bus content`, () => {
  let page: PetalsCockpitPage;

  beforeEach(() => {
    page = new PetalsCockpitPage();
    page.navigateTo();
    page.login(`admin`, `admin`);
    // let's be sure everything is loaded and visible
    browser.wait(EC.visibilityOf(page.getWorkspaceTreeFolder(1)), 5000);
  });

  it(`should open the content page`, () => {
    page.getWorkspaceTreeByName('Bus 0').click();

    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+\/petals\/buses\/\w+/);

    const pageTitle = element(by.css(`app-petals-bus-view md-toolbar-row .title`)).getText();
    expect(pageTitle).toEqual('Bus 0');
  });

  it(`should delete a bus and redirect to the current workspace`, () => {
    page.getWorkspaceTreeByName('Bus 0').click();

    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+\/petals\/buses\/\w+/);

    const btnDeleteBus = element(by.css(`app-petals-bus-view md-toolbar-row .btn-delete-bus`));

    // let's delete the bus
    btnDeleteBus.click();

    // a dialog is shown
    expect(element(by.css(`app-bus-deletion-dialog .mat-dialog-content`)).getText())
      .toEqual(`Are you sure you want to delete Bus 0?`);

    // let's confirm the deletion
    element(by.css(`app-bus-deletion-dialog .btn-confirm-delete-bus`)).click();

    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+$/);

    expect(page.getWorkspaceTree()).toEqual([]);
  });
});
