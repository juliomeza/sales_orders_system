// frontend/src/admin/customers/hooks/useCustomerProjects.ts
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Project } from '../../../shared/api/types/customer.types';
import {
  useCustomerProjectsQuery,
  useAddProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useUpdateDefaultProjectMutation,
} from '../../../shared/api/queries/useProjectQueries';
import { queryKeys } from '../../../shared/config/queryKeys';

/**
 * Props interface for useCustomerProjects hook
 * @interface UseCustomerProjectsProps
 * @property {number} [customerId] - Optional ID of the customer whose projects are being managed
 * @property {Project[]} [initialProjects] - Initial array of projects
 * @property {(projects: Project[]) => void} onChange - Callback when projects are modified
 */
interface UseCustomerProjectsProps {
  customerId?: number;
  initialProjects?: Project[];
  onChange: (projects: Project[]) => void;
}

/**
 * Interface for the projects data structure returned by the API
 * @interface ProjectsData
 * @property {Project[]} projects - Array of customer projects
 */
interface ProjectsData {
  projects: Project[];
}

/**
 * Custom hook for managing customer projects
 * Handles CRUD operations for projects with optimistic updates and error handling
 */
export const useCustomerProjects = ({ 
  customerId,
  initialProjects = [],
  onChange 
}: UseCustomerProjectsProps) => {
  const queryClient = useQueryClient();
  
  // State for new project form
  const [newProject, setNewProject] = useState<Project>({
    lookupCode: '',
    name: '',
    description: '',
    isDefault: false
  });

  // Query hooks for data fetching and mutations
  const { 
    data: projects = initialProjects,
    isLoading,
    error
  } = useCustomerProjectsQuery(customerId ?? 0);

  const addProjectMutation = useAddProjectMutation(customerId ?? 0);
  const updateProjectMutation = useUpdateProjectMutation(customerId ?? 0);
  const deleteProjectMutation = useDeleteProjectMutation(customerId ?? 0);
  const updateDefaultProjectMutation = useUpdateDefaultProjectMutation(customerId ?? 0);

  /**
   * Handles adding a new project
   * Implements optimistic updates with error rollback
   * Sets first project as default automatically
   */
  const handleAddProject = useCallback(async () => {
    if (!newProject.lookupCode || !newProject.name) return;
    
    let previousData: ProjectsData | undefined;
    
    try {
      const projectToAdd = {
        ...newProject,
        isDefault: initialProjects.length === 0
      };

      if (customerId) {
        await queryClient.cancelQueries({ 
          queryKey: queryKeys.customers.projects(customerId) 
        });

        previousData = queryClient.getQueryData<ProjectsData>(
          queryKeys.customers.projects(customerId)
        );

        // Optimistic update
        if (previousData?.projects) {
          queryClient.setQueryData<ProjectsData>(
            queryKeys.customers.projects(customerId),
            {
              projects: [...previousData.projects, { ...projectToAdd, id: Date.now() }]
            }
          );
        }

        await addProjectMutation.mutateAsync(projectToAdd);
      }
      
      onChange([...initialProjects, projectToAdd]);
      
      setNewProject({
        lookupCode: '',
        name: '',
        description: '',
        isDefault: false
      });

      // Invalidate related queries
      if (customerId) {
        await queryClient.invalidateQueries({ 
          queryKey: queryKeys.customers.projects(customerId) 
        });
      }
    } catch (error) {
      // Rollback on error
      if (previousData && customerId) {
        queryClient.setQueryData<ProjectsData>(
          queryKeys.customers.projects(customerId),
          previousData
        );
      }
      console.error('Error adding project:', error);
      throw error;
    }
  }, [newProject, initialProjects, customerId, addProjectMutation, onChange, queryClient]);

  /**
   * Handles removing a project
   * Implements optimistic updates with error rollback
   * Manages default project reassignment when necessary
   * @param {number} index - Index of the project to remove
   */
  const handleRemoveProject = useCallback(async (index: number) => {
    const projectToRemove = initialProjects[index];
    let previousData: ProjectsData | undefined;
    
    try {
      if (customerId && projectToRemove.id) {
        await queryClient.cancelQueries({ 
          queryKey: queryKeys.customers.projects(customerId) 
        });

        previousData = queryClient.getQueryData<ProjectsData>(
          queryKeys.customers.projects(customerId)
        );

        // Optimistic update
        if (previousData?.projects) {
          queryClient.setQueryData<ProjectsData>(
            queryKeys.customers.projects(customerId),
            {
              projects: previousData.projects.filter(p => p.id !== projectToRemove.id)
            }
          );
        }

        await deleteProjectMutation.mutateAsync(projectToRemove.id);
      }
      
      const updatedProjects = initialProjects.filter((_, i) => i !== index);
      
      // If removing default project, make first project default
      if (projectToRemove.isDefault && updatedProjects.length > 0) {
        const firstProject = updatedProjects[0];
        if (customerId && firstProject.id) {
          await updateDefaultProjectMutation.mutateAsync(firstProject.id);
        }
        updatedProjects[0] = { ...updatedProjects[0], isDefault: true };
      }
      
      onChange(updatedProjects);

      // Invalidate related queries
      if (customerId) {
        await queryClient.invalidateQueries({ 
          queryKey: queryKeys.customers.projects(customerId) 
        });
      }
    } catch (error) {
      // Rollback on error
      if (previousData && customerId) {
        queryClient.setQueryData<ProjectsData>(
          queryKeys.customers.projects(customerId),
          previousData
        );
      }
      console.error('Error removing project:', error);
      throw error;
    }
  }, [initialProjects, customerId, deleteProjectMutation, updateDefaultProjectMutation, onChange, queryClient]);

  /**
   * Handles changing the default project
   * Implements optimistic updates with error rollback
   * Updates all projects to reflect new default status
   * @param {number} index - Index of the new default project
   */
  const handleDefaultChange = useCallback(async (index: number) => {
    const project = initialProjects[index];
    let previousData: ProjectsData | undefined;
    
    try {
      if (customerId && project.id) {
        await queryClient.cancelQueries({ 
          queryKey: queryKeys.customers.projects(customerId) 
        });

        previousData = queryClient.getQueryData<ProjectsData>(
          queryKeys.customers.projects(customerId)
        );

        // Optimistic update
        if (previousData?.projects) {
          const updatedProjects = previousData.projects.map(p => ({
            ...p,
            isDefault: p.id === project.id
          }));

          queryClient.setQueryData<ProjectsData>(
            queryKeys.customers.projects(customerId),
            { projects: updatedProjects }
          );
        }

        await updateDefaultProjectMutation.mutateAsync(project.id);
      }
      
      const updatedProjects = initialProjects.map((p, i) => ({
        ...p,
        isDefault: i === index
      }));
      onChange(updatedProjects);

      // Invalidate related queries
      if (customerId) {
        await queryClient.invalidateQueries({ 
          queryKey: queryKeys.customers.projects(customerId) 
        });
      }
    } catch (error) {
      // Rollback on error
      if (previousData && customerId) {
        queryClient.setQueryData<ProjectsData>(
          queryKeys.customers.projects(customerId),
          previousData
        );
      }
      console.error('Error updating default project:', error);
      throw error;
    }
  }, [initialProjects, customerId, updateDefaultProjectMutation, onChange, queryClient]);

  // Return hook interface with all necessary state and handlers
  return {
    projects: customerId ? projects : initialProjects,
    newProject,
    isLoading: customerId ? isLoading : false,
    error: error ? String(error) : null,
    isAdding: addProjectMutation.isPending,
    isRemoving: deleteProjectMutation.isPending,
    isUpdatingDefault: updateDefaultProjectMutation.isPending,
    handleAddProject,
    handleRemoveProject,
    handleDefaultChange,
    setNewProject
  };
};