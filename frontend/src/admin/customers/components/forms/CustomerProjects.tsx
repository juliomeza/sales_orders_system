// src/admin/customers/components/forms/CustomerProjects.tsx
import React from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Switch,
  Alert
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useCustomerProjects } from '../../hooks/useCustomerProjects';
import { Project } from '../../types';

interface CustomerProjectsProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}

const CustomerProjects: React.FC<CustomerProjectsProps> = ({
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

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Projects
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Each customer must have at least one project
      </Alert>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          label="Project Code"
          value={newProject.lookupCode}
          onChange={(e) => setNewProject(prev => ({
            ...prev,
            lookupCode: e.target.value
          }))}
          size="small"
        />
        <TextField
          label="Name"
          value={newProject.name}
          onChange={(e) => setNewProject(prev => ({
            ...prev,
            name: e.target.value
          }))}
          size="small"
        />
        <TextField
          label="Description"
          value={newProject.description}
          onChange={(e) => setNewProject(prev => ({
            ...prev,
            description: e.target.value
          }))}
          size="small"
        />
        <Button
          variant="contained"
          onClick={handleAddProject}
          disabled={!newProject.lookupCode || !newProject.name}
        >
          Add Project
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Default</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project, index) => (
              <TableRow key={project.lookupCode}>
                <TableCell>{project.lookupCode}</TableCell>
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.description}</TableCell>
                <TableCell>
                  <Switch
                    checked={project.isDefault}
                    onChange={() => handleDefaultChange(index)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleRemoveProject(index)}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {projects.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No projects added
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CustomerProjects;