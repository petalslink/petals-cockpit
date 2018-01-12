// base selector
const bs = `app-petals-menu-view`;
const bsBip = `app-buses-in-progress`;
const bsTree = `app-material-tree`;

export const PETALS_DOM = {
  inputs: { search: `${bs} input[formcontrolname="search"]` },
  buttons: { addBus: `${bs} .btn-add-bus` },
};

export const BIP_DOM = {
  navList: { navListBipPetals: `${bsBip} .nav-list-imports-in-progress` },
  texts: { ipPort: `${bsBip} .ip-port` },
};

export const PETALS_TREE_DOM = {
  navTree: { navTreePetals: `${bsTree} .nav-list-tree` },
  links: {
    itemsLinks: `${bsTree} .item-list a`,
  },
  texts: {
    itemsNames: `${bsTree} .item-name`,
    itemsHighlights: `${bsTree} .highlight`,
  },
};
