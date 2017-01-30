import { IUi } from '../interfaces/ui.interface';

export function uiState(): IUi {
  return {
    language: '',
    isSidenavVisible: false,
    isPopupListWorkspacesVisible: false,
    titleMainPart1: 'Petals Cockpit',
    titleMainPart2: '',
    titleSubPart: ''
  };
}
