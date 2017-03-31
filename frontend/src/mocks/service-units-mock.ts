class ServiceUnits {
  private serviceUnits = new Map<string, ServiceUnit>();

  constructor() { }

  create(name?: string) {
    const serviceUnit = new ServiceUnit(name);
    this.serviceUnits.set(serviceUnit.getId(), serviceUnit);
    return serviceUnit;
  }

  get(id: string) {
    return this.serviceUnits.get(id);
  }
}

export const serviceUnitsService = new ServiceUnits();

export class ServiceUnit {
  private static cpt = 0;
  private id: string;
  private state = 'Started';
  private name: string;

  constructor(name?: string) {
    const i = ServiceUnit.cpt++;
    this.id = `idSu${i}`;
    this.name = name ? name : `SU ${i}`;
  }

  public getId() {
    return this.id;
  }

  toObj() {
    return {
      [this.id]: {
        name: this.name
      }
    };
  }

  getDetails() {
    return {
      name: this.name,
      state: this.state
    };
  }

  setState(newState: string) {
    this.state = newState;
  }
}
