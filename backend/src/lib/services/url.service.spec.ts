import { ConfigService } from '@nestjs/config';
import { beforeAll, describe, expect, it } from 'vitest';
import { UrlService } from './url.service';

function createService(urls: { baseUrl?: string; baseUI?: string }) {
  return new UrlService({ get: () => urls } as unknown as ConfigService);
}

describe('UrlService', () => {
  let service: UrlService;

  beforeAll(() => {
    service = createService({ baseUrl: 'https://app.example.com', baseUI: 'https://ui.example.com' });
  });

  describe('isValidRedirectUrl', () => {
    it('should accept URLs on the configured origin', () => {
      expect(service.isValidRedirectUrl('https://app.example.com/back')).toBe(true);
      expect(service.isValidRedirectUrl('/teams/1')).toBe(true);
    });

    it('should reject other origins and look-alike hosts', () => {
      expect(service.isValidRedirectUrl('https://evil.com')).toBe(false);
      expect(service.isValidRedirectUrl('https://app.example.com.evil.com')).toBe(false);
    });
  });

  describe('confirmUrl', () => {
    it('should build the URL and omit a null redirect', () => {
      expect(service.confirmUrl(5, 'tok', null)).toBe('https://app.example.com/api/deployments/5/confirm?token=tok');
    });

    it('should append the redirect when it is given', () => {
      expect(service.confirmUrl(5, 'tok', 'https://app.example.com/back')).toBe(
        'https://app.example.com/api/deployments/5/confirm?token=tok&redirectUrl=https%3A%2F%2Fapp.example.com%2Fback',
      );
    });
  });

  describe('cancelUrl', () => {
    it('should build the URL and omit a null redirect', () => {
      expect(service.cancelUrl(5, 'tok', null)).toBe('https://app.example.com/api/deployments/5/cancel?token=tok');
    });

    it('should append the redirect when it is given', () => {
      expect(service.cancelUrl(5, 'tok', 'https://app.example.com/back')).toBe(
        'https://app.example.com/api/deployments/5/cancel?token=tok&redirectUrl=https%3A%2F%2Fapp.example.com%2Fback',
      );
    });
  });

  describe('deploymentUrl', () => {
    it('should build a deployment URL on the UI origin', () => {
      expect(service.deploymentUrl(1, 2)).toBe('https://ui.example.com/teams/1/deployments/2');
    });
  });

  describe('buildUrl', () => {
    it('should build the URL regardless of a leading slash', () => {
      expect(service.buildUrl('/path')).toBe('https://app.example.com/path');
      expect(service.buildUrl('path')).toBe('https://app.example.com/path');
    });

    it('should append params and omit null values', () => {
      expect(service.buildUrl('/foo', { a: '1', b: null })).toBe('https://app.example.com/foo?a=1');
    });

    it('should keep the root path when no path is given', () => {
      expect(service.buildUrl('')).toBe('https://app.example.com/');
    });
  });

  describe('buildUIUrl', () => {
    it('should build the URL regardless of a leading slash', () => {
      expect(service.buildUIUrl('/path')).toBe('https://ui.example.com/path');
      expect(service.buildUIUrl('path')).toBe('https://ui.example.com/path');
    });

    it('should append params and omit null values', () => {
      expect(service.buildUIUrl('/foo', { a: '1', b: null })).toBe('https://ui.example.com/foo?a=1');
    });

    it('should keep the root path when no path is given', () => {
      expect(service.buildUIUrl('')).toBe('https://ui.example.com/');
    });
  });

  describe('configuration', () => {
    it('should trim trailing slashes and fall back to the base URL for the UI', () => {
      const fallback = createService({ baseUrl: 'https://app.example.com/' });

      expect(fallback.buildUIUrl('/foo')).toBe('https://app.example.com/foo');
    });
  });
});
