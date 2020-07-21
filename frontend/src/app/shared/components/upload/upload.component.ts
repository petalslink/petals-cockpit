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
  ContentChild,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

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
  @Input() canDeployArtifact: boolean;
  @Input() title: string;
  @Input() message: string;
  @Input() acceptedFileType?: string;
  @Input() error?: string;
  @Input() disabled: boolean;
  @Input() isFileParsed? = false;
  @Input()
  set uploadStatus(uploadStatus: { percentage: number }) {
    if (uploadStatus && typeof uploadStatus.percentage === 'number') {
      this.percentage = uploadStatus.percentage;
    } else {
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
    this.evtUploadFile.emit({
      selectedFileInformation: this.selectedFileInformation,
    });
  }

  reset() {
    this.selectedFileInformation = undefined;
    this.percentage = undefined;
    this.evtResetFile.emit();
  }

  private getSelectedFileInformation(files: File[]): ISelectedFileInformation {
    if (files.length <= 0) {
      return (this.selectedFileInformation = <ISelectedFileInformation>{});
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

/**
 * This snackBar component is required to inform user of the new deployment in the current container.
 **/
@Component({
  selector: 'app-snackbar-deployment-progress',
  template: `
    <div>
      <h3 class="title">{{ data.type }} deployment in progress...</h3>
      <div class="wrapper-progress-bar" *ngIf="data.uploadProgress$ | async as uploadProgress">
        <span class="progress-value">{{ uploadProgress }}%</span>
        <mat-progress-bar mode="determinate" [value]="uploadProgress" class="margin-left-x1 margin-right-x1"></mat-progress-bar>
        <button mat-button color="accent" (click)="dismiss()" class="btn-dismiss text-upper">
          <span class="dismiss-snackbar-deployment-progress-text-btn">Dismiss</span>
        </button>
      </div>
    </div>
  `,
})
export class SnackBarDeploymentProgressComponent implements OnInit {
  constructor(
    public snackRef: MatSnackBarRef<SnackBarDeploymentProgressComponent>,
    @Inject(MAT_SNACK_BAR_DATA)
    public data: {
      type: string;
      uploadProgress$: Observable<number>;
    }
  ) {}

  ngOnInit() {}

  dismiss() {
    this.snackRef.dismiss();
  }
}
