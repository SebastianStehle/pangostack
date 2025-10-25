import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UrlsConfig } from '../config';

@Injectable()
export class UrlService {
  private readonly baseUrl: string;
  private readonly uiUrl: string;

  constructor(configService: ConfigService) {
    const config = configService.get<UrlsConfig>('urls');

    this.baseUrl = config?.baseUrl || 'https://localhost:3000';
    this.baseUrl = this.baseUrl.replace(/[\s/]+$/, '');

    this.uiUrl = config?.uiUrl || this.baseUrl;
    this.uiUrl = this.uiUrl.replace(/[\s/]+$/, '');
  }

  isValidRedirectUrl(url: string) {
    return url.startsWith(this.baseUrl);
  }

  confirmUrl(deploymentId: number, token: string, redirectUrl?: string | null) {
    return this.buildUrl(`/api/deployments/${deploymentId}/confirm`, { token, redirectUrl });
  }

  cancelUrl(deploymentId: number, token: string, redirectUrl?: string | null) {
    return this.buildUrl(`/api/deployments/${deploymentId}/cancel`, { token, redirectUrl });
  }

  deploymentUrl(teamId: number, deploymentId: number) {
    return this.buildUIUrl(`/teams/${teamId}/deployments/${deploymentId}`);
  }

  buildUrl(path: string, params?: Record<string, string | null | undefined>): string {
    return this.buildUrlCore(this.baseUrl, path, params);
  }

  buildUIUrl(path: string, params?: Record<string, string | null | undefined>): string {
    return this.buildUrlCore(this.uiUrl, path, params);
  }

  private buildUrlCore(base: string, path: string, params?: Record<string, string | null | undefined>): string {
    const trimmed = path.replace(/^[\s/]+/, '');

    const url = new URL(base);
    if (trimmed) {
      url.pathname = `/${trimmed}`;
    }

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return url.toString();
  }
}
