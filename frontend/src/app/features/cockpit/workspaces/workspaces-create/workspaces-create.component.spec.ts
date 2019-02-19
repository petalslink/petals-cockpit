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

// import { Component } from '@angular/core';
// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { By } from '@angular/platform-browser';
// import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// import { SharedModule } from '@shared/shared.module';
// import { ICurrentUser } from '@shared/state/users.interface';
// import {
//   IWorkspace,
//   IWorkspaces,
//   IWorkspacesCommon,
//   workspacesTableFactory,
// } from '@wks/state/workspaces/workspaces.interface';
// import { click, elementText } from '@testing/index';
// import { WorkspacesCreateComponent } from './workspaces-create.component';

// describe('WorkspacesCreateComponent', () => {
//   let component: TestHostComponent;
//   let fixture: ComponentFixture<TestHostComponent>;

//   beforeEach(
//     async(() => {
//       TestBed.configureTestingModule({
//         imports: [SharedModule.forRoot(), NoopAnimationsModule],
//         declarations: [TestHostComponent, WorkspacesCreateComponent],
//       }).compileComponents();
//     })
//   );

//   beforeEach(() => {
//     fixture = TestBed.createComponent(TestHostComponent);
//     component = fixture.componentInstance;
//     component.user = {
//       id: 'admin',
//       name: 'Admin',
//       lastWorkspace: null,
//       isAdmin: true,
//       isFromLdap: false,
//     };
//     component.workspaces = {
//       ...(workspacesTableFactory() as IWorkspacesCommon),
//       list: [],
//     };
//     fixture.detectChanges();
//   });

//   it('should create a workspace', () => {
//     const input: HTMLInputElement = fixture.debugElement.query(
//       By.css('input[formControlName="name"]')
//     ).nativeElement;
//     const button: HTMLButtonElement = fixture.debugElement.query(
//       By.css('.btn-add-workspace')
//     ).nativeElement;
//     expect(button.disabled).toBe(true);

//     input.value = 'test';
//     input.dispatchEvent(new Event('input'));
//     fixture.detectChanges();
//     expect(button.disabled).toBe(false);

//     click(button);
//     fixture.detectChanges();
//     expect(input.value).toEqual('');
//     expect(button.disabled).toBe(true);
//     expect(component.created).toEqual('test');
//   });

//   it('should fetch clicked workspace', () => {
//     component.workspaces = {
//       ...(workspacesTableFactory() as IWorkspacesCommon),
//       list: [
//         {
//           id: '1',
//           name: 'WKS1',
//           users: [{ id: 'admin', name: 'Admin' }],
//         },
//       ],
//     };
//     fixture.detectChanges();

//     expect(
//       elementText(
//         fixture.debugElement.query(By.css('.workspace-list label'))
//           .nativeElement
//       ).trim()
//     ).toEqual('1 Workspace');

//     click(
//       fixture.debugElement.query(By.css('div.info-workspace')).nativeElement
//     );
//     fixture.detectChanges();
//     expect(component.fetched.id).toEqual('1');
//   });
// });

// @Component({
//   template: `
//   <app-workspaces-list
//     (fetch)="fetch($event)"
//     (create)="create($event)"
//     [workspaces]="workspaces"
//     [user]="user">
//   </app-workspaces-list>
//   `,
// })
// class TestHostComponent {
//   user: ICurrentUser;
//   workspaces: IWorkspaces;
//   created: string;
//   fetched: IWorkspace;
//   create(name: string) {
//     this.created = name;
//   }
//   fetch(workspace: IWorkspace) {
//     this.fetched = workspace;
//   }
// }
