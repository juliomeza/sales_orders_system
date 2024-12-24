// frontend/src/admin/customers/components/tables/ProjectsTable.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Switch,
  Typography
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Project } from '../../types';

interface ProjectsTableProps {
  projects: Project[];
  onDelete: (index: number) => void;
  onDefaultChange: (index: number) => void;
}

export const ProjectsTable: React.FC<ProjectsTableProps> = ({
  projects,
  onDelete,
  onDefaultChange
}) => {
  return (
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
          {projects && projects.length > 0 ? (
            projects.map((project, index) => {  
              return (
                <TableRow key={project.id || index}>
                  <TableCell>{project.lookupCode}</TableCell>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.description}</TableCell>
                  <TableCell>
                    <Switch
                      checked={Boolean(project.isDefault)}
                      onChange={() => onDefaultChange(index)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => onDelete(index)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography variant="body2" color="text.secondary">
                  No projects added
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};