/**
 * Copyright (C) 2017-2020 Linagora
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

import { NestedTreeControl } from '@angular/cdk/tree';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';

import { Workspaces } from '@feat/cockpit/workspaces/state/workspaces/workspaces.actions';
import { IServiceTreeNode } from '@feat/cockpit/workspaces/state/workspaces/workspaces.interface';
import { replacerStringify } from '@shared/helpers/shared.helper';
import { IStore } from '@shared/state/store.interface';

@Component({
  selector: 'app-services-menu-view',
  templateUrl: './services-menu-view.component.html',
  styleUrls: ['./services-menu-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesMenuViewComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  isFetchingServices$: Observable<boolean>;

  @Input() servicesEndpointsTree$: Observable<IServiceTreeNode>;
  @Input() workspaceId: string;

  nestedTreeControl: NestedTreeControl<IServiceTreeNode>;
  nestedDataSource: MatTreeNestedDataSource<IServiceTreeNode>;

  searchForm: FormGroup;
  search = '';

  private _focusSearchInput$ = new Subject<boolean>();
  focusSearchInput$ = this._focusSearchInput$.asObservable();

  constructor(private fb: FormBuilder, private store$: Store<IStore>) {}

  ngOnInit() {
    this.nestedTreeControl = new NestedTreeControl<IServiceTreeNode>(
      this._getChildren
    );

    this.nestedDataSource = new MatTreeNestedDataSource();

    this.servicesEndpointsTree$
      .pipe(
        takeUntil(this.onDestroy$),
        filter(
          tree =>
            !!tree &&
            JSON.stringify(tree.children, replacerStringify) !==
              JSON.stringify(this.nestedDataSource.data, replacerStringify)
        ),
        tap(tree => {
          this.nestedDataSource.data = tree.children;
          this.nestedTreeControl.dataNodes = tree.children;
        })
      )
      .subscribe();

    this.searchForm = this.fb.group({ search: '' });

    this.isFetchingServices$ = this.store$.pipe(
      select(state => state.workspaces.isFetchingServices)
    );

    this.searchForm.valueChanges
      .pipe(
        map(value => value.search),
        tap(search =>
          this.store$.dispatch(new Workspaces.SetServicesSearch({ search }))
        )
      )
      .subscribe();

    this.store$
      .pipe(
        select(state => state.workspaces.searchServices),
        tap(searchServices => {
          this.searchForm.get('search').setValue(searchServices, {
            emitEvent: false,
          });
          this.search = searchServices;
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  private _getChildren = (node: IServiceTreeNode) => node.children;

  displayChild = (_: number, node: IServiceTreeNode) => {
    !node.isFolded
      ? this.nestedTreeControl.expand(node)
      : this.nestedTreeControl.collapse(node);
    return !!node.children && node.children.length > 0;
  };

  toggleFold(node: IServiceTreeNode) {
    this.store$.dispatch(
      new Workspaces.ToggleServiceTreeFold({ path: node.path })
    );
  }

  isMatchingSearch(node: IServiceTreeNode): boolean {
    return (
      this.search === '' ||
      node.name.toLowerCase().includes(this.search.toLowerCase()) ||
      node.children.some(child => this.isMatchingSearch(child))
    );
  }

  refreshServices() {
    this.store$.dispatch(
      new Workspaces.RefreshServices({ id: this.workspaceId })
    );
  }

  focusSearch() {
    this.store$.dispatch(new Workspaces.SetServicesSearch({ search: '' }));
    this._focusSearchInput$.next(true);
  }
}
