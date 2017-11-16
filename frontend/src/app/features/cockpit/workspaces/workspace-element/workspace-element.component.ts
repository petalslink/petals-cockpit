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

import {
  Component,
  ContentChildren,
  Directive,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  TemplateRef,
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

import { deletable, IDeletable } from 'app/shared/operators/deletable.operator';

@Directive({ selector: '[appWorkspaceElementTab]' })
export class WorkspaceElementTabDirective {
  // tslint:disable-next-line:no-input-rename
  @Input('appWorkspaceElementTab') label: string;

  constructor(public templateRef: TemplateRef<any>) {}
}

@Component({
  selector: 'app-workspace-element',
  templateUrl: './workspace-element.component.html',
  styleUrls: ['./workspace-element.component.scss'],
})
export class WorkspaceElementComponent<
  T extends { id: string; name: string; isFetchingDetails: boolean }
> implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();
  activeTabIndex = 0;

  @Input() resourceObservable: Observable<T>;
  @Input() deletedMessage: string;

  @ContentChildren(WorkspaceElementTabDirective)
  tabs: QueryList<WorkspaceElementTabDirective>;

  resourceDeletable: IDeletable<T>;
  resource: T;

  constructor() {}

  ngOnInit() {
    this.resourceObservable
      .pipe(
        takeUntil(this.onDestroy$),
        deletable,
        tap(resourceDeletable => {
          if (
            this.resource &&
            this.resource.id !== resourceDeletable.value.id
          ) {
            this.activeTabIndex = 0;
          }
          this.resourceDeletable = resourceDeletable;
          this.resource = resourceDeletable.value;
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
