export namespace Types {
  export type Node = {
    id: string;
  };
  export type Link = {
    source: string;
    target: string;
    value: string;
  };
  export type DataObject = {
    nodes: Node[];
    links: Link[];
  };
  export type CameraPosition = {
    cameraPosition: (
      arg0: { x: number; y: number; z: number },
      arg1: object,
      arg2: number
    ) => void;
  };
}
