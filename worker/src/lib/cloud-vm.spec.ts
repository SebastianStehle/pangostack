import { NodeSSH } from 'node-ssh';
import { describe, expect, it, vi } from 'vitest';
import { buildPasswordCloudInit, collectVmMetrics, generatePassword } from './cloud-vm';

function fakeSsh(outputs: Record<string, string>) {
  return {
    execCommand: vi.fn((command: string) => {
      const match = Object.entries(outputs).find(([part]) => command.includes(part));
      return Promise.resolve({ stdout: match ? match[1] : '' });
    }),
  } as unknown as NodeSSH;
}

describe('cloud-vm', () => {
  describe('generatePassword', () => {
    it('should generate a password that satisfies the common complexity rules', () => {
      const password = generatePassword();

      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[0-9]/);
      expect(password).toMatch(/[^a-zA-Z0-9]/);
      expect(password.length).toBeGreaterThanOrEqual(12);
    });

    it('should generate a different password on each call', () => {
      expect(generatePassword()).not.toEqual(generatePassword());
    });
  });

  describe('buildPasswordCloudInit', () => {
    it('should enable password authentication and set the password for the user', () => {
      const config = buildPasswordCloudInit('deploy', 'secret');

      expect(config.startsWith('#cloud-config')).toBe(true);
      expect(config).toContain('ssh_pwauth: true');
      expect(config).toContain('deploy:secret');
    });
  });

  describe('collectVmMetrics', () => {
    it('should convert the system stats into memory, cpu and disk metrics', async () => {
      const ssh = fakeSsh({
        meminfo: 'MemTotal:        2097152 kB\nMemAvailable:    1048576 kB',
        '/proc/stat': 'cpu  100 0 100 800 0 0 0 0 0 0\ncpu  200 0 200 1400 0 0 0 0 0 0',
        'df -kP': 'Filesystem 1024-blocks Used Available Capacity Mounted on\n/dev/vda1 10485760 5242880 5242880 50% /',
      });

      const metrics = await collectVmMetrics(ssh);

      expect(metrics).toEqual({
        memory: { used: 1, total: 2 },
        cpu: { usage: 25 },
        disk: { used: 5, total: 10 },
      });
    });

    it('should report zero metrics when the command outputs are empty', async () => {
      const metrics = await collectVmMetrics(fakeSsh({}));

      expect(metrics).toEqual({
        memory: { used: 0, total: 0 },
        cpu: { usage: 0 },
        disk: { used: 0, total: 0 },
      });
    });
  });
});
