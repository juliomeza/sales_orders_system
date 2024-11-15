// frontend/src/shared/hooks/useInventory.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { InventoryItem } from '../types/shipping';
import { apiClient } from '../api/apiClient';

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

  // Separar la lógica de carga en una función independiente
  const fetchInventory = async (query: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const endpoint = query ? 
        `/materials/search?query=${encodeURIComponent(query)}` : 
        '/materials';
      
      const response = await apiClient.get<MaterialResponse>(endpoint);
      
      const mappedMaterials = response.materials.map(material => ({
        id: material.id.toString(),
        code: material.code,
        lookupCode: material.code,
        description: material.description,
        uom: material.uom,
        availableQuantity: material.availableQuantity,
        available: material.availableQuantity,
        quantity: 0,
        packaging: material.uom,
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

  // Crear una versión debounced de fetchInventory que persiste entre renders
  const debouncedFetch = useMemo(
    () => debounce((query: string) => fetchInventory(query), 300),
    []
  );

  // Limpiar el debounce al desmontar
  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

  // Efecto para manejar cambios en searchTerm
  useEffect(() => {
    debouncedFetch(searchTerm);
  }, [searchTerm, debouncedFetch]);

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

  // Crear una función de búsqueda controlada
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  return {
    inventory,
    selectedItems,
    inputValues,
    searchTerm,
    isLoading,
    error,
    setSearchTerm: handleSearchChange,
    handleQuantityChange,
    handleAddItem,
    handleRemoveItem,
    setSelectedItems,
  };
};