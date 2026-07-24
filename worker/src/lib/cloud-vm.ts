import { randomBytes } from 'crypto';
import { NodeSSH } from 'node-ssh';

// The generated password only needs to survive until the deployment sets up its own access, but it
// must satisfy the complexity rules of all cloud providers (upper, lower, digit, symbol).
export function generatePassword(): string {
  const raw = randomBytes(24)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '');

  return `Aa1!${raw}`;
}

// Cloud VMs default to key-based SSH, but the downstream docker-compose-ssh resource connects with a
// password. This cloud-config enables password authentication and sets the password for the user, so
// the same connection contract (host, sshUser, sshPassword) works across every provider.
export function buildPasswordCloudInit(user: string, password: string): string {
  return ['#cloud-config', 'ssh_pwauth: true', 'chpasswd:', '  expire: false', '  list: |', `    ${user}:${password}`].join('\n');
}

// Collects the same CPU, memory and disk metrics for any Linux VM over SSH, independent of the cloud
// provider that created it.
export async function collectVmMetrics(ssh: NodeSSH) {
  const [memInfo, cpuInfo, diskInfo] = await Promise.all([
    ssh.execCommand('cat /proc/meminfo'),
    ssh.execCommand(CPU_SAMPLE_COMMAND),
    ssh.execCommand('df -kP /'),
  ]);

  return {
    memory: parseMemInfo(memInfo.stdout),
    cpu: parseCpuUsage(cpuInfo.stdout),
    disk: parseDiskInfo(diskInfo.stdout),
  };
}

function kbToGb(kb: number) {
  return Math.round((kb / (1024 * 1024)) * 100) / 100;
}

function parseMemInfo(stdout: string): Record<string, number> {
  const values: Record<string, number> = {};
  for (const line of stdout.split('\n')) {
    const match = /^(\w+):\s+(\d+)/.exec(line);
    if (match) {
      values[match[1]] = parseInt(match[2], 10);
    }
  }

  const total = values['MemTotal'] || 0;

  // MemAvailable is a better estimate for actual usage than MemFree, because it includes reclaimable caches.
  const available = values['MemAvailable'] ?? values['MemFree'] ?? 0;

  return { used: kbToGb(total - available), total: kbToGb(total) };
}

// The CPU usage is calculated from the difference of two samples of the total and idle times.
const CPU_SAMPLE_COMMAND = 'head -1 /proc/stat; sleep 1; head -1 /proc/stat';

function parseCpuUsage(stdout: string): Record<string, number> {
  const samples = stdout
    .trim()
    .split('\n')
    .filter((x) => x.startsWith('cpu'))
    .map((line) => {
      const fields = line.trim().split(/\s+/).slice(1).map(Number);

      // The fourth and fifth fields are the idle and iowait times.
      const idle = (fields[3] || 0) + (fields[4] || 0);
      const total = fields.reduce((a, c) => a + (c || 0), 0);

      return { idle, total };
    });

  if (samples.length < 2) {
    return { usage: 0 };
  }

  const idleDelta = samples[1].idle - samples[0].idle;
  const totalDelta = samples[1].total - samples[0].total;
  if (totalDelta <= 0) {
    return { usage: 0 };
  }

  return { usage: Math.round((1 - idleDelta / totalDelta) * 10000) / 100 };
}

function parseDiskInfo(stdout: string): Record<string, number> {
  const lines = stdout.trim().split('\n');
  if (lines.length < 2) {
    return { used: 0, total: 0 };
  }

  const [, total, used] = lines[1].trim().split(/\s+/);

  return { used: kbToGb(parseInt(used, 10) || 0), total: kbToGb(parseInt(total, 10) || 0) };
}
