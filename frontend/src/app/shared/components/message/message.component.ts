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
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent implements OnInit, OnChanges {
  @Input() msg: string;
  @Input() type: 'error' | 'warning' | 'info' | 'success';
  @Input() isClosable? = true;
  @Input() isFullWidth = false;
  @Input() maxLength = 200;
  @Output() evtClose = new EventEmitter();

  icon: string;

  isHidden = false;

  dialogRef: MatDialogRef<any>;
  @ViewChild('dialog') template: TemplateRef<any>;

  constructor(public dialog: MatDialog) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    // error warning and info have exactly the same name as their icon
    this.icon = this.type;

    if (this.type === 'success') {
      this.icon = 'done';
    }
  }

  openDialog() {
    this.dialogRef = this.dialog.open(this.template);
  }

  hideMessage() {
    this.isHidden = true;
    this.evtClose.emit();
  }
}
