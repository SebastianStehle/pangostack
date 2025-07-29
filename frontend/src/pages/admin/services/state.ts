import { create } from 'zustand';
import { ServiceDto } from 'src/api';

interface ServicesState {
  // The services.
  services: ServiceDto[];

  // Adds or sets an service.
  setService: (service: ServiceDto) => void;

  // Remove an service.
  removeService: (id: number) => void;

  // Sets all services.
  setServices: (services: ServiceDto[]) => void;
}

export const useServicesStore = create<ServicesState>()((set) => ({
  services: [],
  setService: (service: ServiceDto) => {
    return set((state) => {
      const services = [...state.services];

      const indexOfExisting = services.findIndex((x) => x.id === service.id);

      if (indexOfExisting >= 0) {
        services[indexOfExisting] = service;
      } else {
        services.push(service);
      }

      return { services };
    });
  },
  setServices: (services: ServiceDto[]) => {
    return set({ services });
  },
  removeService: (id: number) => {
    return set((state) => ({ services: state.services.filter((x) => x.id !== id) }));
  },
}));
