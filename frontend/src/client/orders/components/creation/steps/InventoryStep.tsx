// frontend/src/client/orders/components/creation/steps/InventoryStep.tsx
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import { InventoryItem } from '../../../../../shared/types/shipping';
import { useInventoryQuery } from '../../../../../shared/api/queries/useInventoryQueries';
import InventorySearchBar from '../../inventory/SearchBar';
import InventoryTable from '../../inventory/Table';

interface InventoryStepProps {
  selectedItems: InventoryItem[];
  onItemsChange: (items: InventoryItem[]) => void;
}

export const InventoryStep: React.FC<InventoryStepProps> = ({
  selectedItems,
  onItemsChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  
  // Reemplazamos useInventory por useInventoryQuery
  const { 
    data: inventory = [], 
    isLoading, 
    error 
  } = useInventoryQuery(searchTerm);

  const handleQuantityChange = (itemId: string, value: string) => {
    setInputValues(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const handleAddItem = (item: InventoryItem) => {
    if (!inputValues[item.id]) return;
    
    const quantity = parseInt(inputValues[item.id]);
    if (quantity <= 0 || quantity > item.available) return;

    const newItem = { ...item, quantity };
    const updatedItems = [...selectedItems];
    const existingIndex = updatedItems.findIndex(i => i.id === item.id);

    if (existingIndex >= 0) {
      updatedItems[existingIndex].quantity += quantity;
    } else {
      updatedItems.push(newItem);
    }

    onItemsChange(updatedItems);
    setInputValues(prev => ({ ...prev, [item.id]: '' }));
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error loading inventory</Typography>
      </Box>
    );
  }

  return (
    <Card sx={{ bgcolor: '#fff', borderRadius: 1, boxShadow: 1 }}>
      <CardContent>
        <InventorySearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isLoading={isLoading}
        />
        
        {isLoading && inventory.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '400px',
            flexDirection: 'column',
            gap: 2
          }}>
            <CircularProgress />
            <Typography variant="body1" color="text.secondary">
              Loading inventory...
            </Typography>
          </Box>
        ) : (
          <InventoryTable
            inventory={inventory}
            inputValues={inputValues}
            onQuantityChange={handleQuantityChange}
            onAddItem={handleAddItem}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryStep;