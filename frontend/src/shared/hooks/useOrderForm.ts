/**
 * @fileoverview Custom hook for managing order form state
 * Provides functionality for handling order data with state management
 * and form reset capabilities.
 */

import { useState } from 'react';
import { OrderData } from '../types/shipping';

/**
 * Initial state for order data
 * Defines default values for all order fields
 * 
 * @constant
 * @type {OrderData}
 */
const initialOrderData: OrderData = {
  orderLookup: '',        // Unique order identifier
  poNo: '',              // Purchase order number
  referenceNo: '',       // External reference number
  orderClass: 'Sales Order', // Default order classification
  owner: '',             // Order owner/creator
  project: '',           // Associated project
  carrier: '',           // Shipping carrier
  serviceType: '',       // Shipping service type
  expectedDate: null,    // Expected delivery date
  shipToAccount: '',     // Shipping account ID
  billToAccount: '',     // Billing account ID
  preferredWarehouse: '', // Preferred fulfillment warehouse
  
  // Shipping address details
  shipToAddress: {
    id: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  },
  
  // Billing address details
  billToAddress: {
    id: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  },
  
  orderNotes: ''         // Additional order notes
};

/**
 * Hook for managing order form state
 * 
 * Features:
 * - Maintains order data state
 * - Provides type-safe update method
 * - Includes form reset functionality
 * 
 * @returns {Object} Order form state and handlers
 * @returns {OrderData} orderData - Current order data state
 * @returns {Function} handleOrderDataChange - Handler for updating order fields
 * @returns {Function} resetForm - Handler for resetting form to initial state
 */
export const useOrderForm = () => {
  // Initialize state with default values
  const [orderData, setOrderData] = useState<OrderData>(initialOrderData);

  /**
   * Updates a single field in the order data
   * 
   * @param {keyof OrderData} field - Field to update
   * @param {any} value - New value for the field
   */
  const handleOrderDataChange = (field: keyof OrderData, value: any) => {
    setOrderData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Resets form to initial state
   * Clears all form fields to default values
   */
  const resetForm = () => {
    setOrderData(initialOrderData);
  };

  return {
    orderData,            // Current form state
    handleOrderDataChange, // Field update handler
    resetForm             // Form reset handler
  };
};