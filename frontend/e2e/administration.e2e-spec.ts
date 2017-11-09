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

import { browser, ExpectedConditions as EC } from 'protractor';

import { page, waitTimeout } from './common';
import { AdminPage } from './pages/administration.po';
import { clearInput, getMultipleElementsTexts } from './utils';

describe(`Administration`, () => {
  describe(`For admin`, () => {
    let admin: AdminPage;

    beforeEach(() => {
      page.goToViaLogin('/admin').loginNoCheck('admin', 'admin');
      admin = page.openAdmin();
    });

    it(`should open the administration page`, () => {
      expect(admin.title.getText()).toEqual('Administration');

      expect(
        getMultipleElementsTexts(admin.panelListUsers, '.user-id', '.user-name')
      ).toEqual([
        ['admin', '(Administrator)'],
        ['bescudie', '(Bertrand ESCUDIE)'],
        ['cchevalier', '(Christophe CHEVALIER)'],
        ['cdeneux', '(Christophe DENEUX)'],
        ['mrobert', '(Maxime ROBERT)'],
        ['vnoel', '(Victor NOEL)'],
      ]);

      admin
        .getInfoUserManagementMessage()
        .expectToBe(
          'info',
          `As an administrator, you can ADD, EDIT, and DELETE any user.`
        );
    });

    it('should open edit user', () => {
      let editVnoel = admin.openEditUser('vnoel');

      expect(editVnoel.usernameInput.isPresent()).toBe(false);
      expect(editVnoel.nameInput.getAttribute('value')).toEqual(`Victor NOEL`);
      expect(editVnoel.passwordInput.getAttribute('value')).toEqual(``);

      expect(editVnoel.cancelButton.isEnabled()).toBe(true);
      expect(editVnoel.deleteButton.isEnabled()).toBe(true);
      expect(editVnoel.saveButton.isEnabled()).toBe(true);

      clearInput(editVnoel.nameInput);
      expect(editVnoel.saveButton.isEnabled()).toBe(false);

      const editAdmin = admin.openEditUser('admin');
      // the previously panel should have been closed
      browser.wait(EC.invisibilityOf(editVnoel.component), waitTimeout);

      // the current user can't delete itself
      expect(editAdmin.deleteButton.isEnabled()).toBe(false);
      expect(editAdmin.cancelButton.isEnabled()).toBe(true);
      expect(editAdmin.saveButton.isEnabled()).toBe(true);

      editVnoel = admin.openEditUser('vnoel');
      browser.wait(EC.invisibilityOf(editAdmin.component), waitTimeout);
      // we cleared it before, it should have been reset now
      // there's currently an opened issue with expansion panel and it's events
      // https://github.com/angular/material2/issues/8326
      // uncomment following line after next release of material (current: 5.0.0-rc0)
      // expect(editVnoel.nameInput.getAttribute('value')).toEqual(`Victor NOEL`);
    });

    it('should close and clear on cancel', () => {
      const add = admin.openAddUser();

      add.usernameInput.sendKeys(`bdylan`);
      add.nameInput.sendKeys(`Bob DYLAN`);
      add.passwordInput.sendKeys(`Like a Rolling Stone`);

      add.cancelButton.click();
      browser.wait(EC.invisibilityOf(add.component), waitTimeout);

      admin.openAddUser();

      expect(add.usernameInput.getAttribute('value')).toEqual(``);
      expect(add.nameInput.getAttribute('value')).toEqual(``);
      expect(add.passwordInput.getAttribute('value')).toEqual(``);
    });

    it(`should add and delete a user`, () => {
      const add = admin.openAddUser();

      add.usernameInput.sendKeys(`bdylan`);
      expect(add.addButton.isEnabled()).toBe(false);
      add.nameInput.sendKeys(`Bob DYLAN`);
      expect(add.addButton.isEnabled()).toBe(false);
      add.passwordInput.sendKeys(`Like a Rolling Stone`);
      expect(add.addButton.isEnabled()).toBe(true);

      add.addButton.click();
      browser.wait(EC.invisibilityOf(add.component), waitTimeout);

      expect(
        getMultipleElementsTexts(admin.panelListUsers, '.user-id', '.user-name')
      ).toEqual([
        ['admin', '(Administrator)'],
        ['bdylan', '(Bob DYLAN)'],
        ['bescudie', '(Bertrand ESCUDIE)'],
        ['cchevalier', '(Christophe CHEVALIER)'],
        ['cdeneux', '(Christophe DENEUX)'],
        ['mrobert', '(Maxime ROBERT)'],
        ['vnoel', '(Victor NOEL)'],
      ]);

      const editNewUser = admin.openEditUser('bdylan');

      expect(editNewUser.nameInput.getAttribute('value')).toEqual(`Bob DYLAN`);
      expect(editNewUser.passwordInput.getAttribute('value')).toEqual(``);

      // clean for backend
      editNewUser.deleteButton.click();
      browser.wait(EC.invisibilityOf(editNewUser.component), waitTimeout);

      expect(
        getMultipleElementsTexts(admin.panelListUsers, '.user-id', '.user-name')
      ).toEqual([
        ['admin', '(Administrator)'],
        ['bescudie', '(Bertrand ESCUDIE)'],
        ['cchevalier', '(Christophe CHEVALIER)'],
        ['cdeneux', '(Christophe DENEUX)'],
        ['mrobert', '(Maxime ROBERT)'],
        ['vnoel', '(Victor NOEL)'],
      ]);
    });

    it(`should edit a user`, () => {
      let editVnoel = admin.openEditUser('vnoel');

      clearInput(editVnoel.nameInput);
      editVnoel.nameInput.sendKeys(`Victor NONO`);
      editVnoel.saveButton.click();

      browser.wait(EC.invisibilityOf(editVnoel.component), waitTimeout);

      expect(
        getMultipleElementsTexts(admin.panelListUsers, '.user-id', '.user-name')
      ).toEqual([
        ['admin', '(Administrator)'],
        ['bescudie', '(Bertrand ESCUDIE)'],
        ['cchevalier', '(Christophe CHEVALIER)'],
        ['cdeneux', '(Christophe DENEUX)'],
        ['mrobert', '(Maxime ROBERT)'],
        ['vnoel', '(Victor NONO)'],
      ]);

      editVnoel = admin.openEditUser('vnoel');

      expect(editVnoel.nameInput.getAttribute('value')).toEqual(`Victor NONO`);
      expect(editVnoel.passwordInput.getAttribute('value')).toEqual(``);

      // clean for backend
      clearInput(editVnoel.nameInput);
      editVnoel.nameInput.sendKeys(`Victor NOEL`);
      editVnoel.saveButton.click();
    });

    it('should not show a user-name in panel list users', () => {
      browser
        .manage()
        .window()
        .setSize(412, 732);

      expect(
        getMultipleElementsTexts(admin.panelListUsers, '.user-id')
      ).toEqual([
        ['admin'],
        ['bescudie'],
        ['cchevalier'],
        ['cdeneux'],
        ['mrobert'],
        ['vnoel'],
      ]);
    });
  });

  it('should not be visible to non-admin', () => {
    page.goToLogin().loginToWorkspaces('vnoel', 'vnoel');

    expect(page.adminButton.isPresent()).toEqual(false);
  });

  it('should show a warning to non-admin', () => {
    page.goToViaLogin('/admin').loginNoCheck('vnoel', 'vnoel');

    AdminPage.waitAndGet()
      .getNotAdminMessage()
      .expectToBe('warning', `You are not an administrator.`);
  });
});
