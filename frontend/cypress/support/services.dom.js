// base selector
const bs = `app-services-menu-view`;
const bsTreeInterfaces = `app-interfaces-list`;
const bsTreeServices = `app-services-list`;
const bsTreeEndpoints = `app-endpoints-list`;

export const SERVICES_DOM = {};

export const SERVICES_TREE_DOM = {
  expPanel: {
    expPanelInterfaces: `${bs} .exp-pnl-interfaces-tree`,
    expPanelServices: `${bs} .exp-pnl-services-tree`,
    expPanelEndpoints: `${bs} .exp-pnl-endpoints-tree`,
  },
  navTree: {
    navTreeInterfaces: `${bsTreeInterfaces} .nav-list-tree`,
    navTreeServices: `${bsTreeServices} .nav-list-tree`,
    navTreeEndpoints: `${bsTreeEndpoints} .nav-list-tree`,
  },
  texts: {
    title: `${bs} .pnl-title`,
    interfacesNames: `${bsTreeInterfaces} .item-name`,
    servicesNames: `${bsTreeServices} .item-name`,
    endpointsNames: `${bsTreeEndpoints} .item-name`,
  },
};
