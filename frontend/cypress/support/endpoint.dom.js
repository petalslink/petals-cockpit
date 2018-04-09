// base selector
const bs = `app-services-endpoint-view`;
const bsEndpointOverview = `app-services-endpoint-overview`;

export const ENDPOINT_DOM = {};

export const ENDPOINT_OVERVIEW_DOM = {
  texts: {
    endpointOverviewDetails: `${bsEndpointOverview} .card-endpoint-details`,
    busName: `${bsEndpointOverview} .item-endpoint-bus .bus-name`,
    containerName: `${bsEndpointOverview} .item-endpoint-container .container-name`,
    componentName: `${bsEndpointOverview} .item-endpoint-component .component-name`,
    serviceLocalpart: `${bsEndpointOverview} .item-service-content .item-localpart`,
    serviceNamespace: `${bsEndpointOverview} .item-service-content .item-namespace`,
    interfacesLocalparts: `${bsEndpointOverview} .item-interface-content .item-localpart`,
    interfacesNamespaces: `${bsEndpointOverview} .item-interface-content .item-namespace`,
  },
  navList: {
    navListEndpointLocation: `${bsEndpointOverview} .nav-list-endpoint-location`,
    navListService: `${bsEndpointOverview} .nav-list-endpoint-service`,
    navListInterfaces: `${bsEndpointOverview} .nav-list-endpoint-interfaces`,
  },
  listItem: {
    itemBus: `${bsEndpointOverview} .item-endpoint-bus`,
    itemContainer: `${bsEndpointOverview} .item-endpoint-container`,
    itemComponent: `${bsEndpointOverview} .item-endpoint-component`,
    itemInterfaces: `${bsEndpointOverview} .item-interface-content`,
    itemService: `${bsEndpointOverview} .item-service-content`,
  },
  avatars: {
    imgInterface: `${bsEndpointOverview} .img-card-interface`,
    imgService: `${bsEndpointOverview} .img-card-service`,
    imgEndpoint: `${bsEndpointOverview} .img-card-endpoint`,
  },
};
