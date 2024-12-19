// frontend/src/shared/api/services/projectService.ts
import { apiClient } from '../apiClient';
import { Project } from '../types/customer.types';

class ProjectService {
  private readonly getBasePath = (customerId: number) => 
    `/customers/${customerId}/projects`;

  /**
   * Get all projects for a customer
   */
  public async getCustomerProjects(customerId: number): Promise<Project[]> {
    try {
      const response = await apiClient.get<{ projects: Project[] }>(
        this.getBasePath(customerId)
      );
      return this.transformProjects(response.projects);
    } catch (error) {
      throw this.handleError(error, 'Error fetching customer projects');
    }
  }

  /**
   * Add a project to a customer
   */
  public async addProject(
    customerId: number, 
    project: Omit<Project, 'id'>
  ): Promise<Project> {
    try {
      this.validateProject(project);
      const response = await apiClient.post<Project>(
        this.getBasePath(customerId),
        project
      );
      return this.transformProject(response);
    } catch (error) {
      throw this.handleError(error, 'Error adding project');
    }
  }

  /**
   * Update a project
   */
  public async updateProject(
    customerId: number,
    projectId: number,
    project: Partial<Project>
  ): Promise<Project> {
    try {
      const response = await apiClient.put<Project>(
        `${this.getBasePath(customerId)}/${projectId}`,
        project
      );
      return this.transformProject(response);
    } catch (error) {
      throw this.handleError(error, 'Error updating project');
    }
  }

  /**
   * Delete a project
   */
  public async deleteProject(customerId: number, projectId: number): Promise<void> {
    try {
      await apiClient.delete(
        `${this.getBasePath(customerId)}/${projectId}`
      );
    } catch (error) {
      throw this.handleError(error, 'Error deleting project');
    }
  }

  /**
   * Set project as default
   */
  public async updateDefaultProject(
    customerId: number,
    projectId: number
  ): Promise<Project> {
    try {
      const response = await apiClient.put<Project>(
        `${this.getBasePath(customerId)}/${projectId}/default`,
        {}
      );
      return this.transformProject(response);
    } catch (error) {
      throw this.handleError(error, 'Error setting default project');
    }
  }

  /**
   * Transform a single project
   */
  private transformProject(project: Project): Project {
    return {
      id: project.id,
      lookupCode: project.lookupCode,
      name: project.name,
      description: project.description || '',
      isDefault: Boolean(project.isDefault)
    };
  }

  /**
   * Transform multiple projects
   */
  private transformProjects(projects: Project[]): Project[] {
    return projects.map(project => this.transformProject(project));
  }

  /**
   * Validate project data
   */
  private validateProject(project: Omit<Project, 'id'>): void {
    if (!project.lookupCode) {
      throw new Error('Project code is required');
    }
    if (!project.name) {
      throw new Error('Project name is required');
    }
    if (project.lookupCode.length > 20) {
      throw new Error('Project code must be 20 characters or less');
    }
    if (project.name.length > 100) {
      throw new Error('Project name must be 100 characters or less');
    }
  }

  /**
   * Standardized error handling with context
   */
  private handleError(error: unknown, context: string): Error {
    console.error(`${context}:`, error);

    if (error instanceof Error) {
      error.message = `${context}: ${error.message}`;
      return error;
    }

    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as any;
      if (axiosError.response?.status === 404) {
        return new Error(`${context}: Project not found`);
      }
      if (axiosError.response?.status === 403) {
        return new Error(`${context}: Not authorized`);
      }
      if (axiosError.response?.data?.message) {
        return new Error(`${context}: ${axiosError.response.data.message}`);
      }
    }

    return new Error(context);
  }
}

// Export singleton instance
export const projectService = new ProjectService();