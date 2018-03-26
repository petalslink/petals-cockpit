/**
 * Copyright (C) 2018 Linagora
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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { ISharedLibrarySimplified } from 'app/features/cockpit/workspaces/state/shared-libraries/shared-libraries.interface';

@Component({
  selector: 'app-shared-libraries-override',
  templateUrl: './shared-libraries-override.component.html',
  styleUrls: ['./shared-libraries-override.component.scss'],
})
export class SharedLibrariesOverrideComponent implements OnInit {
  @Input() initialSharedLibraries: ISharedLibrarySimplified[];
  @Output() cancel = new EventEmitter();
  @Output() save = new EventEmitter<ISharedLibrarySimplified[]>();

  columnsToDisplay = ['name', 'version', 'delete'];
  sharedLibraries: MatTableDataSource<ISharedLibrarySimplified>;

  inputsValids: boolean;

  constructor() {}

  ngOnInit() {
    this.sharedLibraries = new MatTableDataSource(
      Array.from(this.initialSharedLibraries)
    );
    this.checkInputs();
  }

  deleteSharedLibrary(index: number) {
    this.sharedLibraries.data = this.sharedLibraries.data.filter(
      (el, i) => i !== index
    );

    this.checkInputs();
  }

  updateSharedLibrary(
    index: number,
    name: string | null,
    version: string | null
  ) {
    const sl = this.sharedLibraries.data[index];
    this.sharedLibraries.data[index] = {
      name: name == null ? sl.name : name,
      version: version == null ? sl.version : version,
    };

    this.checkInputs();
  }

  addRow() {
    this.sharedLibraries.data = [
      ...this.sharedLibraries.data,
      { name: '', version: '' },
    ];

    this.inputsValids = false;
  }

  onCancel() {
    this.cancel.emit();
  }

  onSave() {
    this.save.emit(this.sharedLibraries.data);
  }

  checkInputs() {
    this.inputsValids = this.sharedLibraries.data.reduce(
      (prev, cur) => prev && !!cur.name && !!cur.version,
      true
    );
  }
}
