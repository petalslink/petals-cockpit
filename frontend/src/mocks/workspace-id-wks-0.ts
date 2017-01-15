export const fetchWorkspaceidWks0 = {
  workspace: {
    id: 'idWks0',
    name: 'Workspace 0',
    users: ['bescudie'],
    buses: ['idBus0']
  },

  busesInProgress: {
    byId: {
      'idBusInPro0': {
        id: 'idBusInPro0',
        importIp: '192.168.0.1',
        importPort: 4250,
        importUsername: 'petals'
      },
      'idBusInPro1': {
        id: 'idBusInPro1',
        importIp: '192.168.0.2',
        importPort: 5132,
        importUsername: 'petals',
        importError: 'ERROR!!!!'
      }
    },
    allIds: [
      'idBusInPro0',
      'idBusInPro1'
    ]
  },

  buses: {
    byId: {
      'idBus0': {
        id: 'idBus0',
        isImporting: false,
        name: 'Bus 0',
        state: 'UNDEPLOYED',
        containers: [
          'idCont0',
          'idCont1'
        ]
      },
    },
    allIds: [
      'idBus0'
    ]
  },

  containers: {
    byId: {
      'idCont0': {
        id: 'idCont0',
        name: 'Container 0',
        components: [
          'idComp0',
          'idComp1'
        ]
      },
      'idCont1': {
        id: 'idCont1',
        name: 'Container 1',
        components: [
          'idComp2',
          'idComp3'
        ]
      }
    },
    allIds: [
      'idCont0',
      'idCont1'
    ]
  },

  components: {
    byId: {
      'idComp0': {
        id: 'idComp0',
        name: 'Component 0',
        serviceUnits: ['idSu0']
      },
      'idComp1': {
        id: 'idComp1',
        name: 'Component 1',
        serviceUnits: [
          'idSu1',
          'idSu2'
        ]
      },
      'idComp2': {
        id: 'idComp2',
        name: 'Component 2',
        serviceUnits: ['idSu3']
      },
      'idComp3': {
        id: 'idComp3',
        name: 'Component 3',
        serviceUnits: [
          'idSu4',
          'idSu5'
        ]
      }
    },
    allIds: [
      'idComp0',
      'idComp1',
      'idComp2',
      'idComp3'
    ]
  },

  serviceUnits: {
    byId: {
      'idSu0': {
        id: 'idSu0',
        name: 'SU 0'
      },
      'idSu1': {
        id: 'idSu1',
        name: 'SU 1'
      },
      'idSu2': {
        id: 'idSu2',
        name: 'SU 2'
      },
      'idSu3': {
        id: 'idSu3',
        name: 'SU 3'
      },
      'idSu4': {
        id: 'idSu4',
        name: 'SU 4'
      },
      'idSu5': {
        id: 'idSu5',
        name: 'SU 5'
      }
    },
    allIds: [
      'idSu0',
      'idSu1',
      'idSu2',
      'idSu3',
      'idSu4',
      'idSu5'
    ]
  }
};
