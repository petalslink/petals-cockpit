class ServiceUnits {
  private serviceUnits = new Map<string, ServiceUnit>();

  constructor() { }

  create() {
    const serviceUnit = new ServiceUnit();
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

  constructor() {
    this.id = ServiceUnit.cpt++;
  }

  public getIdFormatted() {
    return `idSu${this.id}`;
  }

  toObj() {
    return {
      [this.getIdFormatted()]: {
        name: `SU ${this.id}`
      }
    };
  }

  getDetails() {
    return {
      state: 'Started'
    };
  }
}
