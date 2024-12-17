// frontend/src/shared/api/services/projectService.ts
import { apiClient } from '../apiClient';
import { Project } from '../types/customer.types';

interface ProjectResponse {
  projects: Project[];
}

export const projectService = {
  // Obtener proyectos de un cliente
  getCustomerProjects: async (customerId: number): Promise<Project[]> => {
    const response = await apiClient.get<ProjectResponse>(`/customers/${customerId}/projects`);
    return response.projects;
  },

  // Añadir un proyecto a un cliente
  addProject: async (customerId: number, project: Omit<Project, 'id'>): Promise<Project> => {
    return apiClient.post<Project>(`/customers/${customerId}/projects`, project);
  },

  // Actualizar un proyecto
  updateProject: async (customerId: number, projectId: number, project: Partial<Project>): Promise<Project> => {
    return apiClient.put<Project>(`/customers/${customerId}/projects/${projectId}`, project);
  },

  // Eliminar un proyecto
  deleteProject: async (customerId: number, projectId: number): Promise<void> => {
    return apiClient.delete(`/customers/${customerId}/projects/${projectId}`);
  },

  // Actualizar el proyecto predeterminado
  updateDefaultProject: async (customerId: number, projectId: number): Promise<Project> => {
    return apiClient.put<Project>(`/customers/${customerId}/projects/${projectId}/default`, {});
  }
};