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
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent implements OnInit {
  @Input() msg: string;
  @Input() type: 'error' | 'warning' | 'info';
  @Input() isClosable? = true;
  @Input() maxLength = 200;
  @Output() onClose = new EventEmitter();

  isHidden = false;

  dialogRef: MatDialogRef<any>;
  @ViewChild('dialog') template: TemplateRef<any>;

  constructor(public dialog: MatDialog) {}

  ngOnInit() {}

  openDialog() {
    this.dialogRef = this.dialog.open(this.template);
  }

  hideMessage() {
    this.isHidden = true;
    this.onClose.emit();
  }
}
