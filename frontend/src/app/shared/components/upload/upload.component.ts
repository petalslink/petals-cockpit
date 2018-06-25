/**
 * Copyright (C) 2017-2018 Linagora
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
  ContentChild,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { UpdateFileInformationDirective } from './update-file-information.directive';
import {
  IEventFileSelected,
  ISelectedFileInformation,
} from './upload.interface';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent {
  @Input() title = `Upload a file`;
  @Input() acceptedFileType?: string;
  @Input() error?: string;
  @Input() disabled = false;
  @Input()
  set uploadStatus(uploadStatus: { percentage: number }) {
    if (!!uploadStatus && typeof uploadStatus.percentage === 'number') {
      this.isUploading = true;
      this.percentage = uploadStatus.percentage;
    } else {
      this.isUploading = false;
      this.percentage = undefined;
    }
  }
  @ContentChild(UpdateFileInformationDirective)
  updateFileInformation: UpdateFileInformationDirective;

  // when selecting a file
  selectedFileInformation: ISelectedFileInformation;

  // when uploading
  @Output()
  evtUploadFile = new EventEmitter<{
    selectedFileInformation: ISelectedFileInformation;
  }>();
  isUploading = false;
  percentage: number;

  @Output() evtResetFile = new EventEmitter<void>();
  @Output() evtFileSelected = new EventEmitter<{ file: File }>();

  fileChange(event: IEventFileSelected) {
    this.reset();

    this.selectedFileInformation = this.getSelectedFileInformation(
      event.target.files
    );

    this.evtFileSelected.emit({ file: this.selectedFileInformation.file });
  }

  cancelFile() {
    this.selectedFileInformation = undefined;
    this.evtResetFile.emit();
  }

  uploadFile() {
    this.isUploading = true;
    this.evtUploadFile.emit({
      selectedFileInformation: this.selectedFileInformation,
    });
  }

  reset() {
    this.selectedFileInformation = undefined;
    this.isUploading = false;
    this.percentage = undefined;
    this.error = undefined;
    this.evtResetFile.emit();
  }

  private getSelectedFileInformation(files: File[]): ISelectedFileInformation {
    if (files.length <= 0) {
      return null;
    }

    const [file] = files;
    const fileExtension = file.name.split('.').pop();
    const fileName = file.name.substr(
      0,
      file.name.length - fileExtension.length - 1
    );

    return {
      file,
      fileName,
      fileExtension,
    };
  }
}
