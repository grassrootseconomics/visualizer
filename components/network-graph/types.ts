import { Links, Nodes } from "@utils/render_graph";

export namespace Types {
  export type DataObject = {
    nodes: Nodes;
    links: Links;
  };
  export type CameraPosition = {
    cameraPosition: (
      arg0: { x: number; y: number; z: number },
      arg1: object,
      arg2: number
    ) => void;
  };
}
