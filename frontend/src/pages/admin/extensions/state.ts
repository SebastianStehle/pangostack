import { create } from 'zustand';
import { DeploymentDto, ExtensionDto, ExtensionSpecDto } from 'src/api';

export type ExtensionWithSpec = { extension: ExtensionDto; spec: ExtensionSpecDto };

interface ExtensionsState {
  // All available extensions.
  specs: ExtensionSpecDto[];

  // The extensions.
  extensions: ExtensionWithSpec[];

  // Adds or sets an extension.
  setExtension: (extension: ExtensionDto) => void;

  // Sets all extensions.
  setExtensions: (source: ExtensionDto[], specs: ExtensionSpecDto[]) => void;

  // Remove an extension.
  removeExtension: (id: number) => void;
}

interface DeploymentsState {
  // The deployments.
  deployments: DeploymentDto[];

  // Adds or sets an deployment.
  setDeployment: (deployment: DeploymentDto) => void;

  // Sets all deployments.
  setDeployments: (deployment: DeploymentDto[]) => void;

  // Remove an deployment.
  removeDeployment: (id: number) => void;
}

export const useExtensionsStore = create<ExtensionsState>()((set) => ({
  specs: [],
  extensions: [],
  setExtension: (extension: ExtensionDto) => {
    return set((state) => {
      const spec = state.specs.find((x) => x.name === extension.name);

      if (!spec) {
        return {};
      }

      const extensions = [...state.extensions];

      const indexOfExisting = extensions.findIndex((x) => x.extension.id === extension.id);
      if (indexOfExisting >= 0) {
        extensions[indexOfExisting] = { extension, spec };
      } else {
        extensions.push({ extension, spec });
      }

      return { extensions };
    });
  },
  setExtensions: (source: ExtensionDto[], specs: ExtensionSpecDto[]) => {
    const extensions: ExtensionWithSpec[] = [];

    for (const extension of source) {
      const spec = specs.find((x) => x.name === extension.name);

      if (spec) {
        extensions.push({ extension, spec });
      }
    }

    return set({ extensions, specs });
  },
  removeExtension: (id: number) => {
    return set((state) => ({ extensions: state.extensions.filter((x) => x.extension.id !== id) }));
  },
}));

export const useDeploymentstore = create<DeploymentsState>()((set) => ({
  deployments: [],
  setDeployment: (deployment: DeploymentDto) => {
    return set((state) => {
      const deployments = [...state.deployments];

      const indexOfExisting = state.deployments.findIndex((x) => x.id === deployment.id);
      if (indexOfExisting >= 0) {
        deployments[indexOfExisting] = deployment;
      } else {
        deployments.push(deployment);
      }

      return { deployments };
    });
  },
  setDeployments: (deployments: DeploymentDto[]) => {
    return set({ deployments });
  },
  removeDeployment: (id: number) => {
    return set((state) => ({ deployments: state.deployments.filter((x) => x.id !== id) }));
  },
}));
