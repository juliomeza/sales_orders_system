// src/client/components/orders/steps/ReviewStep.tsx
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Box
} from '@mui/material';
import { OrderData, InventoryItem } from '../../../../shared/types/shipping';
import { apiClient } from '../../../../services/api/apiClient';
import ReviewOrderSummary from '../review/ReviewOrderSummary';
import ReviewTable from '../review/ReviewTable';
import ReviewTotals from '../review/ReviewTotals';

interface ReviewStepProps {
  orderData: OrderData;
  selectedItems: InventoryItem[];
  onRemoveItem: (itemId: string) => void;
  isSubmitted: boolean;
}

interface Carrier {
  id: string;
  name: string;
  services: string[];
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
  const [shipToName, setShipToName] = useState('');
  const [billToName, setBillToName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [carriersResponse, addressesResponse] = await Promise.all([
          apiClient.get<CarriersResponse>('/carriers'),
          apiClient.get<AddressResponse>('/ship-to')
        ]);

        const carrier = carriersResponse.carriers.find(c => c.id === orderData.carrier);
        if (carrier) {
          setCarrierName(carrier.name);
        }

        const shipToAccount = addressesResponse.addresses.find(a => a.id === orderData.shipToAccount);
        if (shipToAccount) {
          setShipToName(shipToAccount.name);
        }

        const billToAccount = addressesResponse.addresses.find(a => a.id === orderData.billToAccount);
        if (billToAccount) {
          setBillToName(billToAccount.name);
        }

        setIsLoading(false);
      } catch (err: any) {
        console.error('Error loading review data:', err);
        setError(err?.response?.data?.error || 'Error loading review data');
        setIsLoading(false);
      }
    };

    loadData();
  }, [orderData.carrier, orderData.shipToAccount, orderData.billToAccount]);

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

          <ReviewTotals
            selectedItems={selectedItems}
            orderNotes={orderData.orderNotes}
          />
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ReviewStep;