export class ConfigService {
  private readonly envConfig: { [key: string]: any } = null;

  constructor() {
    this.envConfig = {};
    this.envConfig.port = process.env.SIMULATOR_PORT;
    this.envConfig.host = process.env.SIMULATOR_HOST;
  }

  get(key: string): any {
    return this.envConfig[key];
  }
}
