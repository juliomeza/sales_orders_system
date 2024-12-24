// frontend/src/shared/api/services/projectService.ts
/**
 * @fileoverview Project management service layer
 * Provides comprehensive API integration for managing customer projects
 * with data validation, transformation, and error handling.
 */

import { apiClient } from '../apiClient';
import { Project } from '../types/customer.types';

/**
 * Service class for managing customer projects
 * Implements CRUD operations and project-specific functionality
 */
class ProjectService {
  /**
   * Generates the base API path for project endpoints
   * @param {number} customerId - The customer ID for the path
   * @returns {string} The formatted base path
   * @private
   */
  private readonly getBasePath = (customerId: number) => 
    `/customers/${customerId}/projects`;

  /**
   * Fetches all projects for a specific customer
   * 
   * @param {number} customerId - The customer whose projects to fetch
   * @throws {Error} If the request fails or returns invalid data
   * @returns {Promise<Project[]>} Array of transformed project data
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
   * Creates a new project for a customer
   * 
   * @param {number} customerId - The customer to add the project to
   * @param {Omit<Project, 'id'>} project - The project data to create
   * @throws {Error} If validation fails or the request errors
   * @returns {Promise<Project>} The created project with generated ID
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
   * Updates an existing project
   * 
   * @param {number} customerId - The customer owning the project
   * @param {number} projectId - The project to update
   * @param {Partial<Project>} project - The fields to update
   * @throws {Error} If the project is not found or update fails
   * @returns {Promise<Project>} The updated project data
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
   * Deletes a project
   * 
   * @param {number} customerId - The customer owning the project
   * @param {number} projectId - The project to delete
   * @throws {Error} If the project is not found or deletion fails
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
   * Sets a project as the default for a customer
   * Only one project can be default at a time
   * 
   * @param {number} customerId - The customer owning the project
   * @param {number} projectId - The project to set as default
   * @throws {Error} If the operation fails
   * @returns {Promise<Project>} The updated project data
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
   * Transforms raw project data into consistent format
   * Ensures boolean values and default strings
   * 
   * @param {Project} project - Raw project data
   * @returns {Project} Normalized project data
   * @private
   */
  private transformProject(project: Project): Project {
    return {
      id: project.id,
      lookupCode: project.lookupCode,
      name: project.name,
      description: project.description || '',  // Ensure string for description
      isDefault: Boolean(project.isDefault)    // Normalize boolean value
    };
  }

  /**
   * Batch transforms multiple projects
   * 
   * @param {Project[]} projects - Array of raw project data
   * @returns {Project[]} Array of normalized projects
   * @private
   */
  private transformProjects(projects: Project[]): Project[] {
    return projects.map(project => this.transformProject(project));
  }

  /**
   * Validates project data before submission
   * Checks required fields and field lengths
   * 
   * @param {Omit<Project, 'id'>} project - Project data to validate
   * @throws {Error} If validation fails
   * @private
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
   * Handles API errors with context
   * Provides specific error messages for common cases
   * 
   * @param {unknown} error - The caught error
   * @param {string} context - Description of the operation that failed
   * @returns {Error} Formatted error with context
   * @private
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

// Export singleton instance for use across the application
export const projectService = new ProjectService();