import { NodeSSH } from 'node-ssh';
import { describe, expect, it, vi } from 'vitest';
import { getContainers, parseImage } from './docker';

function createSshMock(stdout: string): NodeSSH {
  return { execCommand: vi.fn().mockResolvedValue({ stdout }) } as unknown as NodeSSH;
}

describe('getContainers', () => {
  it('should parse containers and strip the user prefix when docker returns json lines', async () => {
    const stdout = [
      '{"Names":"user-web","State":"running","Status":"Up 5 minutes"}',
      '{"Names":"db","State":"restarting","Status":"Restarting"}',
      '',
      'not-json',
    ].join('\n');

    const containers = await getContainers(createSshMock(stdout));

    expect(containers).toEqual([
      { name: 'web', originalName: 'user-web', isReady: true, details: 'Up 5 minutes' },
      { name: 'db', originalName: 'db', isReady: false, details: 'Restarting' },
    ]);
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
