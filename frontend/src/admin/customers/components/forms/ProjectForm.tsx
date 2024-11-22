// src/admin/customers/components/forms/ProjectForm.tsx
import React from 'react';
import {
  Box,
  Button,
  Typography,
  Alert
} from '@mui/material';
import { ProjectFormInputs } from '../form-fields/ProjectFormInputs';
import { ProjectsTable } from '../tables/ProjectsTable';
import { useCustomerProjects } from '../../hooks/useCustomerProjects';
import { Project } from '../../types';

interface ProjectFormProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  projects,
  onChange
}) => {
  const {
    newProject,
    handleAddProject,
    handleRemoveProject,
    handleDefaultChange,
    setNewProject
  } = useCustomerProjects({ initialProjects: projects, onChange });

  const handleInputChange = (field: string, value: string) => {
    setNewProject(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Projects
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Each customer must have at least one project
      </Alert>

      <Box sx={{ mb: 3 }}>
        <ProjectFormInputs
          values={newProject}
          onChange={handleInputChange}
        />
        <Button
          variant="contained"
          onClick={handleAddProject}
          disabled={!newProject.lookupCode || !newProject.name}
          sx={{ mt: 2 }}
        >
          Add Project
        </Button>
      </Box>

      <ProjectsTable
        projects={projects.map(project => ({
          ...project,
          lookupCode: project.lookupCode || '',
          name: project.name || '',
          description: project.description || '',
          isDefault: project.isDefault || false
        }))}
        onDelete={handleRemoveProject}
        onDefaultChange={handleDefaultChange}
      />
    </Box>
  );
};

export default ProjectForm;