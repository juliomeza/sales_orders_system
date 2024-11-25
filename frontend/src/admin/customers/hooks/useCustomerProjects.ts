// src/admin/customers/hooks/useCustomerProjects.ts
import { useState, useEffect } from 'react';
import { Project } from '../types';

interface UseCustomerProjectsProps {
  initialProjects: Project[];
  onChange: (projects: Project[]) => void;
}

export const useCustomerProjects = ({ 
  initialProjects, 
  onChange 
}: UseCustomerProjectsProps) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [newProject, setNewProject] = useState<Project>({
    lookupCode: '',
    name: '',
    description: '',
    isDefault: false
  });

  // Debug: Ver los proyectos iniciales cuando se monta el componente
  useEffect(() => {
    console.log('Initial projects in useCustomerProjects:', initialProjects);
  }, [initialProjects]);

  // Actualizar projects cuando cambian los initialProjects
  useEffect(() => {
    console.log('Updating projects with:', initialProjects);
    const updatedProjects = initialProjects.map(project => ({
      id: project.id,
      lookupCode: project.lookupCode || '',
      name: project.name || '',
      description: project.description || '',
      isDefault: Boolean(project.isDefault)
    }));
    setProjects(updatedProjects);
  }, [initialProjects]);

  const handleAddProject = () => {
    if (!newProject.lookupCode || !newProject.name) return;
    
    const isFirstProject = projects.length === 0;
    const projectToAdd = {
      ...newProject,
      isDefault: isFirstProject // Si es el primer proyecto, será el default
    };
    
    console.log('Adding new project:', projectToAdd);
    const updatedProjects = [...projects, projectToAdd];
    setProjects(updatedProjects);
    onChange(updatedProjects);
    
    // Resetear el formulario de nuevo proyecto
    setNewProject({
      lookupCode: '',
      name: '',
      description: '',
      isDefault: false
    });
  };

  const handleRemoveProject = (index: number) => {
    console.log('Removing project at index:', index);
    const updatedProjects = projects.filter((_, i) => i !== index);
    
    // Si eliminamos el proyecto default y hay otros proyectos, hacer el primero default
    if (projects[index].isDefault && updatedProjects.length > 0) {
      updatedProjects[0] = { ...updatedProjects[0], isDefault: true };
    }
    
    console.log('Projects after removal:', updatedProjects);
    setProjects(updatedProjects);
    onChange(updatedProjects);
  };

  const handleDefaultChange = (index: number) => {
    console.log('Changing default project to index:', index);
    const updatedProjects = projects.map((project, i) => ({
      ...project,
      isDefault: i === index
    }));
    
    console.log('Projects after default change:', updatedProjects);
    setProjects(updatedProjects);
    onChange(updatedProjects);
  };

  return {
    projects,
    newProject,
    handleAddProject,
    handleRemoveProject,
    handleDefaultChange,
    setNewProject
  };
};