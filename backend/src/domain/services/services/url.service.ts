import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UrlService {
  private readonly baseUrl: string;

  constructor(configService: ConfigService) {
    let baseUrl = configService.get('baseUrl');
    if (!baseUrl) {
      baseUrl = 'https://localhost:3000';
    }

    this.baseUrl = baseUrl;
  }

  isValidRedirectUrl(url: string) {
    return url.startsWith(this.baseUrl);
  }

  confirmUrl(deploymentId: number, token: string, redirectUr?: string | null) {
    const url = new URL(this.baseUrl);

    url.pathname = `/api/deployments/${deploymentId}/confirm`;

    url.searchParams.set('token', token);
    if (redirectUr) {
      url.searchParams.set('redirectUr', redirectUr);
    }

    return url.toString();
  }

  cancelUrl(deploymentId: number, token: string, redirectUr?: string | null) {
    const url = new URL(this.baseUrl);

    url.pathname = `/api/deployments/${deploymentId}/cancel`;

    url.searchParams.set('token', token);
    if (redirectUr) {
      url.searchParams.set('redirectUr', redirectUr);
    }

    return url.toString();
  }
}
