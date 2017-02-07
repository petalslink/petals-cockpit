export class Workspace {
  private static _cpt = 0;
  private _id: number;
  private _buses: Bus[] = [];
  private _busesInProgress: BusInProgress[] = [];

  constructor() {
    this._id = Workspace._cpt++;

    // by default add 1 bus
    this._buses.push(new Bus());

    // and 2 buses in progress
    this._busesInProgress.push(new BusInProgress());
    this._busesInProgress.push(new BusInProgress());
  }

  public getIdFormatted() {
    return `idWks${this._id}`;
  }

  public toObj() {
    return {
      id: this._id,
      name: `Workspace ${this._id}`,
      users: [`bescudie`]
    };
  }

  public getBuses() {
    return this._buses;
  }

  public getBusesInProgress() {
    return this._busesInProgress;
  }

  public getContainers() {
    return <Container[]>this._buses.reduce((acc, bus) =>
      [...acc, ...bus.getContainers()],
    []);
  }

  public getComponents() {
    return <Component[]>this.getContainers().reduce((acc, container) =>
      [...acc, ...container.getComponents()],
    []);
  }

  public getServiceUnits() {
    return <ServiceUnit[]>this.getComponents().reduce((acc, component) =>
      [...acc, ...component.getServiceUnits()],
    []);
  }
}

export class BusBase {
  private static _cpt = 0;
  protected _id: number;

  constructor() {
    this._id = BusBase._cpt++;
  }

  public getIdFormatted() {
    return `idBus${this._id}`;
  }
}

export class Bus extends BusBase {
  private _containers: Container[] = [];

  constructor() {
    super();

    // by default add 2 containers
    this._containers.push(new Container());
    this._containers.push(new Container());
  }

  getContainers() {
    return this._containers;
  }

  toObj() {
    return {
      [this.getIdFormatted()]: {
        isImporting: false,
        name: `Bus ${this._id}`,
        state: `UNDEPLOYED`,
        containers: this._containers.map(container => container.getIdFormatted())
      }
    };
  }
}

export class BusInProgress extends BusBase {
  constructor() {
    super();
  }

  toObj() {
    return {
      [this.getIdFormatted()]: {
        ip: `192.168.0.${this._id}`,
        port: 4250 + this._id,
        username: `petals`
      }
    };
  }
}

export class Container {
  private static _cpt = 0;
  protected _id: number;
  private _components: Component[] = []

  constructor() {
    this._id = Container._cpt++;

    // by default add 2 containers
    this._components.push(new Component());
    this._components.push(new Component());
  }

  getComponents() {
    return this._components;
  }

  public getIdFormatted() {
    return `idCont${this._id}`;
  }

  toObj() {
    return {
      [this.getIdFormatted()]: {
        name: `Cont ${this._id}`,
        components: this._components.map(component => component.getIdFormatted())
      }
    };
  }
}

export class Component {
  private static _cpt = 0;
  protected _id: number;
  private _serviceUnits: ServiceUnit[] = []

  constructor() {
    this._id = Component._cpt++;

    // by default add 2 service units
    this._serviceUnits.push(new ServiceUnit());
    this._serviceUnits.push(new ServiceUnit());
  }

  public getIdFormatted() {
    return `idComp${this._id}`;
  }

  getServiceUnits() {
    return this._serviceUnits;
  }

  toObj() {
    return {
      [this.getIdFormatted()]: {
        name: `Comp ${this._id}`,
        serviceUnits: this._serviceUnits.map(serviceUnit => serviceUnit.getIdFormatted())
      }
    };
  }
}

export class ServiceUnit {
  private static _cpt = 0;
  protected _id: number;

  constructor() {
    this._id = ServiceUnit._cpt++;
  }

  public getIdFormatted() {
    return `idSu${this._id}`;
  }

  toObj() {
    return {
      [this.getIdFormatted()]: {
        name: `SU ${this._id}`
      }
    };
  }
}

// map to cache the created workspaces
const _memoizedWorkspaces = new Map();

/**
 * getWorkspace
 *
 * return the workspace which has an id `idWks`
 * if it already exists, will return the existing one
 * otherwise will create it with some default values
 *
 * @export
 * @param {string} idWks The workspace id you're looking for
 * @returns {any} the workspace
 */
export function getWorkspace(idWks: string) {
  if (_memoizedWorkspaces.has(idWks)) {
    return Object.assign({}, _memoizedWorkspaces.get(idWks));
  }

  const newWorkspace = new Workspace();

  const wks = {
    workspace: newWorkspace.toObj(),

    users: {
      bescudie: {
        name: `Bertrand ESCUDIE`
      }
    },

    busesInProgress: newWorkspace
      .getBusesInProgress()
      .reduce((acc, busInProgress) => Object.assign(acc, busInProgress.toObj()), {}),

    buses: newWorkspace
      .getBuses()
      .reduce((acc, bus) => Object.assign(acc, bus.toObj()), {}),

    containers: newWorkspace
      .getContainers()
      .reduce((acc, container) => Object.assign(acc, container.toObj()), {}),

    components: newWorkspace
      .getComponents()
      .reduce((acc, component) => Object.assign(acc, component.toObj()), {}),

    serviceUnits: newWorkspace
      .getServiceUnits()
      .reduce((acc, serviceUnit) => Object.assign(acc, serviceUnit.toObj()), {})
  };

  _memoizedWorkspaces.set(idWks, wks);

  return Object.assign({}, wks);
};

// ------------------------------------------

export function getDetailsBus(busId: string) {
  // right now a bus doesn't have more info
  return {};
}

const detailsContainers = new Map<string, any>();
let lastNumberIp = 0;

export function getDetailsContainer(containerId: string) {
  // if (typeof _currentWks === 'undefined') {
  //   return;
  // }



  // if (detailsContainers.has(containerId)) {
  //   return detailsContainers.get(containerId);
  // }

  const details = {
    ip: `192.168.0.${lastNumberIp}`,
    port: 7700 + lastNumberIp,
    // TODO : Instead of idCont0 put some containers that can
    // work with the current workspace
    reachabilities: [],
    systemInfo: 'Petals ESB µKernel 4.0.2 Petals Standalone Shared Memory 4.0.2 OpenJDK Runtime Environment 1.7.0_111-b01 Oracle Corporation Linux 3.16.0-4-amd64 amd64'
  };

  detailsContainers.set(containerId, details);

  // lastNumberIp++;

  return detailsContainers.get(containerId);
}

export function getDetailsComponents(componentId: string) {
  // TODO
  return {};
}

export function getDetailsServiceUnit(serviceUnitId: string) {
  // TODO
  return {};
}
