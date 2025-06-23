declare module "react";
declare module "react-dom";
declare module "axios";
declare module "react-bootstrap";
declare module "react-toastify";
declare module "react-json-view-lite" {
  import { FC } from "react";

  interface JsonViewProps {
    data: any;
    style?: object;
    shouldInitiallyExpand?: (
      level: number,
      value: any,
      field: string,
    ) => boolean;
  }

  export const JsonView: FC<JsonViewProps>;
}
