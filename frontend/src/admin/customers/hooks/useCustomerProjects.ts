// frontend/src/admin/customers/hooks/useCustomerProjects.ts
import { useState } from 'react';
import { Project } from '../../../shared/api/types/customer.types';
import {
  useCustomerProjectsQuery,
  useAddProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useUpdateDefaultProjectMutation,
} from '../../../shared/api/queries/useProjectQueries';

interface UseCustomerProjectsProps {
  customerId?: number;
  initialProjects?: Project[];
  onChange: (projects: Project[]) => void;
}

export const useCustomerProjects = ({ 
  customerId,
  initialProjects = [],
  onChange 
}: UseCustomerProjectsProps) => {
  const [newProject, setNewProject] = useState<Project>({
    lookupCode: '',
    name: '',
    description: '',
    isDefault: false
  });

  // Solo ejecutar queries y mutations si tenemos un customerId
  const { 
    data: projects = initialProjects,
    isLoading,
    error
  } = useCustomerProjectsQuery(customerId ?? 0);

  const addProjectMutation = useAddProjectMutation(customerId ?? 0);
  const updateProjectMutation = useUpdateProjectMutation(customerId ?? 0);
  const deleteProjectMutation = useDeleteProjectMutation(customerId ?? 0);
  const updateDefaultProjectMutation = useUpdateDefaultProjectMutation(customerId ?? 0);

  const handleAddProject = async () => {
    if (!newProject.lookupCode || !newProject.name) return;
    
    try {
      const projectToAdd = {
        ...newProject,
        isDefault: initialProjects.length === 0 // Usamos initialProjects en lugar de projects
      };
      
      // Si tenemos customerId, hacemos la llamada al servidor
      if (customerId) {
        await addProjectMutation.mutateAsync(projectToAdd);
      }
      
      // En cualquier caso, actualizamos el estado local
      onChange([...initialProjects, projectToAdd]);
      
      // Resetear el formulario de nuevo proyecto
      setNewProject({
        lookupCode: '',
        name: '',
        description: '',
        isDefault: false
      });
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  const handleRemoveProject = async (index: number) => {
    const projectToRemove = initialProjects[index];
    
    try {
      // Si tenemos customerId y el proyecto tiene ID, lo eliminamos en el servidor
      if (customerId && projectToRemove.id) {
        await deleteProjectMutation.mutateAsync(projectToRemove.id);
      }
      
      const updatedProjects = initialProjects.filter((_, i) => i !== index);
      
      // Si eliminamos el proyecto default y hay otros proyectos, hacer el primero default
      if (projectToRemove.isDefault && updatedProjects.length > 0) {
        const firstProject = updatedProjects[0];
        if (customerId && firstProject.id) {
          await updateDefaultProjectMutation.mutateAsync(firstProject.id);
        }
        updatedProjects[0] = { ...updatedProjects[0], isDefault: true };
      }
      
      onChange(updatedProjects);
    } catch (error) {
      console.error('Error removing project:', error);
    }
  };

  const handleDefaultChange = async (index: number) => {
    const project = initialProjects[index];
    
    try {
      // Si tenemos customerId y el proyecto tiene ID, actualizamos en el servidor
      if (customerId && project.id) {
        await updateDefaultProjectMutation.mutateAsync(project.id);
      }
      
      const updatedProjects = initialProjects.map((p, i) => ({
        ...p,
        isDefault: i === index
      }));
      onChange(updatedProjects);
    } catch (error) {
      console.error('Error updating default project:', error);
    }
  };

  return {
    projects: customerId ? projects : initialProjects,
    newProject,
    isLoading: customerId ? isLoading : false,
    error: error ? String(error) : null,
    handleAddProject,
    handleRemoveProject,
    handleDefaultChange,
    setNewProject
  };
};