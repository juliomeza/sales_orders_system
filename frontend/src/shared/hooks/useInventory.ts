// src/hooks/useInventory.ts
import { useState, useEffect } from 'react';
import { InventoryItem } from '../types/shipping';
import { mockApi } from '../services/mockApi';

export const useInventory = (initialSelectedItems: InventoryItem[] = []) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>(initialSelectedItems);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadInventory = async () => {
      setIsLoading(true);
      try {
        const data = await mockApi.getInventory();
        setInventory(data);
      } catch (error) {
        console.error('Error loading inventory:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInventory();
  }, []);

  const handleQuantityChange = (itemId: string, value: string) => {
    setInputValues(prev => ({
      ...prev,
      [itemId]: value
    }));

    const quantity = value === '' ? 0 : parseInt(value) || 0;
    setInventory(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const handleAddItem = (item: InventoryItem) => {
    if (item.quantity <= 0 || item.quantity > item.available) return;

    const newItems = [...selectedItems];
    const existingItemIndex = newItems.findIndex(i => i.id === item.id);

    if (existingItemIndex >= 0) {
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: newItems[existingItemIndex].quantity + item.quantity
      };
    } else {
      newItems.push({ ...item });
    }

    setSelectedItems(newItems);
    
    // Reset input value after adding
    setInputValues(prev => ({
      ...prev,
      [item.id]: ''
    }));
    handleQuantityChange(item.id, '');
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== itemId));
  };

  const filteredInventory = inventory.filter(item =>
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.lookupCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    inventory: filteredInventory,
    selectedItems,
    inputValues,
    searchTerm,
    isLoading,
    setSearchTerm,
    handleQuantityChange,
    handleAddItem,
    handleRemoveItem,
    setSelectedItems,
  };
};