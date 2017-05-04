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
    page.setDesktopSize();
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

  it(`should have the containers information belonging the bus`, () => {
    page.getWorkspaceTreeByName('Bus 0').click();

    // check that all containers are displayed
    expect(element.all(by.css(`app-petals-bus-view .swiper-container .swiper-slide`)).count()).toEqual(2);

    // check the description of the first container
    expect(element.all(by.css(`app-petals-bus-view .swiper-slide .swiper-description span.name`)).get(0).getText())
      .toContain(`Cont 0`);
    expect(element.all(by.css(`app-petals-bus-view .swiper-slide .swiper-description span.ip`)).get(0).getText())
      .toContain(`Ip: 192.168.0.0`);
    expect(element.all(by.css(`app-petals-bus-view .swiper-slide .swiper-description span.port`)).get(0).getText())
      .toContain(`Port: 7700`);

    expect(element.all(by.css(`app-petals-bus-view .swiper-slide .swiper-img-container`)).get(0).click());

    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+\/petals\/containers\/\w+/);

    expect(element(by.css(`app-petals-container-view md-toolbar-row .title`)).getText())
      .toEqual('Cont 0');

    page.getWorkspaceTreeByName('Bus 0').click();

    // check the description of the second container
    expect(element.all(by.css(`app-petals-bus-view .swiper-slide .swiper-description span.name`)).get(1).getText())
      .toContain(`Cont 1`);
    expect(element.all(by.css(`app-petals-bus-view .swiper-slide .swiper-description span.ip`)).get(1).getText())
      .toContain(`Ip: 192.168.0.1`);
    expect(element.all(by.css(`app-petals-bus-view .swiper-slide .swiper-description span.port`)).get(1).getText())
      .toContain(`Port: 7700`);

    expect(element.all(by.css(`app-petals-bus-view .swiper-slide .swiper-img-container`)).get(1).click());

    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+\/petals\/containers\/\w+/);

    expect(element(by.css(`app-petals-container-view md-toolbar-row .title`)).getText())
      .toEqual('Cont 1');
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
    page.clickAndExpectNotification(element(by.css(`app-bus-deletion-dialog .btn-confirm-delete-bus`)));

    expect(browser.getCurrentUrl()).toMatch(/\/workspaces\/\w+$/);

    expect(page.getWorkspaceTree()).toEqual([]);
  });
});
