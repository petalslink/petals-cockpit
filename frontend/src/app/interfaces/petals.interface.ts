export interface IServiceUnit {
  name: string;
}

export interface IComponent {
  name: string;
  serviceUnits?: Array<IServiceUnit>;
}

export interface IContainer {
  name: string;
  components?: Array<IComponent>;
}

export interface IBus {
  name: string;
  containers?: Array<IContainer>;
}
