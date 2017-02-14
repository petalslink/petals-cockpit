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
        users: ['bescudie', 'mrobert', 'cchevalier', 'vnoel', 'sgarcia', 'lduzan', 'gtraore']
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
      },
      cchevalier: {
        id: 'cchevalier',
        name: 'Christophe CHEVALIER',
        username: 'cchevalier'
      },
      vnoel: {
        id: 'vnoel',
        name: 'Victor NOEL',
        username: 'vnoel'
      },
      sgarcia: {
        id: 'sgarcia',
        name: 'Sebastien GARCIA',
        username: 'sgarcia'
      },
      lduzan: {
        id: 'lduzan',
        name: 'Luc DUZAN',
        username: 'lduzan'
      },
      gtraore: {
        id: 'gtraore',
        name: 'Grahmy TRAORE',
        username: 'gtraore'
      }
    }
  };
};
