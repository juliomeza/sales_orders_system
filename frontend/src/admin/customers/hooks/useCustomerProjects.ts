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

interface UseCustomerProjectsProps {
  customerId?: number;
  initialProjects?: Project[];
  onChange: (projects: Project[]) => void;
}

interface ProjectsData {
  projects: Project[];
}

export const useCustomerProjects = ({ 
  customerId,
  initialProjects = [],
  onChange 
}: UseCustomerProjectsProps) => {
  const queryClient = useQueryClient();
  const [newProject, setNewProject] = useState<Project>({
    lookupCode: '',
    name: '',
    description: '',
    isDefault: false
  });

  const { 
    data: projects = initialProjects,
    isLoading,
    error
  } = useCustomerProjectsQuery(customerId ?? 0);

  const addProjectMutation = useAddProjectMutation(customerId ?? 0);
  const updateProjectMutation = useUpdateProjectMutation(customerId ?? 0);
  const deleteProjectMutation = useDeleteProjectMutation(customerId ?? 0);
  const updateDefaultProjectMutation = useUpdateDefaultProjectMutation(customerId ?? 0);

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