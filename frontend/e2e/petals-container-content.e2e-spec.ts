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

describe(`Petals container content`, () => {
  let page: PetalsCockpitPage;

  beforeEach(() => {
    page = new PetalsCockpitPage();
    page.navigateTo();
    page.login(`admin`, `admin`);
    // let's be sure everything is loaded and visible
    browser.wait(EC.visibilityOf(page.getWorkspaceTreeFolder(1)), 5000);
  });

  it(`should open the content page`, () => {
    page.getWorkspaceTreeByName('Cont 0').click();

    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+\/petals\/containers\/\w+/);

    const pageTitle = element(by.css(`app-petals-container-view md-toolbar-row .title`)).getText();
    expect(pageTitle).toEqual('Cont 0');

    const ip = element(by.css(`app-petals-container-overview md-card.ip md-card-title`)).getText();
    const port = element(by.css(`app-petals-container-overview md-card.port md-card-title`)).getText();
    const reachability = element(by.css(`app-petals-container-overview md-card.reachability md-card-title`)).getText();
    const systemInfo = element(by.css(`app-petals-container-overview md-card.system-info`)).getText();

    expect(ip).toEqual('192.168.0.0');
    expect(port).toEqual('7700');
    expect(reachability).toEqual('Cont 1');
    expect(systemInfo).toEqual([
      'Petals ESB µKernel 4.0.2 Petals Standalone Shared Memory 4.0.2 OpenJDK',
      'Runtime Environment 1.7.0_111-b01 Oracle Corporation Linux 3.16.0-4-amd64 amd64'
    ].join(' '));
  });

  it('should navigate to another container of the bus', () => {
    page.getWorkspaceTreeByName('Cont 0').click();

    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+\/petals\/containers\/\w+/);

    expect(element(by.css(`app-petals-container-view md-toolbar-row .title`)).getText()).toEqual('Cont 0');

    element(by.css(`app-petals-container-overview md-card.reachability`)).click();

    expect(element(by.css(`app-petals-container-view md-toolbar-row .title`)).getText()).toEqual('Cont 1');
  });
});
