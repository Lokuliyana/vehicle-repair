import React from 'react';
import { WorkshopJobSheet } from '@/types';
import { A4WorkshopPrint } from './A4WorkshopPrint';

export interface A4PriceRedactedJobCardPrintProps {
  jobSheet: WorkshopJobSheet;
  className?: string;
}

/**
 * Dedicated A4PriceRedactedJobCardPrint
 * Workshop Floor Job Card printout with 100% price and cost redaction.
 * Strips all Rs. columns and displays Assigned Technician, Part Issued [ ],
 * and Task Completed [ ] sign-off boxes.
 */
export const A4PriceRedactedJobCardPrint = React.forwardRef<HTMLDivElement, A4PriceRedactedJobCardPrintProps>(
  ({ jobSheet, className }, ref) => {
    return (
      <A4WorkshopPrint
        ref={ref}
        jobSheet={{
          ...jobSheet,
          docStage: 'JOB_CARD',
        }}
        className={className}
      />
    );
  }
);

A4PriceRedactedJobCardPrint.displayName = 'A4PriceRedactedJobCardPrint';
