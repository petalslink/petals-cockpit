export function fetchWorkspaces() {
  return {
    workspaces: {
      'idWks0': {
        id: 'idWks0',
        name: 'Workspace 0',
        users: ['admin']
      },
      'idWks1': {
        id: 'idWks1',
        name: 'Workspace 1',
        users: ['bescudie', 'mrobert']
      }
    },
    users: {
      admin: {
        id: 'admin',
        name: 'Administrator',
        username: 'admin'
      },
      bescudie: {
        id: 'bescudie',
        name: 'Bertrand ESCUDIE',
        username: 'bescudie'
      },
      mrobert: {
        id: 'mrobert',
        name: 'Maxime ROBERT',
        username: 'mrobert'
      }
    }
  };
};
