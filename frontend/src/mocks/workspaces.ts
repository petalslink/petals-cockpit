export function fetchWorkspaces() {
  return {
    workspaces: {
      byId: {
        'idWks0': {
          id: 'idWks0',
          name: 'Workspace idWks0',
          users: ['bescudie']
        },
        'idWks1': {
          id: 'idWks1',
          name: 'Workspace idWks1',
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
};
