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

import { page } from './common';
import { NotFoundPage } from './pages/not-found';
import { WorkspacePage } from './pages/workspace.po';

describe(`Petals bus content`, () => {
  it(`should open the 404 page if the bus doesn't exists`, () => {
    page
      .goToViaLogin('/workspaces/idWks0/petals/buses/unknownIdBus')
      .loginNoCheck('admin', 'admin');

    NotFoundPage.waitAndGet();
  });
});

describe(`Petals bus content`, () => {
  let workspace: WorkspacePage;

  beforeEach(() => {
    workspace = page.goToLogin().loginToWorkspace(`admin`, `admin`);
  });

  it(`should open the content page`, () => {
    const bus = workspace.openBus('Bus 0');
    expect(bus.title.getText()).toEqual('Bus 0');
  });

  it(`should have the containers information belonging to the bus`, () => {
    let bus = workspace.openBus('Bus 0');

    bus
      .getInfoPetalsServersMessage()
      .expectToBe('info', `Click on a container to access its page.`);

    // check that all containers are displayed
    expect(bus.containers.count()).toEqual(2);

    // check the description of the first container
    const c1 = bus.containers.get(0);
    expect(c1.$(`.swiper-description span.name`).getText()).toContain(`Cont 0`);
    expect(c1.$(`.swiper-description span.ip`).getText()).toContain(
      `Ip: 192.168.0.0`
    );
    expect(c1.$(`.swiper-description span.port`).getText()).toContain(
      `Port: 7700`
    );

    const c1p = bus.openContainer(0);

    expect(c1p.title.getText()).toEqual('Cont 0');

    bus = workspace.openBus('Bus 0');

    // check the description of the second container
    const c2 = bus.containers.get(1);
    expect(c2.$(`.swiper-description span.name`).getText()).toContain(`Cont 1`);
    expect(c2.$(`.swiper-description span.ip`).getText()).toContain(
      `Ip: 192.168.0.1`
    );
    expect(c2.$(`.swiper-description span.port`).getText()).toContain(
      `Port: 7700`
    );

    const c2p = bus.openContainer(1);

    expect(c2p.title.getText()).toEqual('Cont 1');
  });

  // TODO: test inconsistently failing
  // it(`should show unreachable containers on swiper component`, () => {
  //   const containersReachabilityStatus = page
  //     .openWorkspaces()
  //     .selectWorkspace(1, 'Workspace 1')
  //     .openBus('Bus 3')
  //     .getContainersReachabilityStatus();

  //   expect(containersReachabilityStatus).toEqual([
  //     { name: 'Cont 2', reachable: true },
  //     { name: 'Cont 3', reachable: false },
  //   ]);
  // });
});
