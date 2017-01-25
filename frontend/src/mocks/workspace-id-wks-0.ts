let _cptIdBus = 0;

const memoizeGetNewWorkspace = new Map();

export function getNewWorkspace(idWks) {
  if (memoizeGetNewWorkspace.has(idWks)) {
    return Object.assign({}, memoizeGetNewWorkspace.get(idWks));
  }

  const newBusFull = getNewBusFull(idWks);
  _cptIdBus--;

  const wks = Object.assign(newBusFull, {
    workspace: {
      id: idWks,
      name: `Workspace ${idWks}`,
      users: [`bescudie`],
      buses: [`idBus${_cptIdBus++}`]
    },

    busesInProgress: {
      byId: {
        [`idBus${_cptIdBus}`]: {
          id: `idBus${_cptIdBus++}`,
          ip: `192.168.0.1`,
          port: 4250,
          username: `petals`
        },
        [`idBus${_cptIdBus}`]: {
          id: `idBus${_cptIdBus++}`,
          ip: `192.168.0.2`,
          port: 5132,
          username: `petals`,
          importError: `ERROR!!!!`
        }
      },
      allIds: [
        `idBus${_cptIdBus - 2}`,
        `idBus${_cptIdBus - 1}`
      ]
    },
  });

  memoizeGetNewWorkspace.set(idWks, wks);

  return Object.assign({}, wks);
};

// ------------------------------------------

const _ids = {
  idCont0: 0, idCont1: 1,
  idComp0: 0, idComp1: 1, idComp2: 2, idComp3: 3,
  idSu0: 0, idSu1: 1, idSu2: 2, idSu3: 3, idSu4: 4, idSu5: 5
};

// return a bus with containers/components/sus
// and add them to the list of bus in corresponding workspace
export function getNewBusFull(idWks) {
  const obj = {
    buses: {
      byId: {
        [`idBus${_cptIdBus}`]: {
          id: `idBus${_cptIdBus}`,
          isImporting: false,
          name: `Bus ${_cptIdBus}`,
          state: `UNDEPLOYED`,
          containers: [
            `idCont${_ids.idCont0}`,
            `idCont${_ids.idCont1}`
          ]
        },
      },
      allIds: [
        `idBus${_cptIdBus}`
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

  // TODO add it to the workspace otherwise we will loose them when changing workspace

  _cptIdBus++;

  _ids.idCont0 += 2;
  _ids.idCont1 += 2;

  _ids.idComp0 += 4;
  _ids.idComp1 += 4;
  _ids.idComp2 += 4;
  _ids.idComp3 += 4;

  _ids.idSu0 += 6;
  _ids.idSu1 += 6;
  _ids.idSu2 += 6;
  _ids.idSu3 += 6;
  _ids.idSu4 += 6;
  _ids.idSu5 += 6;

  return obj;
}
