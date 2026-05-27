declare module "react-simple-maps" {
  import { ComponentType } from "react";

  type MapComponentProps = Record<string, unknown>;

  export const ComposableMap: ComponentType<MapComponentProps>;
  export const Geographies: ComponentType<MapComponentProps>;
  export const Geography: ComponentType<MapComponentProps>;
  export const Marker: ComponentType<MapComponentProps>;
  export const ZoomableGroup: ComponentType<MapComponentProps>;
  export const Sphere: ComponentType<MapComponentProps>;
  export const Graticule: ComponentType<MapComponentProps>;
  export const Line: ComponentType<MapComponentProps>;
}
