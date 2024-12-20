// frontend/src/shared/api/queries/useProjectQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services/projectService';
import { queryKeys } from '../../config/queryKeys';
import { Project } from '../types/customer.types';
import { CACHE_TIME } from '../../config/queryClient';

/**
 * Hook to fetch all projects for a customer
 */
export const useCustomerProjectsQuery = (customerId: number) => {
  return useQuery<Project[], Error>({
    queryKey: queryKeys.customers.projects(customerId),
    queryFn: () => projectService.getCustomerProjects(customerId),
    enabled: Boolean(customerId),
    staleTime: CACHE_TIME.DYNAMIC,
    select: (projects) => projects.map(project => ({
      ...project,
      isDefault: Boolean(project.isDefault)
    })),
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      if (error?.response?.status === 403) return false;
      return failureCount < 2;
    }
  });
};

/**
 * Hook to add a new project
 */
export const useAddProjectMutation = (customerId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (project: Omit<Project, 'id'>) => 
      projectService.addProject(customerId, project),
    
    onMutate: async (newProject) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.customers.projects(customerId) 
      });

      const previousProjects = queryClient.getQueryData<Project[]>(
        queryKeys.customers.projects(customerId)
      );

      if (previousProjects) {
        queryClient.setQueryData<Project[]>(
          queryKeys.customers.projects(customerId),
          [
            ...previousProjects,
            { ...newProject, id: Date.now() } // Temporary ID
          ]
        );
      }

      return { previousProjects };
    },

    onError: (error, variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData<Project[]>(
          queryKeys.customers.projects(customerId),
          context.previousProjects
        );
      }
      console.error('Error adding project:', error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.customers.projects(customerId) 
      });
    }
  });
};

/**
 * Hook to update an existing project
 */
export const useUpdateProjectMutation = (customerId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: Partial<Project> }) =>
      projectService.updateProject(customerId, projectId, data),
    
    onMutate: async ({ projectId, data }) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.customers.projects(customerId) 
      });

      const previousProjects = queryClient.getQueryData<Project[]>(
        queryKeys.customers.projects(customerId)
      );

      if (previousProjects) {
        const updatedProjects = previousProjects.map(project =>
          project.id === projectId ? { ...project, ...data } : project
        );

        queryClient.setQueryData<Project[]>(
          queryKeys.customers.projects(customerId),
          updatedProjects
        );
      }

      return { previousProjects };
    },

    onError: (error, variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData<Project[]>(
          queryKeys.customers.projects(customerId),
          context.previousProjects
        );
      }
      console.error('Error updating project:', error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.customers.projects(customerId) 
      });
    }
  });
};

/**
 * Hook to delete a project
 */
export const useDeleteProjectMutation = (customerId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectId: number) => 
      projectService.deleteProject(customerId, projectId),
    
    onMutate: async (deletedProjectId) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.customers.projects(customerId) 
      });

      const previousProjects = queryClient.getQueryData<Project[]>(
        queryKeys.customers.projects(customerId)
      );

      if (previousProjects) {
        queryClient.setQueryData<Project[]>(
          queryKeys.customers.projects(customerId),
          previousProjects.filter(project => project.id !== deletedProjectId)
        );
      }

      return { previousProjects };
    },

    onError: (error, variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData<Project[]>(
          queryKeys.customers.projects(customerId),
          context.previousProjects
        );
      }
      console.error('Error deleting project:', error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.customers.projects(customerId) 
      });
    }
  });
};

/**
 * Hook to set a project as default
 */
export const useUpdateDefaultProjectMutation = (customerId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectId: number) => 
      projectService.updateDefaultProject(customerId, projectId),
    
    onMutate: async (newDefaultProjectId) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.customers.projects(customerId) 
      });

      const previousProjects = queryClient.getQueryData<Project[]>(
        queryKeys.customers.projects(customerId)
      );

      if (previousProjects) {
        const updatedProjects = previousProjects.map(project => ({
          ...project,
          isDefault: project.id === newDefaultProjectId
        }));

        queryClient.setQueryData<Project[]>(
          queryKeys.customers.projects(customerId),
          updatedProjects
        );
      }

      return { previousProjects };
    },

    onError: (error, variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData<Project[]>(
          queryKeys.customers.projects(customerId),
          context.previousProjects
        );
      }
      console.error('Error updating default project:', error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.customers.projects(customerId) 
      });
    }
  });
};