class ServiceUnits {
  private _serviceUnits = new Map<string, ServiceUnit>();

  constructor() { }

  create() {
    const serviceUnit = new ServiceUnit();
    this._serviceUnits.set(serviceUnit.getIdFormatted(), serviceUnit);
    return serviceUnit;
  }

  read(serviceUnit: string) {
    return this._serviceUnits.get(serviceUnit);
  }
}

export const serviceUnitsService = new ServiceUnits();

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

  getDetails() {
    return {
      state: 'Started'
    };
  }
}
