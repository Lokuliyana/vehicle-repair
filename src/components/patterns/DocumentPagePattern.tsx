import React from 'react';
import { cn } from '@/utils/cn';
import { PageContainer } from '@/components/layouts';

export interface DocumentPagePatternProps {
  /**
   * Stage progression banner / status switcher (e.g., Quotation -> Estimate -> Job Card -> Invoice).
   */
  stageBanner?: React.ReactNode;
  /**
   * 12-field vehicle matrix header block (plate, make/model, customer, insurer, nature of repair, etc.).
   */
  headerMatrix: React.ReactNode;
  /**
   * Repair line items sections (Remove & Reassemble, Repair, Replacement).
   */
  repairSections: React.ReactNode;
  /**
   * Financial summary and split billing calculation block (Grand Total, Advance, Insurance Payable, Excess Due).
   */
  financialSummary: React.ReactNode;
  /**
   * Sticky bottom action footer with save, convert, print, and WhatsApp share buttons.
   */
  stickyFooter?: React.ReactNode;
  /**
   * Supplementary warning banner when supplementary line items are added to a locked estimate.
   */
  supplementaryBanner?: React.ReactNode;
  /**
   * Optional cost privacy alert banner when viewing internal margins.
   */
  costPrivacyAlert?: React.ReactNode;
  /**
   * Maximum page width for PageContainer. Default is 'wide' (max-w-[1600px]).
   */
  maxWidth?: 'standard' | 'wide' | 'full';
  className?: string;
  dataTestId?: string;
}

export function DocumentPagePattern({
  stageBanner,
  headerMatrix,
  repairSections,
  financialSummary,
  stickyFooter,
  supplementaryBanner,
  costPrivacyAlert,
  maxWidth = 'wide',
  className,
  dataTestId = 'document-page-pattern',
}: DocumentPagePatternProps) {
  return (
    <PageContainer
      maxWidth={maxWidth}
      className={cn('space-y-6 pb-24', className)}
      dataTestId={dataTestId}
    >
      {/* 1. Supplementary / Stage Alert Banners */}
      {supplementaryBanner && (
        <div data-testid="document-supplementary-banner">{supplementaryBanner}</div>
      )}
      {costPrivacyAlert && (
        <div data-testid="document-privacy-alert">{costPrivacyAlert}</div>
      )}

      {/* 2. Stage Progression & Conversion Banner */}
      {stageBanner && (
        <div data-testid="document-stage-banner">{stageBanner}</div>
      )}

      {/* 3. 12-Field Vehicle & Customer Matrix Card */}
      <section
        aria-label="Vehicle & Customer Header Details"
        className="bg-white rounded-[16px] border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] p-5 md:p-6"
        data-testid="document-header-matrix"
      >
        {headerMatrix}
      </section>

      {/* 4. Three-Section Repair Line Items (Remove & Reassemble, Repair, Replacement) */}
      <section
        aria-label="Repair Scope Line Items"
        className="space-y-6"
        data-testid="document-repair-sections"
      >
        {repairSections}
      </section>

      {/* 5. Financial Summary & Insurance Split Billing Block */}
      <section
        aria-label="Financial Summary & Split Settlement"
        className="bg-white rounded-[16px] border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] p-5 md:p-6"
        data-testid="document-financial-summary"
      >
        {financialSummary}
      </section>

      {/* 6. Sticky Bottom Action Footer (Docked to bottom edge) */}
      {stickyFooter && (
        <footer
          className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_16px_rgba(15,23,42,0.06)] px-4 sm:px-6 lg:px-8 py-3.5 no-print"
          data-testid="document-sticky-footer"
        >
          <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
            {stickyFooter}
          </div>
        </footer>
      )}
    </PageContainer>
  );
}
