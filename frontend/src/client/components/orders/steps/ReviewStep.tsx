// src/components/orders/steps/ReviewStep.tsx
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Grid,
  Typography,
} from '@mui/material';
import { OrderData, InventoryItem } from '../../../../shared/types/shipping';
import { mockApi } from '../../../../shared/services/mockApi';
import Review_OrderSummary from '../../../components/orders/review/Review_OrderSummary';
import Review_Table from '../../../components/orders/review/Review_Table';
import Review_Totals from '../../../components/orders/review/Review_Totals';

interface ReviewStepProps {
  orderData: OrderData;
  selectedItems: InventoryItem[];
  onRemoveItem: (itemId: string) => void;
  isSubmitted: boolean;
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

  useEffect(() => {
    const loadData = async () => {
      const [carriers, accounts] = await Promise.all([
        mockApi.getCarriers(),
        mockApi.getAccounts(),
      ]);

      // Set carrier name
      const carrier = carriers.find(c => c.id === orderData.carrier);
      if (carrier) {
        setCarrierName(carrier.name);
      }

      // Set ship to account name
      const shipToAccount = accounts.find(a => a.id === orderData.shipToAccount);
      if (shipToAccount) {
        setShipToName(shipToAccount.name);
      }

      // Set bill to account name
      const billToAccount = accounts.find(a => a.id === orderData.billToAccount);
      if (billToAccount) {
        setBillToName(billToAccount.name);
      }
    };

    loadData();
  }, [orderData.carrier, orderData.shipToAccount, orderData.billToAccount]);

  return (
    <Card sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 'bold' }}>
              Order Summary
            </Typography>
          </Grid>

          <Review_OrderSummary
            orderData={orderData}
            carrierName={carrierName}
            shipToName={shipToName}
            billToName={billToName}
          />

          <Grid item xs={12}>
            <Review_Table
              selectedItems={selectedItems}
              onRemoveItem={onRemoveItem}
              isSubmitted={isSubmitted}
            />
          </Grid>

          <Review_Totals
            selectedItems={selectedItems}
            orderNotes={orderData.orderNotes}
          />
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ReviewStep;