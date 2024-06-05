import axios, { type AxiosInstance } from 'axios';

type TUserPlanTiers = 'FAMILY' | 'ULTRA' | 'PREMIUM' | 'FREE';

export interface IBuildTemplateOptions {
  credentialsPath: string;
  certificateAuthorityPath: string;
  clientPrivateKeyPath: string;
  clientCertificatePath: string;

  serverIP: string;
  serverPort: number;

  platform: 'win' | 'linux';
}

export class Client {
  private readonly _identityApi: string;
  private readonly _authServerApi: string;
  private _token: string | null = null;
  private readonly _axiosAgent: AxiosInstance;

  public constructor() {
    this._identityApi = 'https://api.surfskip.com';
    this._authServerApi = 'https://vpnapi.surfskip.com';
    this._axiosAgent = axios.create({
      baseURL: this._authServerApi
    });
  }

  public login(username: string, password: string): Promise<void>;
  public login(token: string): Promise<void>;
  public async login(username: string, password?: string): Promise<void> {
    if (password) {
      const res = await this._axiosAgent('/users/login', {
        method: 'POST',
        baseURL: this._identityApi,
        data: {
          usernameOrEmail: username,
          password
        }
      });

      this._token = res.data.token;
    } else {
      await this._axiosAgent('/users/@me', {
        method: 'GET',
        headers: {
          Authorization: `Basic ${encodeURIComponent(username)}`
        }
      });

      this._token = username;
    }
  }

  public async listVPNServers(): Promise<{
    tier: TUserPlanTiers;
    servers: {
      ip: string;
      id: string;
      port: string;
      tier: TUserPlanTiers;
      location: {
        country: string;
        latitude: number;
        longitude: number;
      }
      protocols: { OpenVPN: { TCP: number } };
    }[];
  }> {
    const res = await this._axiosAgent('/vpn/servers', {
      method: 'GET',
      headers: {
        Authorization: `Basic ${encodeURIComponent(this._token!)}`
      }
    });

    return res.data;
  }

  public async getClientRequestName(): Promise<string> {
    const res = await this._axiosAgent('/vpn/sign/client/name', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${encodeURIComponent(this._token!)}`
      }
    });

    return res.data.name;
  }

  public async signClientRequest(request: string): Promise<string> {
    const res = await this._axiosAgent('/vpn/sign/client', {
      method: 'POST',
      data: {
        request
      },
      headers: {
        Authorization: `Basic ${encodeURIComponent(this._token!)}`
      }
    });

    return res.data.certificate;
  }

  public async buildTemplate(options: IBuildTemplateOptions): Promise<string> {
    const res = await this._axiosAgent(
      `/templates/vpn/open-vpn-client/${options.platform}.conf`
    );

    const built = res.data
      .replace('{{ip}}', options.serverIP)
      .replace('{{port}}', options.serverPort)
      .replace('{{credentials}}', options.credentialsPath)
      .replace('{{ca}}', options.certificateAuthorityPath)
      .replace('{{cert}}', options.clientCertificatePath)
      .replace('{{key}}', options.clientPrivateKeyPath);

    return built;
  }

  public async fetchCA(): Promise<string> {
    const res = await this._axiosAgent('/vpn/cert');

    return res.data.certificate;
  }

  public async generateSession(server: string): Promise<{
    username: string;
    password: string;
  }> {
    const res = await this._axiosAgent(`/vpn/session`, {
      method: 'POST',
      data: { server }
    });

    return {
      username: res.data.id,
      password: res.data.token
    };
  }
}