let _cptIdBus = 0;

const memoizeGetNewWorkspace = new Map();

export function getNewWorkspace(idWks) {
  if (memoizeGetNewWorkspace.has(idWks)) {
    return Object.assign({}, memoizeGetNewWorkspace.get(idWks));
  }

  const newBusFull = getNewBusFull();

  const wks = Object.assign(newBusFull, {
    workspace: {
      id: idWks,
      name: `Workspace ${idWks}`,
      users: [`bescudie`]
    },

    users: {
      bescudie: {
        name: `Bertrand ESCUDIE`
      }
    },

    busesInProgress: {
      [`idBus${_cptIdBus++}`]: {
        ip: `192.168.0.1`,
        port: 4250,
        username: `petals`
      },
      [`idBus${_cptIdBus++}`]: {
        ip: `192.168.0.2`,
        port: 5132,
        username: `petals`,
        importError: `ERROR!!!!`
      }
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
export function getNewBusFull() {
  const obj = {
    buses: {
      [`idBus${_cptIdBus}`]: {
        isImporting: false,
        name: `Bus ${_cptIdBus}`,
        state: `UNDEPLOYED`,
        containers: [
          `idCont${_ids.idCont0}`,
          `idCont${_ids.idCont1}`
        ]
      }
    },

    containers: {
      [`idCont${_ids.idCont0}`]: {
        name: `Container ${_ids.idCont0}`,
        components: [
          `idComp${_ids.idComp0}`,
          `idComp${_ids.idComp1}`
        ]
      },
      [`idCont${_ids.idCont1}`]: {
        name: `Container ${_ids.idCont1}`,
        components: [
          `idComp${_ids.idComp2}`,
          `idComp${_ids.idComp3}`
        ]
      }
    },

    components: {
      [`idComp${_ids.idComp0}`]: {
        name: `Component ${_ids.idComp0}`,
        serviceUnits: [`idSu${_ids.idSu0}`]
      },
      [`idComp${_ids.idComp1}`]: {
        name: `Component ${_ids.idComp1}`,
        serviceUnits: [
          `idSu${_ids.idSu1}`,
          `idSu${_ids.idSu2}`
        ]
      },
      [`idComp${_ids.idComp2}`]: {
        name: `Component ${_ids.idComp2}`,
        serviceUnits: [`idSu${_ids.idSu3}`]
      },
      [`idComp${_ids.idComp3}`]: {
        name: `Component ${_ids.idComp3}`,
        serviceUnits: [
          `idSu${_ids.idSu4}`,
          `idSu${_ids.idSu5}`
        ]
      }
    },

    serviceUnits: {
      [`idSu${_ids.idSu0}`]: {
        name: `SU ${_ids.idSu0}`
      },
      [`idSu${_ids.idSu1}`]: {
        name: `SU ${_ids.idSu1}`
      },
      [`idSu${_ids.idSu2}`]: {
        name: `SU ${_ids.idSu2}`
      },
      [`idSu${_ids.idSu3}`]: {
        name: `SU ${_ids.idSu3}`
      },
      [`idSu${_ids.idSu4}`]: {
        name: `SU ${_ids.idSu4}`
      },
      [`idSu${_ids.idSu5}`]: {
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

export function getDetailsBus(busId: string) {
  // right now a bus doesn't have more info
  return {};
}

const detailsContainers = new Map<string, any>();
let lastNumberIp = 0;

export function getDetailsContainer(containerId: string) {
  if (detailsContainers.has(containerId)) {
    return detailsContainers.get(containerId);
  }

  const details = {
    ip: `192.168.0.${lastNumberIp}`,
    port: 7700 + lastNumberIp,
    // TODO : Instead of idCont0 put some containers that can
    // work with the current workspace
    reachabilities: ['idCont0'],
    systemInfo: 'Petals ESB µKernel 4.0.2 Petals Standalone Shared Memory 4.0.2 OpenJDK Runtime Environment 1.7.0_111-b01 Oracle Corporation Linux 3.16.0-4-amd64 amd64'
  };

  detailsContainers.set(containerId, details);

  lastNumberIp++;

  return detailsContainers.get(containerId);
}
