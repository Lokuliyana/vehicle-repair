import { PaymentMethod, SplitPaymentDetails } from '../types';
import { PosCollectPaymentModal } from '@/design-system/components/pos-counter-components';

export interface PosPaymentResult {
  paymentMethod: PaymentMethod;
  amountTenderedRs: number;
  changeGivenRs: number;
  splitDetails?: SplitPaymentDetails;
}

export interface PosPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  netSalesRs: number;
  customerNote: string;
  isShiftOpen: boolean;
  onCompletePayment: (result: PosPaymentResult) => void;
}

export function PosPaymentModal({
  open,
  onOpenChange,
  netSalesRs,
  customerNote,
  isShiftOpen,
  onCompletePayment,
}: PosPaymentModalProps) {
  return (
    <PosCollectPaymentModal
      open={open}
      onOpenChange={onOpenChange}
      onClose={() => onOpenChange(false)}
      netSalesRs={netSalesRs}
      totalRs={netSalesRs}
      customerNote={customerNote}
      isShiftOpen={isShiftOpen}
      onCompletePayment={(res) => {
        onCompletePayment({
          paymentMethod: res.paymentMethod || res.method || 'CASH',
          amountTenderedRs: res.amountTenderedRs !== undefined ? res.amountTenderedRs : res.tenderedRs || 0,
          changeGivenRs: res.changeGivenRs || 0,
          splitDetails: res.splitDetails,
        });
      }}
    />
  );
}
