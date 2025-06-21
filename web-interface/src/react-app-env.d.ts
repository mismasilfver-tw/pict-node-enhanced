/// <reference types="react-scripts" />

declare module "react-json-view" {
  import * as React from "react";

  interface ReactJsonViewProps {
    src: object;
    name?: string | false;
    theme?: string;
    style?: object;
    iconStyle?: "circle" | "triangle" | "square";
    indentWidth?: number;
    collapsed?: boolean | number;
    collapseStringsAfterLength?: number;
    shouldCollapse?: (field: any) => boolean;
    sortKeys?: boolean;
    quotesOnKeys?: boolean;
    displayDataTypes?: boolean;
    displayObjectSize?: boolean;
    enableClipboard?: boolean;
    onEdit?: (edit: any) => boolean;
    onAdd?: (add: any) => boolean;
    onDelete?: (deleteObj: any) => boolean;
    onSelect?: (select: any) => void;
    validationMessage?: string;
    displayArrayKey?: boolean;
  }

  class ReactJson extends React.Component<ReactJsonViewProps> {}

  export default ReactJson;
}

declare namespace React {
  interface FC<P = {}> {
    (props: P, context?: any): React.ReactElement<any, any> | null;
    displayName?: string;
  }

  interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
    target: EventTarget & T;
  }
}
