// src/components/orders/steps/InventoryStep.tsx
import React from 'react';
import {
  Card,
  CardContent,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import { InventoryItem } from '../../../types/shipping';
import { useInventory } from '../../../hooks/useInventory';
import Inventory_SearchBar from '../inventory/Inventory_SearchBar';
import Inventory_Table from '../inventory/Inventory_Table';

interface InventoryStepProps {
  selectedItems: InventoryItem[];
  onItemsChange: (items: InventoryItem[]) => void;
}

export const InventoryStep: React.FC<InventoryStepProps> = ({
  selectedItems,
  onItemsChange,
}) => {
  const {
    inventory,
    inputValues,
    searchTerm,
    isLoading,
    setSearchTerm,
    handleQuantityChange,
    handleAddItem,
  } = useInventory(selectedItems);

  // Update parent component when items change
  const handleAddItemWrapper = (item: InventoryItem) => {
    handleAddItem(item);
    const updatedItems = [...selectedItems];
    const existingItemIndex = updatedItems.findIndex(i => i.id === item.id);

    if (existingItemIndex >= 0) {
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + item.quantity
      };
    } else {
      updatedItems.push({ ...item });
    }
    
    onItemsChange(updatedItems);
  };

  if (isLoading) {
    return (
      <Card sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <CardContent>
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
      <CardContent>
        <Inventory_SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        
        <Inventory_Table
          inventory={inventory}
          inputValues={inputValues}
          onQuantityChange={handleQuantityChange}
          onAddItem={handleAddItemWrapper}
        />
      </CardContent>
    </Card>
  );
};

export default InventoryStep;