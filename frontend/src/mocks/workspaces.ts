export const fetchWorkspaces = {
  workspaces: {
    byId: {
      '559b4c47-5026-435c-bd6e-a47a903a7ba5': {
        id: '559b4c47-5026-435c-bd6e-a47a903a7ba5',
        name: 'Workspace 0',
        // TODO : This shouldn't need to be returned by server
        // if the buses is not empty for example, we don't want to
        // return it when we ask only for the list of workspace
        buses: [],
        users: ['bescudie']
      },
      '08dc0669-f7ca-4221-bf24-d59e07f5c1ed': {
        id: '08dc0669-f7ca-4221-bf24-d59e07f5c1ed',
        name: 'Workspace 1',
        // TODO : This shouldn't need to be returned by server
        // if the buses is not empty for example, we don't want to
        // return it when we ask only for the list of workspace
        buses: [],
        users: ['bescudie', 'mrobert']
      }
    },
    allIds: ['559b4c47-5026-435c-bd6e-a47a903a7ba5', '08dc0669-f7ca-4221-bf24-d59e07f5c1ed']
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
