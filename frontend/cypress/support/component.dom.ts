/**
 * Copyright (C) 2018-2019 Linagora
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
const bs = `app-petals-component-view`;
const bsCompOp = `app-petals-component-operations`;
const bsCompOvSl = 'app-shared-libraries-override';

export const COMPONENT_DOM = {
  tabs: `${bs} .mat-tab-label`,
};

export const COMPONENT_OPERATIONS_DOM = {
  buttons: {
    actionState: `${bsCompOp} .list-actions-name span button span span.action-name`,
  },
};

export const COMPONENT_OVERVIEW_DOM = {};

export const COMPONENT_OV_SL_DOM = {
  buttons: {
    open: '.deploy-component button.override-sl',
    add: `${bsCompOvSl} .btn-add`,
    cancel: `${bsCompOvSl} .btn-cancel`,
    save: `${bsCompOvSl} .btn-save`,
    deletes: `${bsCompOvSl} .btn-delete`,
  },
  slInputs: `${bsCompOvSl} mat-table mat-cell input`,
};

export const COMPONENT_UPLOAD_DOM = {
  slList: `.deploy-component mat-list .mat-list-item-content`,
  uploadBtn: '.deploy-component .btn-upload',
};

export const SL_UPLOAD_DOM = {
  uploadBtn: '.deploy-shared-library .btn-upload',
  errorMsg: '.deploy-shared-library mat-error',
};
