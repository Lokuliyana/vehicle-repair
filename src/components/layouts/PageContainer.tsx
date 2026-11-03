import React, { createContext, useContext } from 'react';
import { cn } from '@/utils/cn';

export const PageContainerContext = createContext<boolean>(false);

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxWidth?: 'standard' | 'wide' | 'full' | 'narrow' | 'compact';
  padding?: 'standard' | 'tight' | 'loose' | 'none';
  spacing?: 'standard' | 'tight' | 'loose' | 'none';
  fullHeight?: boolean;
  preventNestedPadding?: boolean;
  className?: string;
  dataTestId?: string;
  'data-testid'?: string;
}

const MAX_WIDTH_MAP = {
  standard: 'max-w-7xl mx-auto',
  wide: 'max-w-[1600px] mx-auto',
  full: 'w-full max-w-full',
  narrow: 'max-w-4xl mx-auto',
  compact: 'max-w-5xl mx-auto',
};

const PADDING_MAP = {
  standard: 'px-4 sm:px-6 lg:px-8 py-6 sm:py-8',
  tight: 'px-3 sm:px-4 py-4',
  loose: 'px-6 sm:px-10 lg:px-12 py-8 sm:py-10',
  none: 'p-0',
};

const SPACING_MAP = {
  standard: 'space-y-6',
  tight: 'space-y-4',
  loose: 'space-y-8',
  none: 'space-y-0',
};

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = 'standard',
  padding = 'standard',
  spacing = 'standard',
  fullHeight = false,
  preventNestedPadding = true,
  className,
  dataTestId = 'page-container',
  ...rest
}) => {
  const isInsideParentContainer = useContext(PageContainerContext);
  const resolvedTestId = rest['data-testid'] || dataTestId;

  // Invariant: Prevent accidental double padding when nested inside another PageContainer
  const effectivePadding =
    preventNestedPadding && isInsideParentContainer ? 'p-0' : PADDING_MAP[padding];
  const effectiveMaxWidth =
    preventNestedPadding && isInsideParentContainer ? 'w-full' : MAX_WIDTH_MAP[maxWidth];

  return (
    <PageContainerContext.Provider value={true}>
      <div
        data-testid={resolvedTestId}
        className={cn(
          'w-full max-w-full overflow-x-hidden transition-all duration-150',
          effectiveMaxWidth,
          effectivePadding,
          SPACING_MAP[spacing],
          fullHeight && 'min-h-[calc(100vh-4rem)] flex flex-col',
          className
        )}
        {...rest}
      >
        {children}
      </div>
    </PageContainerContext.Provider>
  );
};
