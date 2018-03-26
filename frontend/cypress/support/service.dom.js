// base selector
const bs = `app-services-service-view`;
const bsServiceOverview = `app-services-service-overview`;

export const SERVICE_DOM = {};

export const SERVICE_OVERVIEW_DOM = {
  texts: {
    serviceOverviewDetails: `${bsServiceOverview} .card-service-details`,
    aboutService: `${bsServiceOverview} .about-service`,
    serviceNamespace: `${bsServiceOverview} .item-service-content .item-namespace`,
    interfacesLocalparts: `${bsServiceOverview} .item-interface-content .item-localpart`,
    interfacesNamespaces: `${bsServiceOverview} .item-interface-content .item-namespace`,
    endpointsNames: `${bsServiceOverview} .item-endpoint-content .item-name`,
  },
  navList: {
    navListInterfaces: `${bsServiceOverview} .nav-list-service-interfaces`,
    navListEndpoints: `${bsServiceOverview} .nav-list-service-endpoints`,
  },
  listItem: {
    itemServices: `${bsServiceOverview} .item-service-content`,
    itemInterfaces: `${bsServiceOverview} .item-interface-content`,
    itemEndpoints: `${bsServiceOverview} .item-endpoint-content`,
  },
  avatars: {
    imgService: `${bsServiceOverview} .img-card-service`,
    imgInterface: `${bsServiceOverview} .img-card-interface`,
    imgEndpoint: `${bsServiceOverview} .img-card-endpoint`,
  },
};
