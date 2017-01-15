export const fetchWorkspaces = {
  workspaces: {
    byId: {
      'idWks0': {
        id: 'idWks0',
        name: 'Workspace 0',
        // TODO : This shouldn't need to be returned by server
        // if the buses is not empty for example, we don't want to
        // return it when we ask only for the list of workspace
        buses: [],
        users: ['bescudie']
      },
      'idWks1': {
        id: 'idWks1',
        name: 'Workspace 1',
        // TODO : This shouldn't need to be returned by server
        // if the buses is not empty for example, we don't want to
        // return it when we ask only for the list of workspace
        buses: [],
        users: ['bescudie', 'mrobert']
      }
    },
    allIds: ['idWks0', 'idWks1']
  },
  users: {
    byId: {
      bescudie: {
        id: 'bescudie',
        name: 'Bertrand ESCUDIE'
      },
      mrobert: {
        id: 'mrobert',
        name: 'Maxime ROBERT'
      }
    },
    allIds: ['bescudie', 'mrobert']
  }
};
