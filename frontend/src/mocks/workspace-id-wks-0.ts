import * as Chance from 'chance';
const chance = new Chance;

const _ids = {
  idBusInPro0: 0, idBusInPro1: 0,
  idBus0: 0,
  idCont0: 0, idCont1: 0,
  idComp0: 0, idComp1: 0, idComp2: 0, idComp3: 0,
  idSu0: 0, idSu1: 0, idSu2: 0, idSu3: 0, idSu4: 0, idSu5: 0
}

export function _updateIdsForNewWorkspace() {
  for (let i in _ids) {
    _ids[i]++;
  }
}

const memoizeGetNewWorkspace = new Map();

export function getNewWorkspace(idWks) {
  if (memoizeGetNewWorkspace.has(idWks)) {
    return memoizeGetNewWorkspace.get(idWks);
  }

  _updateIdsForNewWorkspace();

  const wks = {
    workspace: {
      id: idWks,
      name: `Workspace ${idWks}`,
      users: [`bescudie`],
      buses: [`idBus${_ids.idBus0}`]
    },

    busesInProgress: {
      byId: {
        [`idBusInPro${_ids.idBusInPro0}`]: {
          id: `idBusInPro${_ids.idBusInPro0}`,
          ip: `192.168.0.1`,
          port: 4250,
          username: `petals`
        },
        [`idBusInPro${_ids.idBusInPro1}`]: {
          id: `idBusInPro${_ids.idBusInPro1}`,
          ip: `192.168.0.2`,
          port: 5132,
          username: `petals`,
          importError: `ERROR!!!!`
        }
      },
      allIds: [
        `idBusInPro${_ids.idBusInPro0}`,
        `idBusInPro${_ids.idBusInPro1}`
      ]
    },

    buses: {
      byId: {
        [`idBus${_ids.idBus0}`]: {
          id: `idBus${_ids.idBus0}`,
          isImporting: false,
          name: `Bus ${_ids.idBus0}`,
          state: `UNDEPLOYED`,
          containers: [
            `idCont${_ids.idCont0}`,
            `idCont${_ids.idCont1}`
          ]
        },
      },
      allIds: [
        `idBus${_ids.idBus0}`
      ]
    },

    containers: {
      byId: {
        [`idCont${_ids.idCont0}`]: {
          id: `idCont${_ids.idCont0}`,
          name: `Container ${_ids.idCont0}`,
          components: [
            `idComp${_ids.idComp0}`,
            `idComp${_ids.idComp1}`
          ]
        },
        [`idCont${_ids.idCont1}`]: {
          id: `idCont${_ids.idCont1}`,
          name: `Container ${_ids.idCont1}`,
          components: [
            `idComp${_ids.idComp2}`,
            `idComp${_ids.idComp3}`
          ]
        }
      },
      allIds: [
        `idCont${_ids.idCont0}`,
        `idCont${_ids.idCont1}`
      ]
    },

    components: {
      byId: {
        [`idComp${_ids.idComp0}`]: {
          id: `idComp${_ids.idComp0}`,
          name: `Component ${_ids.idComp0}`,
          serviceUnits: [`idSu${_ids.idSu0}`]
        },
        [`idComp${_ids.idComp1}`]: {
          id: `idComp${_ids.idComp1}`,
          name: `Component ${_ids.idComp1}`,
          serviceUnits: [
            `idSu${_ids.idSu1}`,
            `idSu${_ids.idSu2}`
          ]
        },
        [`idComp${_ids.idComp2}`]: {
          id: `idComp${_ids.idComp2}`,
          name: `Component ${_ids.idComp2}`,
          serviceUnits: [`idSu${_ids.idSu3}`]
        },
        [`idComp${_ids.idComp3}`]: {
          id: `idComp${_ids.idComp3}`,
          name: `Component ${_ids.idComp3}`,
          serviceUnits: [
            `idSu${_ids.idSu4}`,
            `idSu${_ids.idSu5}`
          ]
        }
      },
      allIds: [
        `idComp${_ids.idComp0}`,
        `idComp${_ids.idComp1}`,
        `idComp${_ids.idComp2}`,
        `idComp${_ids.idComp3}`
      ]
    },

    serviceUnits: {
      byId: {
        [`idSu${_ids.idSu0}`]: {
          id: `idSu${_ids.idSu0}`,
          name: `SU ${_ids.idSu0}`
        },
        [`idSu${_ids.idSu1}`]: {
          id: `idSu${_ids.idSu1}`,
          name: `SU ${_ids.idSu1}`
        },
        [`idSu${_ids.idSu2}`]: {
          id: `idSu${_ids.idSu2}`,
          name: `SU ${_ids.idSu2}`
        },
        [`idSu${_ids.idSu3}`]: {
          id: `idSu${_ids.idSu3}`,
          name: `SU ${_ids.idSu3}`
        },
        [`idSu${_ids.idSu4}`]: {
          id: `idSu${_ids.idSu4}`,
          name: `SU ${_ids.idSu4}`
        },
        [`idSu${_ids.idSu5}`]: {
          id: `idSu${_ids.idSu5}`,
          name: `SU ${_ids.idSu5}`
        }
      },
      allIds: [
        `idSu${_ids.idSu0}`,
        `idSu${_ids.idSu1}`,
        `idSu${_ids.idSu2}`,
        `idSu${_ids.idSu3}`,
        `idSu${_ids.idSu4}`,
        `idSu${_ids.idSu5}`
      ]
    }
  };

  memoizeGetNewWorkspace.set(idWks, wks);

  return wks;
};
