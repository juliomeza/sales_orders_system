// frontend/src/admin/customers/hooks/useCustomerBasicInfo.ts
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Customer } from '../../../shared/api/types/customer.types';
import { useUpdateCustomerMutation } from '../../../shared/api/queries/useCustomerQueries';
import { queryKeys } from '../../../shared/config/queryKeys';

/**
 * Props interface for useCustomerBasicInfo hook
 * @interface UseCustomerBasicInfoProps
 * @property {number} [customerId] - Optional ID of the customer being edited
 * @property {Partial<Customer>} [initialData] - Initial customer data
 * @property {(data: Partial<Customer>) => void} [onUpdate] - Callback after successful update
 */
interface UseCustomerBasicInfoProps {
  customerId?: number;
  initialData?: Partial<Customer>;
  onUpdate?: (data: Partial<Customer>) => void;
}

/**
 * State interface for managing customer basic information form
 * @interface CustomerBasicInfoState
 * @property {Partial<Customer>} formData - Current form field values
 * @property {boolean} isDirty - Indicates if form has unsaved changes
 * @property {Record<string, string>} errors - Form validation errors
 */
interface CustomerBasicInfoState {
  formData: Partial<Customer>;
  isDirty: boolean;
  errors: Record<string, string>;
}

/**
 * Custom hook for managing customer basic information form state and operations
 * Handles form state, validation, and API interactions for customer data
 */
export const useCustomerBasicInfo = ({
  customerId,
  initialData,
  onUpdate
}: UseCustomerBasicInfoProps = {}) => {
  const queryClient = useQueryClient();
  const updateMutation = useUpdateCustomerMutation();

  // Initialize form state with default values or provided initial data
  const [state, setState] = useState<CustomerBasicInfoState>({
    formData: initialData || {
      lookupCode: '',
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
      status: 1
    },
    isDirty: false,
    errors: {}
  });

  /**
   * Validates form data and returns validation errors
   * @param {Partial<Customer>} data - Customer data to validate
   * @returns {Record<string, string>} Object containing field-specific error messages
   */
  const validateForm = useCallback((data: Partial<Customer>): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!data.lookupCode?.trim()) {
      errors.lookupCode = 'Customer code is required';
    }
    if (!data.name?.trim()) {
      errors.name = 'Customer name is required';
    }
    if (!data.address?.trim()) {
      errors.address = 'Address is required';
    }
    if (!data.city?.trim()) {
      errors.city = 'City is required';
    }
    if (!data.state?.trim()) {
      errors.state = 'State is required';
    } else if (data.state.length !== 2) {
      errors.state = 'State must be a 2-letter code';
    }
    if (!data.zipCode?.trim()) {
      errors.zipCode = 'ZIP code is required';
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Invalid email format';
    }

    return errors;
  }, []);

  /**
   * Handles changes to form field values
   * Updates form state and triggers validation
   * @param {keyof Customer} field - Name of the field being updated
   */
  const handleChange = useCallback((field: keyof Customer) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'status' 
      ? Number(event.target.checked)
      : event.target.value;

    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value
      },
      isDirty: true,
      errors: validateForm({
        ...prev.formData,
        [field]: value
      })
    }));
  }, [validateForm]);

  /**
   * Handles changes to customer status toggle
   * Updates status between active (1) and inactive (2)
   */
  const handleStatusChange = useCallback((
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        status: event.target.checked ? 1 : 2
      },
      isDirty: true
    }));
  }, []);

  /**
   * Saves customer data to the server
   * Implements optimistic updates with error rollback
   * Validates form before submission
   * @throws {Error} When update operation fails
   */
  const handleSave = useCallback(async () => {
    if (!customerId) return;

    // Validate form before submission
    const errors = validateForm(state.formData);
    if (Object.keys(errors).length > 0) {
      setState(prev => ({ ...prev, errors }));
      return;
    }

    let previousData: Customer | undefined;

    try {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.customers.byId(customerId) 
      });

      // Snapshot the previous value
      previousData = queryClient.getQueryData<Customer>(
        queryKeys.customers.byId(customerId)
      );

      // Optimistically update
      if (previousData) {
        queryClient.setQueryData<Customer>(
          queryKeys.customers.byId(customerId),
          {
            ...previousData,
            ...state.formData
          }
        );
      }

      // Perform update
      await updateMutation.mutateAsync({
        customerId,
        data: {
          customer: {
            ...state.formData,
            lookupCode: state.formData.lookupCode ?? '',
            name: state.formData.name ?? '',
            address: state.formData.address ?? '',
            city: state.formData.city ?? '',
            state: state.formData.state ?? '',
            zipCode: state.formData.zipCode ?? '',
            phone: state.formData.phone ?? '',
            email: state.formData.email ?? '',
            status: state.formData.status ?? 1,
          },
          projects: [],
          users: []
        }
      });

      // Update form state
      setState(prev => ({
        ...prev,
        isDirty: false,
        errors: {}
      }));

      // Call onUpdate callback if provided
      onUpdate?.(state.formData);

      // Invalidate related queries
      await Promise.all([
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.customers.byId(customerId) 
        }),
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.customers.all 
        })
      ]);
    } catch (error) {
      // Rollback on error
      if (previousData) {
        queryClient.setQueryData<Customer>(
          queryKeys.customers.byId(customerId),
          previousData
        );
      }
      console.error('Error updating customer:', error);
      throw error;
    }
  }, [customerId, state.formData, validateForm, updateMutation, queryClient, onUpdate]);

  /**
   * Resets form to initial state or default values
   * Clears errors and dirty state
   */
  const resetForm = useCallback(() => {
    setState({
      formData: initialData || {
        lookupCode: '',
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        email: '',
        status: 1
      },
      isDirty: false,
      errors: {}
    });
  }, [initialData]);

  // Return hook interface
  return {
    formData: state.formData,
    errors: state.errors,
    isDirty: state.isDirty,
    isUpdating: updateMutation.isPending,
    handleChange,
    handleStatusChange,
    handleSave,
    resetForm,
    validateForm
  };
};