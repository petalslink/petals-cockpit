/**
 * Copyright (C) 2018-2020 Linagora
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

// base selector
const bs = `app-upload`;
const bsProgress = `app-snackbar-deployment-progress`;

export const UPLOAD_DOM = {
  texts: {
    fileName: `${bs} span.file-name`,
    titleCard: `${bs} .title-about`,
    defaultCardContentMsg: `${bs} .msg-about-upload`,
  },
  card: {
    selectedCardContent: `${bs} .when-selected-file .card-content-selected-file-info`,
    noSelectedCardContent: `${bs} .when-no-file-selected .card-content-no-selected-info`,
  },
  buttons: {
    browse: `${bs} .btn-choose-file`,
    cancelFileName: `${bs} .btn-cancel-file-name`,
    cancel: `${bs} .btn-cancel-file`,
    deploy: `${bs} .btn-deploy`,
  },
};

export const SNACKBAR_DEPLOYMENT_PROGRESS_DOM = {
  texts: {
    title: `${bsProgress} .title`,
    value: `${bsProgress} .progress-value`,
  },
  buttons: {
    dismiss: `${bsProgress} .btn-dismiss`,
  },
};
