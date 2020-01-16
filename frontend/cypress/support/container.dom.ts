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
// const bs = `app-petals-container-view`;
const bsArtifactDeploy = `app-artifact-deployment`;

export const CONTAINER_DOM = {};

export const ARTIFACT_DEPLOYMENT_DOM = {
  buttons: {
    clearSaName: `.deploy-artifact .btn-clear-sa-name`,
    clearSlName: `.deploy-artifact .btn-clear-sl-name`,
    clearSlVersion: `.deploy-artifact .btn-clear-sl-version`,
    clearCompName: `.deploy-artifact .btn-clear-comp-name`,
    addSl: `.deploy-artifact .wrapper-table-sls .btn-add-row`,
    editSl: `.deploy-artifact .wrapper-table-sls .btn-edit-sl`,
    deleteSl: `.deploy-artifact .wrapper-table-sls .btn-delete-sl`,
    saveSl: `.deploy-artifact .wrapper-table-sls .btn-save-sl`,
    cancelSl: `.deploy-artifact .wrapper-table-sls .btn-cancel-sl`,
  },
  card: `${bsArtifactDeploy} .card-artifact-deployment`,
  inputs: {
    artifactName: `.deploy-artifact input[formcontrolname=name]`,
    artifactVersion: `.deploy-artifact input[formcontrolname=version]`,
    slName: `.deploy-artifact input[formcontrolname=slName]`,
    slVersion: `.deploy-artifact input[formcontrolname=slVersion]`,
  },
  formFields: {
    saNameFormField: `.deploy-artifact .sa-name-form-field`,
    slNameFormField: `.deploy-artifact .sl-name-form-field`,
    slVersionFormField: `.deploy-artifact .sl-version-form-field`,
    compNameFormField: `.deploy-artifact .comp-name-form-field`,
    overrideSlNameFormField: `.deploy-artifact .wrapper-table-sls .override-sl-name-form-field`,
    overrideSlVersionFormField: `.deploy-artifact .wrapper-table-sls .override-sl-version-form-field`,
  },
  table: {
    rowNames: `.deploy-artifact .comp-shared-libraries-table .mat-row`,
    wrapperSls: `.deploy-artifact .wrapper-table-sls`,
    slsTable: `.deploy-artifact .wrapper-table-sls .comp-shared-libraries-table`,
  },
};
