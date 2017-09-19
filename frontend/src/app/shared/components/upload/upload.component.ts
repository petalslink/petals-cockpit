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
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
  // disabled for now because of
  // https://github.com/angular/angular/issues/12313
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadComponent implements OnInit {
  @Input() title: string;
  @Input() disabled: boolean;
  @Input() error: string;
  @Input() placeholderChangeFileName?: string;

  @Output()
  onDeploy: EventEmitter<{ file: File; name: string }> = new EventEmitter();

  @ViewChild('formUpload') formUpload: NgForm;
  deployModel: string;

  fileToDeploy: File;
  changeFileName: string;

  constructor() {}

  ngOnInit() {}

  fileChange(event: { target: { files: FileList } }) {
    const fileList: FileList = event.target.files;

    if (fileList.length > 0) {
      const selectedFile = fileList[0];
      this.fileToDeploy = selectedFile;
      this.changeFileName = this.fileToDeploy.name.substring(
        0,
        this.fileToDeploy.name.length - 4
      );
    }
  }

  resetForm() {
    this.fileToDeploy = undefined;
    this.changeFileName = undefined;
    this.deployModel = undefined;
    this.formUpload.reset();
  }
}
