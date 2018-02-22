// base selector
const bs = `app-services-menu-view`;
const bsTreeServices = `app-services-list`;
const bsTreeEndpoints = `app-endpoints-list`;

export const SERVICES_DOM = {};

export const SERVICES_TREE_DOM = {
  navTree: {
    navTreeServices: `${bsTreeServices} .nav-list-tree`,
    navTreeEndpoints: `${bsTreeEndpoints} .nav-list-tree`,
  },
  texts: {
    servicesNames: `${bsTreeServices} .item-name`,
    endpointsNames: `${bsTreeEndpoints} .item-name`,
  },
};
