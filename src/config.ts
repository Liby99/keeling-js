export type ConfigType = {
  port?: number,
  name?: string,
  debug?: boolean,
  allowCrossOrigin?: boolean,
  redirect?: {
    [path: string]: string
  }
};

export const defaultConfig: ConfigType = {
  port: 8080,
  name: "keeling-js-default",
  debug: false,
  allowCrossOrigin: false,
  redirect: {}
};