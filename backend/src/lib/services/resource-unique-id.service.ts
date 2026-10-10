import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InstallConfig } from '../config';

export interface ParsedResourceUniqueId {
  deploymentId: number;
  resourceId: string;
}

// Every resource that Pangostack provisions is named after the deployment it belongs to. The prefix
// is what makes a resource recognizable as ours when a cloud account is enumerated again, therefore
// the builder and the parser live next to each other and must never drift apart.
@Injectable()
export class ResourceUniqueIdService {
  private readonly prefix: string;

  constructor(configService: ConfigService) {
    const installId = configService.get<InstallConfig>('install')?.installId;

    // Installations without an ID keep the original scheme, so that their live resources are not renamed.
    this.prefix = installId ? `${installId}_deployment_` : 'deployment_';
  }

  build(deploymentId: number, resourceId: string) {
    return `${this.prefix}${deploymentId}_${resourceId}`;
  }

  // Returns null for anything that was not created by this installation, so that foreign resources in
  // the same cloud account are never mistaken for one of our own.
  parse(resourceUniqueId: string): ParsedResourceUniqueId | null {
    if (!resourceUniqueId.startsWith(this.prefix)) {
      return null;
    }

    const remainder = resourceUniqueId.slice(this.prefix.length);
    const separator = remainder.indexOf('_');
    if (separator <= 0) {
      return null;
    }

    const deploymentId = Number(remainder.slice(0, separator));
    const resourceId = remainder.slice(separator + 1);

    if (!Number.isInteger(deploymentId) || deploymentId <= 0 || !resourceId) {
      return null;
    }

    return { deploymentId, resourceId };
  }
}
