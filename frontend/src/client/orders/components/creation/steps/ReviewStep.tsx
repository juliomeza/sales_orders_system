// frontend/src/client/orders/components/creation/steps/ReviewStep.tsx
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Box,
  Paper
} from '@mui/material';
import { OrderData, InventoryItem } from '../../../../../shared/types/shipping';
import { apiClient } from '../../../../../shared/api/apiClient';
import ReviewOrderSummary from '../../../../orders/components/review/ReviewOrderSummary';
import ReviewTable from '../../../../orders/components/review/ReviewTable';

interface ReviewStepProps {
  orderData: OrderData;
  selectedItems: InventoryItem[];
  onRemoveItem: (itemId: string) => void;
  isSubmitted: boolean;
}

interface CarrierService {
  id: number;
  name: string;
  description: string | null;
}

interface Carrier {
  id: string;
  name: string;
  lookupCode: string;
  services: CarrierService[];
}

interface ShippingAddress {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface CarriersResponse {
  carriers: Carrier[];
}

interface AddressResponse {
  addresses: ShippingAddress[];
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  orderData,
  selectedItems,
  onRemoveItem,
  isSubmitted
}) => {
  const [carrierName, setCarrierName] = useState('');
  const [carrierService, setCarrierService] = useState('');
  const [shipToName, setShipToName] = useState('');
  const [billToName, setBillToName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!orderData.carrier) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [carriersResponse, addressesResponse] = await Promise.all([
          apiClient.get<CarriersResponse>('/carriers'),
          apiClient.get<AddressResponse>('/ship-to')
        ]);

        // Find and set carrier information
        const carrier = carriersResponse.carriers.find(c => c.id.toString() === orderData.carrier);
        if (carrier) {
          setCarrierName(carrier.lookupCode);
          const service = carrier.services.find(s => s.id.toString() === orderData.serviceType);
          if (service) {
            setCarrierService(service.name);
          }
        }

        // Set shipping and billing names
        if (orderData.shipToAccount) {
          const shipTo = addressesResponse.addresses.find(a => a.id === orderData.shipToAccount);
          if (shipTo) {
            setShipToName(shipTo.name);
          }
        }

        if (orderData.billToAccount) {
          const billTo = addressesResponse.addresses.find(a => a.id === orderData.billToAccount);
          if (billTo) {
            setBillToName(billTo.name);
          }
        }

      } catch (err: any) {
        console.error('Error loading review data:', err);
        setError(err?.response?.data?.error || 'Error loading review data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [orderData.carrier, orderData.serviceType, orderData.shipToAccount, orderData.billToAccount]);

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '64vh'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error.main">{error}</Typography>
      </Box>
    );
  }

  return (
    <Card sx={{ 
      bgcolor: '#fff', 
      borderRadius: 1,
      boxShadow: 1
    }}>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3, 
                color: 'primary.main', 
                fontWeight: 'bold' 
              }}
            >
              Order Summary
            </Typography>
          </Grid>

          <ReviewOrderSummary
            orderData={orderData}
            carrierName={carrierName}
            carrierService={carrierService}
            shipToName={shipToName}
            billToName={billToName}
          />

          <Grid item xs={12}>
            <ReviewTable
              selectedItems={selectedItems}
              onRemoveItem={onRemoveItem}
              isSubmitted={isSubmitted}
            />
          </Grid>

          {orderData.orderNotes && (
            <Grid item xs={12}>
              <Paper sx={{ 
                p: 2, 
                bgcolor: 'grey.50', 
                mt: 2,
                borderRadius: 1
              }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Order Notes
                </Typography>
                <Typography variant="body2">
                  {orderData.orderNotes}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ReviewStep;