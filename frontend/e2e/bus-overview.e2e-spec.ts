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

import { browser, element, by } from 'protractor';

import { PetalsCockpitPage } from './app.po';

describe(`Bus Overview`, () => {
  let page: PetalsCockpitPage;

  beforeEach(() => {
    page = new PetalsCockpitPage();
    page.navigateTo();
  });

  it(`should have the bus information in overview`, () => {
    page.login(`admin`, `admin`);

    page.getWorkspaceTreeByName('Bus 0').click();

    // check the page content
    expect(element(by.css(`app-petals-bus-view md-toolbar span.title`)).getText())
      .toEqual(`Bus 0`);
  });

  it(`should have the containers information belonging the bus`, () => {
    page.login(`admin`, `admin`);

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
});
