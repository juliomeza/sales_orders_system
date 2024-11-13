// frontend/src/shared/hooks/useInventory.ts
import { useState, useEffect } from 'react';
import { InventoryItem } from '../types/shipping';
import { apiClient } from '../../services/api/apiClient';

interface MaterialResponse {
  materials: Array<{
    id: string;
    code: string;
    description: string;
    uom: string;
    availableQuantity: number;
  }>;
  total: number;
  page?: number;
  limit?: number;
}

export const useInventory = (initialSelectedItems: InventoryItem[] = []) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>(initialSelectedItems);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInventory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const endpoint = searchTerm ? 
          `/materials/search?query=${encodeURIComponent(searchTerm)}` : 
          '/materials';
        
        const response = await apiClient.get<MaterialResponse>(endpoint);
        
        // Mapear los datos del backend al formato del frontend
        const mappedMaterials = response.materials.map(material => ({
          id: material.id.toString(),
          code: material.code,
          lookupCode: material.code,         // Usar code como lookupCode
          description: material.description,
          uom: material.uom,
          availableQuantity: material.availableQuantity,
          available: material.availableQuantity, // Duplicar para mantener compatibilidad
          quantity: 0,
          packaging: material.uom,           // Usar uom como packaging
          baseAvailable: material.availableQuantity
        }));

        setInventory(mappedMaterials);
      } catch (err: any) {
        console.error('Error loading inventory:', err);
        setError(err?.response?.data?.error || 'Error loading inventory');
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce para la búsqueda
    const timeoutId = setTimeout(loadInventory, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

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
    setInputValues(prev => ({
      ...prev,
      [item.id]: ''
    }));
    handleQuantityChange(item.id, '');
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== itemId));
  };

  return {
    inventory,
    selectedItems,
    inputValues,
    searchTerm,
    isLoading,
    error,
    setSearchTerm,
    handleQuantityChange,
    handleAddItem,
    handleRemoveItem,
    setSelectedItems,
  };
};