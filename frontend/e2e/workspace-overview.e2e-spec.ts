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

describe(`Workspace Overview`, () => {
  beforeEach(() => {
    page.navigateTo();
  });

  it(`should have the workspace information in overview`, () => {
    page.login(`admin`, `admin`);

    // check the page content
    expect(element(by.css(`app-workspace md-toolbar span.title`)).getText())
      .toEqual(`Workspace 0`);

    expect(element(by.css(`app-workspace .workspace-description > div`)).getText())
      .toEqual(`You can import a bus from the container 192.168.0.1:7700 to get a mock bus.`);
    expect(element(by.css(`app-workspace .workspace-description-edit`)).isPresent()).toBe(false);
    expect(element(by.css(`app-workspace .workspace-description > div`)).getAttribute('class'))
      .toContain('info');

    expect(element(by.css(`app-workspace .workspace-users .users-in-workspace`)).getText())
      .toEqual(`You are the only one using this workspace:`);

    expect(element.all(by.css(`app-workspace .workspace-users md-list md-list-item .mat-list-text`)).getText())
      .toEqual(['admin\nAdministrator']);
  });

  it(`should reset workspace overview when changing workspaces`, () => {
    page.login(`admin`, `admin`);

    // let's click on the edit button before switching workspace to ensure everything is reset
    element(by.css(`app-workspace .workspace-description button`)).click();

    // let's check another workspace
    element(by.css(`app-cockpit md-sidenav .change-workspace`)).click();

    page.selectWorkspace(1, `Workspace 1`);

    expect(element(by.css(`app-workspace md-toolbar span.title`)).getText())
      .toEqual(`Workspace 1`);

    expect(element(by.css(`app-workspace .workspace-description > div`)).getText())
      .toEqual(`Put some description in markdown for the workspace here.`);
    expect(element(by.css(`app-workspace .workspace-description-edit`)).isPresent()).toBe(false);

    expect(element(by.css(`app-workspace .workspace-users .users-in-workspace`)).getText())
      .toEqual(`5 people are using this workspace:`);

    expect(element.all(by.css(`app-workspace .workspace-users md-list md-list-item .mat-list-text`)).getText())
      .toEqual([
        'admin\nAdministrator',
        'bescudie\nBertrand ESCUDIE',
        'mrobert\nMaxime ROBERT',
        'cchevalier\nChristophe CHEVALIER',
        'vnoel\nVictor NOEL'
      ]);

    // and go back to the first one (for last workspace to be valid in other tests...)
    element(by.css(`app-cockpit md-sidenav .change-workspace`)).click();

    page.selectWorkspace(0);
  });

  it(`should have live markdown rendering of the description while edit`, () => {
    page.login(`admin`, `admin`);

    // let's check another workspace
    element(by.css(`app-cockpit md-sidenav .change-workspace`)).click();
    page.selectWorkspace(1, `Workspace 1`);

    expect(element(by.css(`app-workspace .workspace-description > div`)).getText())
      .toEqual(`Put some description in markdown for the workspace here.`);
    expect(element(by.css(`app-workspace .workspace-description > div`)).getAttribute('class'))
      .toContain('info');

    // the description should be rendered via markdown
    expect(element(by.css(`app-workspace .workspace-description > div strong`)).getText())
      .toEqual(`markdown`);

    // edition
    element(by.css(`app-workspace .workspace-description button`)).click();

    expect(element(by.css(`app-workspace .workspace-description-edit > .workspace-description-preview`)).getText())
      .toEqual(`Put some description in markdown for the workspace here.`);
    expect(element(by.css(`app-workspace .workspace-description-edit > .workspace-description-preview`)).getAttribute('class'))
      .toContain('warning');

    // write a few words
    element(by.css(`app-workspace .workspace-description-edit .description-wks`))
      .sendKeys(' And some ~~more~~.');
    expect(element(by.css(`app-workspace .workspace-description-edit > .workspace-description-preview`)).getText())
      .toEqual(`Put some description in markdown for the workspace here. And some more.`);

    expect(element(by.css(`app-workspace .workspace-description-edit > .workspace-description-preview strong`)).getText())
      .toEqual(`markdown`);
    expect(element(by.css(`app-workspace .workspace-description-edit > .workspace-description-preview del`)).getText())
      .toEqual(`more`);

    // and go back to the first one (for last workspace to be valid in other tests...)
    element(by.css(`app-cockpit md-sidenav .change-workspace`)).click();
    page.selectWorkspace(0);
  });

  it(`should edit the workspace description in overview`, () => {
    page.login(`bescudie`, `bescudie`, true, false);

    element(by.css(`input[formControlName="name"]`)).sendKeys(`New workspace`);
    element(by.css(`app-workspaces-dialog .btn-add-workspace`)).click();

    page.selectWorkspace(1, `New workspace`);

    expect(element(by.css(`app-workspace md-toolbar span.title`)).getText())
      .toEqual(`New workspace`);

    const description = element(by.css(`app-workspace .workspace-description > div`));

    expect(description.getText())
      .toEqual(`Put some description in markdown for the workspace here.`);

    element(by.css(`app-workspace .workspace-description button`)).click();

    // cancel
    element(by.css(`app-workspace .workspace-description-edit .description-wks`))
      .sendKeys(' Will disappear.');
    expect(element(by.css(`app-workspace .workspace-description-edit > .workspace-description-preview`)).getText())
      .toEqual(`Put some description in markdown for the workspace here. Will disappear.`);

    element(by.css(`app-workspace button.workspace-description-edit-cancel`)).click();

    expect(description.getText())
      .toEqual(`Put some description in markdown for the workspace here.`);

    // edit again

    element(by.css(`app-workspace .workspace-description button`)).click();

    element(by.css(`app-workspace .workspace-description-edit .description-wks`))
      .sendKeys(' And some more.');

    element(by.css(`app-workspace button.workspace-description-edit-submit`)).click();

    browser.wait(EC.visibilityOf(description), 5000);

    expect(description.getText())
      .toEqual(`Put some description in markdown for the workspace here. And some more.`);

    // let's check it is not modified in other...
    element(by.css(`app-cockpit md-sidenav .change-workspace`)).click();

    page.selectWorkspace(0, `Workspace 1`);

    expect(description.getText())
      .toEqual(`Put some description in markdown for the workspace here.`);

    // but correct in modified
    element(by.css(`app-cockpit md-sidenav .change-workspace`)).click();

    page.selectWorkspace(1, `New workspace`);

    expect(description.getText())
      .toEqual(`Put some description in markdown for the workspace here. And some more.`);
  });
});
