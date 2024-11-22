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

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  const handleAddProject = () => {
    if (!newProject.lookupCode || !newProject.name) return;
    
    const isFirstProject = projects.length === 0;
    const projectToAdd = {
      ...newProject,
      isDefault: isFirstProject
    };
    
    const updatedProjects = [...projects, projectToAdd];
    setProjects(updatedProjects);
    onChange(updatedProjects);
    setNewProject({
      lookupCode: '',
      name: '',
      description: '',
      isDefault: false
    });
  };

  const handleRemoveProject = (index: number) => {
    const updatedProjects = projects.filter((_, i) => i !== index);
    
    if (projects[index].isDefault && updatedProjects.length > 0) {
      updatedProjects[0].isDefault = true;
    }
    
    setProjects(updatedProjects);
    onChange(updatedProjects);
  };

  const handleDefaultChange = (index: number) => {
    const updatedProjects = projects.map((project, i) => ({
      ...project,
      isDefault: i === index
    }));
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