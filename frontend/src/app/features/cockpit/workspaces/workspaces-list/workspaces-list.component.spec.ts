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

import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import {
  IWorkspacesCommon,
  workspacesTableFactory,
} from 'app/features/cockpit/workspaces/state/workspaces/workspaces.interface';
import { SharedModule } from 'app/shared/shared.module';
import { click, elementText } from 'testing';
import { WorkspacesListComponent } from './workspaces-list.component';

import 'rxjs/add/observable/timer';

describe('WorkspacesListComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [SharedModule, NoopAnimationsModule],
        declarations: [TestHostComponent, WorkspacesListComponent],
        providers: [],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    component.user = {
      id: 'admin',
      name: 'Admin',
      lastWorkspace: null,
      isAdmin: true,
    };
    component.workspaces = {
      ...workspacesTableFactory() as IWorkspacesCommon,
      list: [],
    };
    fixture.detectChanges();
  });

  it('should create a workspace', () => {
    const input: HTMLInputElement = fixture.debugElement.query(
      By.css('input[formControlName="name"]')
    ).nativeElement;
    const button: HTMLButtonElement = fixture.debugElement.query(
      By.css('.btn-add-workspace')
    ).nativeElement;
    expect(button.disabled).toBe(true);

    input.value = 'test';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(button.disabled).toBe(false);

    click(button);
    fixture.detectChanges();
    expect(input.value).toEqual('');
    expect(button.disabled).toBe(true);
    expect(component.created).toEqual('test');
  });

  it('should show no workspaces', () => {
    const msg: HTMLDivElement = fixture.debugElement.query(
      By.css('.info-add-workspace > span')
    ).nativeElement;

    expect(msg.textContent).toEqual(`You don't have any workspace yet`);
  });

  it('should show the workspaces', () => {
    component.workspaces = {
      ...workspacesTableFactory() as IWorkspacesCommon,
      list: [
        {
          id: '0',
          name: 'WKS0',
          users: [
            { id: 'admin', name: 'Admin' },
            { id: 'user', name: 'User 0' },
          ],
        },
        {
          id: '1',
          name: 'WKS1',
          users: [{ id: 'admin', name: 'Admin' }],
        },
      ],
    };
    fixture.detectChanges();

    expect(
      elementText(
        fixture.debugElement.query(By.css('.workspace-list label'))
          .nativeElement
      ).trim()
    ).toEqual('2 Workspaces');
    expect(
      fixture.debugElement
        .queryAll(By.css('div.card-workspace md-card-title'))
        .map(elementText)
    ).toEqual(['WKS0', 'WKS1']);
    expect(
      fixture.debugElement
        .queryAll(By.css('div.card-workspace md-card-subtitle'))
        .map(elementText)
        .map(s => s.trim())
    ).toEqual([
      'Shared with you and 1 other.',
      'You are the only one using this workspace.',
    ]);
    expect(
      fixture.debugElement.queryAll(
        By.css('div.background-color-light-green-x2')
      ).length
    ).toEqual(0);

    component.workspaces = {
      ...component.workspaces,
      selectedWorkspaceId: '0',
    };
    fixture.detectChanges();

    const greenWorkspaces = fixture.debugElement.queryAll(
      By.css('div.background-color-light-green-x2')
    );
    expect(greenWorkspaces.length).toEqual(1);
    expect(
      elementText(greenWorkspaces[0].query(By.css('md-card-title')))
    ).toEqual('WKS0');
  });

  it('should fetch clicked workspace', () => {
    component.workspaces = {
      ...workspacesTableFactory() as IWorkspacesCommon,
      list: [
        {
          id: '1',
          name: 'WKS1',
          users: [{ id: 'admin', name: 'Admin' }],
        },
      ],
    };
    fixture.detectChanges();

    expect(
      elementText(
        fixture.debugElement.query(By.css('.workspace-list label'))
          .nativeElement
      ).trim()
    ).toEqual('1 Workspace');

    click(
      fixture.debugElement.query(By.css('div.card-workspace')).nativeElement
    );
    fixture.detectChanges();
    expect(component.fetched.id).toEqual('1');
  });
});

@Component({
  template: `
  <app-workspaces-list
    (fetch)="fetch($event)"
    (create)="create($event)"
    [workspaces]="workspaces"
    [user]="user">
  </app-workspaces-list>
  `,
})
class TestHostComponent {
  user;
  workspaces;
  created;
  fetched;
  create(name) {
    this.created = name;
  }
  fetch(workspace) {
    this.fetched = workspace;
  }
}
