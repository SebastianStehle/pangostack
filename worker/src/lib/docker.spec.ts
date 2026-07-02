import { NodeSSH } from 'node-ssh';
import { describe, expect, it, vi } from 'vitest';
import { getContainers } from './docker';

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
