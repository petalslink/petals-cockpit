export const fetchWorkspace0 = {
  workspace: {
    id: '559b4c47-5026-435c-bd6e-a47a903a7ba5',
    name: 'Workspace 0',
    users: ['bescudie'],
    buses: ['85fd4ddf-bbd4-4562-99cc-62e7fb7d698b']
  },

  buses: {
    byId: {
      '85fd4ddf-bbd4-4562-99cc-62e7fb7d698b': {
        id: '85fd4ddf-bbd4-4562-99cc-62e7fb7d698b',
        isImporting: false,
        name: 'Bus 1',
        state: 'UNDEPLOYED',
        containers: [
          '0e167608-8c98-45e7-a89e-64d93df6e2bc',
          '25dbde93-a507-4aa1-a98b-fc81d5e28b48'
        ]
      },
      // '85fd4ddf-bbd4-4562-99cc-ok': {
      //   id: '85fd4ddf-bbd4-4562-99cc-ok',
      //   containers: [],
      //   isImporting: true,
      //   importIp: '192.168.0.1',
      //   importPort: '5000',
      //   importUsername: 'petals'
      // },
      // '85fd4ddf-bbd4-4562-99cc-error': {
      //   id: '85fd4ddf-bbd4-4562-99cc-error',
      //   containers: [],
      //   isImporting: true,
      //   importIp: '192.168.0.2',
      //   importPort: 5000,
      //   importUsername: 'petals',
      //   importError: 'ERROR!!!!'
      // }
    },
    allIds: [
      '85fd4ddf-bbd4-4562-99cc-62e7fb7d698b',
      // '85fd4ddf-bbd4-4562-99cc-ok',
      // '85fd4ddf-bbd4-4562-99cc-error'
    ]
  },

  containers: {
    byId: {
      '0e167608-8c98-45e7-a89e-64d93df6e2bc': {
        id: '0e167608-8c98-45e7-a89e-64d93df6e2bc',
        name: 'Container 2',
        components: [
          '53f67d40-025e-4088-acc3-d03125127177',
          '53e208cd-50f3-42aa-925e-5e53913ca0fd'
        ]
      },
      '25dbde93-a507-4aa1-a98b-fc81d5e28b48': {
        id: '25dbde93-a507-4aa1-a98b-fc81d5e28b48',
        name: 'Container 3',
        components: [
          '548902d6-33b8-478b-9bcd-c1a440f22002',
          'beeeb403-7a4f-4b79-a1be-b304bfc6590c'
        ]
      }
    },
    allIds: [
      '0e167608-8c98-45e7-a89e-64d93df6e2bc',
      '25dbde93-a507-4aa1-a98b-fc81d5e28b48'
    ]
  },

  components: {
    byId: {
      '53f67d40-025e-4088-acc3-d03125127177': {
        id: '53f67d40-025e-4088-acc3-d03125127177',
        name: 'Component 4',
        serviceUnits: ['ba95dd26-956e-4ca3-a6f8-435ee050c8a3']
      },
      '53e208cd-50f3-42aa-925e-5e53913ca0fd': {
        id: '53e208cd-50f3-42aa-925e-5e53913ca0fd',
        name: 'Component 5',
        serviceUnits: [
          'd71151bc-56e6-4d40-b021-c0a779de8672',
          '6898c078-60da-4f42-a30e-99cf5cd883b2'
        ]
      },
      '548902d6-33b8-478b-9bcd-c1a440f22002': {
        id: '548902d6-33b8-478b-9bcd-c1a440f22002',
        name: 'Component 6',
        serviceUnits: ['6b92189a-7b74-4e8d-bff5-2377c0b6da83']
      },
      'beeeb403-7a4f-4b79-a1be-b304bfc6590c': {
        id: 'beeeb403-7a4f-4b79-a1be-b304bfc6590c',
        name: 'Component 7',
        serviceUnits: [
          'c997f09d-afb0-42fd-b77a-387b9f94d86c',
          '1bcc10ae-083c-48c0-b3cb-e1ad482bf97e'
        ]
      }
    },
    allIds: [
      '53f67d40-025e-4088-acc3-d03125127177',
      '53e208cd-50f3-42aa-925e-5e53913ca0fd',
      '548902d6-33b8-478b-9bcd-c1a440f22002',
      'beeeb403-7a4f-4b79-a1be-b304bfc6590c'
    ]
  },

  serviceUnits: {
    byId: {
      'ba95dd26-956e-4ca3-a6f8-435ee050c8a3': {
        id: 'ba95dd26-956e-4ca3-a6f8-435ee050c8a3',
        name: 'SU 7'
      },
      'd71151bc-56e6-4d40-b021-c0a779de8672': {
        id: 'd71151bc-56e6-4d40-b021-c0a779de8672',
        name: 'SU 8'
      },
      '6898c078-60da-4f42-a30e-99cf5cd883b2': {
        id: '6898c078-60da-4f42-a30e-99cf5cd883b2',
        name: 'SU 9'
      },
      '6b92189a-7b74-4e8d-bff5-2377c0b6da83': {
        id: '6b92189a-7b74-4e8d-bff5-2377c0b6da83',
        name: 'SU 10'
      },
      'c997f09d-afb0-42fd-b77a-387b9f94d86c': {
        id: 'c997f09d-afb0-42fd-b77a-387b9f94d86c',
        name: 'SU 11'
      },
      '1bcc10ae-083c-48c0-b3cb-e1ad482bf97e': {
        id: '1bcc10ae-083c-48c0-b3cb-e1ad482bf97e',
        name: 'SU 12'
      }
    },
    allIds: [
      'ba95dd26-956e-4ca3-a6f8-435ee050c8a3',
      'd71151bc-56e6-4d40-b021-c0a779de8672',
      '6898c078-60da-4f42-a30e-99cf5cd883b2',
      '6b92189a-7b74-4e8d-bff5-2377c0b6da83',
      'c997f09d-afb0-42fd-b77a-387b9f94d86c',
      '1bcc10ae-083c-48c0-b3cb-e1ad482bf97e'
    ]
  }
};
