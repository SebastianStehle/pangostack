import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { execa } from 'execa';
import { v4 as uuidv4 } from 'uuid';
import { parseEnvironment } from 'src/lib';
import {
  defineResource,
  LabeledValue,
  ParametersOrContextValue,
  Resource,
  ResourceReporter,
  ResourceRequest,
  ResourceStatusResult,
} from '../interface';

type Parameters = { config: string; variables?: string; environment?: string };

type ResourceContext = { state: string };

const STATE_FILE = 'terraform.tfstate';
const VARIABLES_FILE = 'terraform.tfvars.json';

@Injectable()
export class TerraformResource implements Resource {
  descriptor = defineResource<Parameters, any>({
    name: 'terraform',
    description: 'Applies a Terraform configuration. The state is stored with the deployment.',
    parameters: {
      config: {
        description: 'The Terraform configuration as HCL or JSON.',
        type: 'string',
        required: true,
      },
      variables: {
        description: 'The optional input variables as a JSON object.',
        type: 'string',
        required: false,
      },
      environment: {
        description: 'The additional environment variables, for example provider credentials.',
        type: 'string',
        required: false,
      },
    },
    context: {},
  });

  async apply(_: string, request: ResourceRequest<Parameters, ResourceContext>, reporter: ResourceReporter): Promise<void> {
    const { config, variables, environment } = request.parameters;

    const workspace = await this.createWorkspace(config, variables, request.resourceContext.state);
    const env = { ...process.env, ...parseEnvironment(environment) };

    try {
      reporter.beginStep('Initializing Terraform');
      await this.run(workspace.dir, env, ['init', '-input=false', '-no-color'], reporter);

      try {
        reporter.beginStep('Applying configuration');
        await this.run(workspace.dir, env, ['apply', '-auto-approve', '-input=false', '-no-color'], reporter);
      } finally {
        // Persist the (possibly partial) state even when apply fails, so a retry continues from it
        // instead of leaving orphaned infrastructure that Terraform no longer tracks.
        await this.persistState(workspace.dir, reporter);
      }

      reporter.beginStep('Reading outputs');
      const { stdout } = await execa('terraform', ['output', '-json', '-no-color'], { cwd: workspace.dir, env });
      publishOutputs(stdout, reporter);
    } finally {
      await workspace.cleanup();
    }
  }

  async delete(_: string, request: ResourceRequest<Parameters, ResourceContext>) {
    const { config, variables, environment } = request.parameters;

    // Without state there is nothing to destroy.
    if (!request.resourceContext.state) {
      return;
    }

    const workspace = await this.createWorkspace(config, variables, request.resourceContext.state);
    const env = { ...process.env, ...parseEnvironment(environment) };

    try {
      await execa('terraform', ['init', '-input=false', '-no-color'], { cwd: workspace.dir, env });
      await execa('terraform', ['destroy', '-auto-approve', '-input=false', '-no-color'], { cwd: workspace.dir, env });
    } finally {
      await workspace.cleanup();
    }
  }

  async status(_: string, request: ResourceRequest<Parameters, ResourceContext>): Promise<ResourceStatusResult> {
    const state = request.resourceContext.state;

    const nodes = parseStateResources(state);
    if (nodes.length === 0) {
      return {
        workloads: [
          {
            name: 'Terraform',
            nodes: [{ name: 'State', isReady: false, message: 'Configuration has not been applied yet' }],
          },
        ],
      };
    }

    return {
      workloads: [
        {
          name: 'Terraform',
          nodes,
        },
      ],
    };
  }

  private async run(cwd: string, env: NodeJS.ProcessEnv, args: string[], reporter: ResourceReporter) {
    const { stdout, stderr } = await execa('terraform', args, { cwd, env });

    reporter.report([stdout, stderr].filter(Boolean).join('\n'), { log: true });
  }

  private async createWorkspace(config: string, variables: string | undefined, state: string | undefined) {
    const dir = path.join(os.tmpdir(), `terraform-${uuidv4()}`);
    await fs.mkdir(dir, { recursive: true });

    // JSON configurations must use the .tf.json extension, HCL uses .tf.
    const configFile = isJson(config) ? 'main.tf.json' : 'main.tf';
    await fs.writeFile(path.join(dir, configFile), config, { encoding: 'utf8' });

    if (variables) {
      await fs.writeFile(path.join(dir, VARIABLES_FILE), variables, { encoding: 'utf8' });
    }

    if (state) {
      await fs.writeFile(path.join(dir, STATE_FILE), Buffer.from(state, 'base64'));
    }

    const cleanup = async () => {
      await fs.rm(dir, { recursive: true, force: true });
    };

    return { dir, cleanup };
  }

  private async persistState(dir: string, reporter: ResourceReporter) {
    try {
      const state = await fs.readFile(path.join(dir, STATE_FILE));
      reporter.appendResourceContext({ state: state.toString('base64') });
    } catch {
      // No state file exists when init or the provider setup failed before any resource was created.
    }
  }
}

function publishOutputs(outputJson: string, reporter: ResourceReporter) {
  const outputs = JSON.parse(outputJson) as Record<string, { value: unknown; sensitive?: boolean }>;

  const context: Record<string, ParametersOrContextValue> = {};
  const connection: Record<string, LabeledValue> = {};

  for (const [key, output] of Object.entries(outputs)) {
    const value = typeof output.value === 'string' ? output.value : JSON.stringify(output.value);

    context[key] = value;
    connection[key] = { value, label: key, isPublic: !output.sensitive };
  }

  if (Object.keys(context).length > 0) {
    reporter.appendContext(context);
    reporter.appendConnection(connection);
  }
}

function parseStateResources(state: string | undefined) {
  if (!state) {
    return [];
  }

  try {
    const parsed = JSON.parse(Buffer.from(state, 'base64').toString('utf8')) as {
      resources?: { mode: string; type: string; name: string; instances?: unknown[] }[];
    };

    const nodes = [];
    for (const resource of parsed.resources ?? []) {
      // Data sources are reads, not created infrastructure, so they are not reported as nodes.
      if (resource.mode !== 'managed') {
        continue;
      }

      nodes.push({ name: `${resource.type}.${resource.name}`, isReady: (resource.instances?.length ?? 0) > 0 });
    }

    return nodes;
  } catch {
    return [];
  }
}

function isJson(value: string): boolean {
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === 'object' && parsed !== null;
  } catch {
    return false;
  }
}
