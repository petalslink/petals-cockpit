// base selector
const bs = `app-petals-component-view`;
const bsCompOp = `app-petals-component-operations`;
const bsCompOv = `app-petals-component-overview`;
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
