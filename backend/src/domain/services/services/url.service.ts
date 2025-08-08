import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UrlService {
  private readonly baseUrl: string;

  constructor(configService: ConfigService) {
    let baseUrl = configService.get('baseUrl');
    if (!baseUrl) {
      baseUrl = 'https://localhost';
    }

    this.baseUrl = baseUrl;
  }

  isValidRedirectUrl(url: string) {
    return url.startsWith(this.baseUrl);
  }

  confirmUrl(teamId: number, deploymentId: number, token: string, redirectUr?: string | null) {
    const url = new URL(this.baseUrl);

    url.pathname = `/teams/${teamId}/deployments/${deploymentId}/confirm`;

    url.searchParams.set('token', token);
    if (redirectUr) {
      url.searchParams.set('redirectUr', redirectUr);
    }

    return url.toString();
  }

  cancelUrl(teamId: number, deploymentId: number, token: string, redirectUr?: string | null) {
    const url = new URL(this.baseUrl);

    url.pathname = `/teams/${teamId}/deployments/${deploymentId}/cancel`;

    url.searchParams.set('token', token);
    if (redirectUr) {
      url.searchParams.set('redirectUr', redirectUr);
    }

    return url.toString();
  }
}
