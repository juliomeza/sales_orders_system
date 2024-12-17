// frontend/src/shared/api/queries/useProjectQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services/projectService';
import { queryKeys } from '../../config/queryClient';
import { Project } from '../types/customer.types';

export const useCustomerProjectsQuery = (customerId: number) => {
  return useQuery({
    queryKey: queryKeys.customers.projects(customerId),
    queryFn: () => projectService.getCustomerProjects(customerId),
    enabled: !!customerId,
  });
};

export const useAddProjectMutation = (customerId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (project: Omit<Project, 'id'>) => 
      projectService.addProject(customerId, project),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.customers.projects(customerId) 
      });
    },
  });
};

export const useUpdateProjectMutation = (customerId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: Partial<Project> }) =>
      projectService.updateProject(customerId, projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.customers.projects(customerId) 
      });
    },
  });
};

export const useDeleteProjectMutation = (customerId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectId: number) => 
      projectService.deleteProject(customerId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.customers.projects(customerId) 
      });
    },
  });
};

export const useUpdateDefaultProjectMutation = (customerId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectId: number) => 
      projectService.updateDefaultProject(customerId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.customers.projects(customerId) 
      });
    },
  });
};