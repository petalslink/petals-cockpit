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

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { debounceTime, filter, map, tap } from 'rxjs/operators';

import { FlatTreeControl } from '@angular/cdk/tree';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from '@angular/material/tree';
import { Buses } from '@feat/cockpit/workspaces/state/buses/buses.actions';
import { Components } from '@feat/cockpit/workspaces/state/components/components.actions';
import { Containers } from '@feat/cockpit/workspaces/state/containers/containers.actions';
import { IStore } from '@shared/state/store.interface';
import { Workspaces } from '@wks/state/workspaces/workspaces.actions';
import {
  WorkspaceElement,
  WorkspaceElementFlatNode,
  WorkspaceElementType,
} from '@wks/state/workspaces/workspaces.selectors';

@Component({
  selector: 'app-petals-menu-view',
  templateUrl: './petals-menu-view.component.html',
  styleUrls: ['./petals-menu-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetalsMenuViewComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  @Input() workspaceId: string;
  @Input() tree$: Observable<WorkspaceElement[]>;

  searchForm: FormGroup;
  search = '';

  treeControl: FlatTreeControl<WorkspaceElementFlatNode>;
  treeFlattener: MatTreeFlattener<WorkspaceElement, WorkspaceElementFlatNode>;
  dataSource: MatTreeFlatDataSource<WorkspaceElement, WorkspaceElementFlatNode>;

  private _focusSearchInput$ = new Subject<boolean>();
  focusSearchInput$ = this._focusSearchInput$.asObservable();

  // needed to use it in template
  nodeTypes = WorkspaceElementType;

  constructor(private fb: FormBuilder, private store$: Store<IStore>) {}

  ngOnInit() {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren
    );

    this.treeControl = new FlatTreeControl<WorkspaceElementFlatNode>(
      this.getLevel,
      this.isExpandable
    );

    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );

    this.tree$
      .pipe(
        filter(
          tree => JSON.stringify(tree) !== JSON.stringify(this.dataSource.data)
        ),
        tap(tree => {
          this.dataSource.data = tree;

          // when dataSource is binded, all nodes are collapsed
          this.treeControl.dataNodes
            .filter(node => !node.isFolded)
            .forEach(node => this.treeControl.expand(node));
        })
      )
      .subscribe();

    this.searchForm = this.fb.group({
      search: '',
    });

    this.searchForm.valueChanges
      .pipe(
        debounceTime(300),
        map(value => value.search),
        tap(search => {
          this.store$.dispatch(new Workspaces.SetPetalsSearch({ search }));
        })
      )
      .subscribe();

    this.store$
      .pipe(
        select(state => state.workspaces.searchPetals),
        tap(searchPetals => {
          this.searchForm.get('search').setValue(searchPetals, {
            emitEvent: false,
          });
          this.search = searchPetals;
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  focusSearch() {
    this.store$.dispatch(new Workspaces.SetPetalsSearch({ search: '' }));
    this._focusSearchInput$.next(true);
  }

  transformer(node: WorkspaceElement, level: number): WorkspaceElementFlatNode {
    return {
      ...node,
      expandable: node.children.length > 0,
      level: level,
    };
  }

  getLevel(node: WorkspaceElementFlatNode) {
    return node.level;
  }

  private isExpandable(node: WorkspaceElementFlatNode) {
    return node.expandable;
  }

  private getChildren(node: WorkspaceElement): WorkspaceElement[] {
    return node.children;
  }

  toggleFold(node: WorkspaceElementFlatNode) {
    if (node.expandable) {
      switch (node.type) {
        case WorkspaceElementType.BUS:
          this.store$.dispatch(new Buses.ToggleFold({ id: node.id }));
          break;
        case WorkspaceElementType.CONTAINER:
          this.store$.dispatch(
            new Containers.ToggleFold({ id: node.id, type: 'container' })
          );
          break;
        case WorkspaceElementType.COMPONENT:
          this.store$.dispatch(new Components.ToggleFold({ id: node.id }));
          break;
        case WorkspaceElementType.COMPCATEGORY:
          this.store$.dispatch(
            new Containers.ToggleFold({ id: node.id, type: 'components' })
          );
          break;
        case WorkspaceElementType.SLCATEGORY:
          this.store$.dispatch(
            new Containers.ToggleFold({ id: node.id, type: 'shared-libraries' })
          );
          break;
        case WorkspaceElementType.SACATEGORY:
          this.store$.dispatch(
            new Containers.ToggleFold({
              id: node.id,
              type: 'service-assemblies',
            })
          );
          break;
      }
    }
  }
}
