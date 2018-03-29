// base selector
const bs = `app-services-interface-view`;
const bsInterfaceOverview = `app-services-interface-overview`;

export const INTERFACE_DOM = {};

export const INTERFACE_OVERVIEW_DOM = {
  texts: {
    interfaceOverviewDetails: `${bsInterfaceOverview} .card-interface-details`,
    aboutInterface: `${bsInterfaceOverview} .about-interface`,
    interfaceNamespace: `${bsInterfaceOverview} .item-interface-content .item-namespace`,
    servicesLocalparts: `${bsInterfaceOverview} .item-service-content .item-localpart`,
    servicesNamespaces: `${bsInterfaceOverview} .item-service-content .item-namespace`,
    endpointsNames: `${bsInterfaceOverview} .item-endpoint-content .item-name`,
  },
  navList: {
    navListServices: `${bsInterfaceOverview} .nav-list-interface-services`,
    navListEndpoints: `${bsInterfaceOverview} .nav-list-interface-endpoints`,
  },
  listItem: {
    itemInterfaces: `${bsInterfaceOverview} .item-interface-content`,
    itemServices: `${bsInterfaceOverview} .item-service-content`,
    itemEndpoints: `${bsInterfaceOverview} .item-endpoint-content`,
  },
  avatars: {
    imgInterface: `${bsInterfaceOverview} .img-card-interface`,
    imgService: `${bsInterfaceOverview} .img-card-service`,
    imgEndpoint: `${bsInterfaceOverview} .img-card-endpoint`,
  },
};
