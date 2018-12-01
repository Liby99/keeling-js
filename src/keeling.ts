import { ConfigType } from './config';

type Option = {
  config?: ConfigType,
  configPath?: string,
};

const Keeling = (options: Option) => {
  const { config, configPath } = options;
  if (config) {

  } else if (configPath) {

  } else {
    throw new Error('');
  }
};

export default Keeling;