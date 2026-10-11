import { NodeSSH } from 'node-ssh';
import { describe, expect, it, vi } from 'vitest';
import { getContainers, parseImage, resolveComposeProject } from './docker';

function createSshMock(stdout: string): NodeSSH {
  return { execCommand: vi.fn().mockResolvedValue({ stdout }) } as unknown as NodeSSH;
}

const PROJECT = { name: 'deployment_1_app', path: '/pango/deployment_1_app' };

describe('getContainers', () => {
  it('should parse containers of the project and strip the project prefix when docker returns json lines', async () => {
    const stdout = [
      '{"Names":"deployment_1_app-web","State":"running","Status":"Up 5 minutes"}',
      '{"Names":"db","State":"restarting","Status":"Restarting"}',
      '',
      'not-json',
    ].join('\n');

    const ssh = createSshMock(stdout);
    const containers = await getContainers(ssh, PROJECT);

    expect(ssh.execCommand).toHaveBeenCalledWith('docker ps --filter label=com.docker.compose.project=deployment_1_app --format json');
    expect(containers).toEqual([
      { name: 'web', originalName: 'deployment_1_app-web', isReady: true, details: 'Up 5 minutes' },
      { name: 'db', originalName: 'db', isReady: false, details: 'Restarting' },
    ]);
  });
});

describe('resolveComposeProject', () => {
  it('should use a sanitized project per resource when the host has no compose file yet', async () => {
    const project = await resolveComposeProject(createSshMock(''), 'Install_deployment_1_my.app');

    expect(project).toEqual({ name: 'install_deployment_1_my-app', path: '/pango/install_deployment_1_my-app' });
  });

  it('should fall back to the legacy project when only the legacy compose file exists', async () => {
    const ssh = {
      execCommand: vi.fn((command: string) => Promise.resolve({ stdout: command.includes('/user/') ? 'exists' : '' })),
    } as unknown as NodeSSH;

    const project = await resolveComposeProject(ssh, 'deployment_1_app');

    expect(project).toEqual({ name: 'user', path: '/user' });
  });
});

describe('parseImage', () => {
  it('should parse a repository and tag when there is no registry', () => {
    expect(parseImage('squidex/squidex:7')).toEqual({ image: 'squidex/squidex:7', repository: 'squidex/squidex', tag: '7' });
  });

  it('should default the tag to latest when the reference is untagged', () => {
    expect(parseImage('squidex/caddy-proxy')).toEqual({
      image: 'squidex/caddy-proxy',
      repository: 'squidex/caddy-proxy',
      tag: 'latest',
    });
  });

  it('should split off a registry host when the first segment looks like one', () => {
    expect(parseImage('docker.io/squidex/squidex:7')).toEqual({
      image: 'docker.io/squidex/squidex:7',
      registry: 'docker.io',
      repository: 'squidex/squidex',
      tag: '7',
    });
  });

  it('should not treat a registry port colon as a tag', () => {
    expect(parseImage('registry:5000/img')).toEqual({
      image: 'registry:5000/img',
      registry: 'registry:5000',
      repository: 'img',
      tag: 'latest',
    });
  });
});
