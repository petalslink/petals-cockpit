import { ActionReducer, Action } from '@ngrx/store';

import { IUi } from '../interfaces/ui.interface';
import { uiState } from './ui.state';

export class Ui {
  private static reducerName = 'UI_REDUCER';

  public static reducer(ui = uiState(), {type, payload}: Action) {
    if (typeof Ui.mapActionsToMethod[type] === 'undefined') {
      return ui;
    }

    return Ui.mapActionsToMethod[type](ui, payload);
  }

  // tslint:disable-next-line:member-ordering
  public static SET_LANGUAGE = `${Ui.reducerName}_SET_LANGUAGE`;
  private static setLanguage(ui: IUi, payload) {
    return Object.assign(<IUi>{}, ui, <IUi>{ language: payload });
  }

  // tslint:disable-next-line:member-ordering
  public static TOGGLE_SIDENAV = `${Ui.reducerName}_TOGGLE_SIDENAV`;
  private static toggleSidenav(ui: IUi, payload) {
    return Object.assign(<IUi>{}, ui, <IUi>{ isSidenavVisible: !ui.isSidenavVisible });
  }

  // tslint:disable-next-line:member-ordering
  public static OPEN_SIDENAV = `${Ui.reducerName}_OPEN_SIDENAV`;
  private static openSidenav(ui: IUi, payload) {
    return Object.assign(<IUi>{}, ui, <IUi>{ isSidenavVisible: true });
  }

  // tslint:disable-next-line:member-ordering
  public static CLOSE_SIDENAV = `${Ui.reducerName}_CLOSE_SIDENAV`;
  private static closeSidenav(ui: IUi, payload) {
    return Object.assign(<IUi>{}, ui, <IUi>{ isSidenavVisible: false });
  }

  // tslint:disable-next-line:member-ordering
  public static OPEN_POPUP_WORKSPACES_LIST = `${Ui.reducerName}_OPEN_POPUP_WORKSPACES_LIST`;
  private static openPopupWorkspacesList(ui: IUi, payload) {
    return Object.assign(<IUi>{}, ui, <IUi>{ isPopupListWorkspacesVisible: true });
  }

  // tslint:disable-next-line:member-ordering
  public static CLOSE_POPUP_WORKSPACES_LIST = `${Ui.reducerName}_CLOSE_POPUP_WORKSPACES_LIST`;
  private static closePopupWorkspacesList(ui: IUi, payload) {
    return Object.assign(<IUi>{}, ui, <IUi>{ isPopupListWorkspacesVisible: false });
  }

  // tslint:disable-next-line:member-ordering
  public static SET_TITLES = `${Ui.reducerName}_SET_TITLES`;
  private static setTitles(ui: IUi, payload: { titleMainPart1: number, titleMainPart2: number, titleSubPart: number }) {
    return Object.assign(<IUi>{}, ui, <IUi>{
      titleMainPart1: (typeof payload.titleMainPart1 !== 'undefined' ? payload.titleMainPart1 : ui.titleMainPart1),
      titleMainPart2: (typeof payload.titleMainPart2 !== 'undefined' ? payload.titleMainPart2 : ui.titleMainPart2),
      titleSubPart: (typeof payload.titleSubPart !== 'undefined' ? payload.titleSubPart : ui.titleSubPart)
    });
  }

  // -------------------------------------------------------------------------------------------

  // tslint:disable-next-line:member-ordering
  private static mapActionsToMethod = {
    [Ui.SET_LANGUAGE]: Ui.setLanguage,
    [Ui.TOGGLE_SIDENAV]: Ui.toggleSidenav,
    [Ui.OPEN_SIDENAV]: Ui.openSidenav,
    [Ui.CLOSE_SIDENAV]: Ui.closeSidenav,
    [Ui.OPEN_POPUP_WORKSPACES_LIST]: Ui.openPopupWorkspacesList,
    [Ui.CLOSE_POPUP_WORKSPACES_LIST]: Ui.closePopupWorkspacesList,
    [Ui.SET_TITLES]: Ui.setTitles
  };
}
