class ServiceUnits {
  private serviceUnits = new Map<string, ServiceUnit>();

  constructor() { }

  create(serviceUnitName?: string) {
    const serviceUnit = new ServiceUnit(serviceUnitName);
    this.serviceUnits.set(serviceUnit.getIdFormatted(), serviceUnit);
    return serviceUnit;
  }

  read(serviceUnit: string) {
    return this.serviceUnits.get(serviceUnit);
  }
}

export const serviceUnitsService = new ServiceUnits();

export class ServiceUnit {
  private static cpt = 0;
  protected id: number;
  private state = 'Started';
  private name: string;

  constructor(name?: string) {
    this.id = ServiceUnit.cpt++;
    this.name = name ? name : `SU ${this.id}`;
  }

  public getIdFormatted() {
    return `idSu${this.id}`;
  }

  toObj() {
    return {
      [this.getIdFormatted()]: {
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
