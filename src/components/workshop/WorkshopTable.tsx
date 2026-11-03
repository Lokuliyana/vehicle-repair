import React, { useRef, useEffect, useContext } from 'react';
import { Trash2, Plus, Lock, CheckCircle2 } from 'lucide-react';
import { RepairLineCategory, WorkshopLineItem } from '@/types';
import { formatRs, roundCurrency } from '@/utils/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';
import { AuthContext } from '@/app/providers/AuthProvider';

export interface WorkshopTableProps {
  category: RepairLineCategory;
  title: string;
  sectionNumber: number;
  items: WorkshopLineItem[];
  isCostProfitVisible?: boolean;
  isJobCardMode?: boolean;
  onItemsChange: (items: WorkshopLineItem[]) => void;
  className?: string;
}

export function WorkshopTable({
  category,
  title,
  sectionNumber,
  items,
  isCostProfitVisible = false,
  isJobCardMode = false,
  onItemsChange,
  className,
}: WorkshopTableProps) {
  const auth = useContext(AuthContext);
  // Centralized Privacy Rule: If auth context exists and role is non-management (SERVICE_ADVISOR, CASHIER, TECHNICIAN),
  // NEVER show Buying Cost and Line Profit columns regardless of isCostProfitVisible prop.
  const isPrivilegedRole = !auth || auth.role === 'OWNER' || auth.role === 'WORKSHOP_MANAGER';
  const showCostColumns = Boolean(
    isCostProfitVisible &&
    isPrivilegedRole &&
    (auth ? auth.permissions.canViewCosts && auth.permissions.canViewGrossProfit : true)
  );

  const sectionItems = items.filter((item) => item.category === category);
  const pendingFocusRowIdRef = useRef<string | null>(null);

  // Field refs for rapid keyboard navigation
  const descInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const amountInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const costInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const techInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  useEffect(() => {
    if (pendingFocusRowIdRef.current) {
      const inputEl = descInputRefs.current.get(pendingFocusRowIdRef.current);
      if (inputEl) {
        inputEl.focus();
        inputEl.select();
      }
      pendingFocusRowIdRef.current = null;
    }
  }, [sectionItems.length]);

  const handleUpdateItem = (
    id: string,
    field: keyof WorkshopLineItem,
    value: string | number | boolean
  ) => {
    const updated = items.map((item) => {
      if (item.id !== id) return item;

      if (field === 'sellingPriceRs' || field === 'buyingCostRs') {
        const valStr = String(value);
        if (valStr === '') {
          return { ...item, [field]: 0 };
        }
        const num = parseFloat(valStr);
        return { ...item, [field]: isNaN(num) ? 0 : Math.max(0, num) };
      }
      return { ...item, [field]: value };
    });
    onItemsChange(updated);
  };

  const handleAddRow = () => {
    const newId = `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newRowNo = sectionItems.length + 1;
    const newItem: WorkshopLineItem = {
      id: newId,
      rowNo: newRowNo,
      category,
      description: '',
      sellingPriceRs: 0,
      buyingCostRs: 0,
      assignedTechnician: '',
      isCompleted: false,
      isSupplementary: isJobCardMode,
    };

    pendingFocusRowIdRef.current = newId;

    // Grouping invariant: insert the new item directly after the last item of this category
    const lastCategoryIdx = items.map((it) => it.category).lastIndexOf(category);
    let updatedItems: WorkshopLineItem[];
    if (lastCategoryIdx >= 0) {
      updatedItems = [
        ...items.slice(0, lastCategoryIdx + 1),
        newItem,
        ...items.slice(lastCategoryIdx + 1),
      ];
    } else {
      const categoryOrder: Record<RepairLineCategory, number> = {
        LABOR_REMOVE_REASSEMBLE: 1,
        LABOR_REPAIR: 2,
        REPLACEMENT: 3,
      };
      const targetOrder = categoryOrder[category];
      const insertIdx = items.findIndex((it) => categoryOrder[it.category] > targetOrder);
      if (insertIdx >= 0) {
        updatedItems = [...items.slice(0, insertIdx), newItem, ...items.slice(insertIdx)];
      } else {
        updatedItems = [...items, newItem];
      }
    }

    // Maintain sequential rowNo for this category
    let count = 1;
    const finalItems = updatedItems.map((item) => {
      if (item.category === category) {
        return { ...item, rowNo: count++ };
      }
      return item;
    });

    onItemsChange(finalItems);
  };

  const handleDeleteRow = (id: string) => {
    const remaining = items.filter((item) => item.id !== id);
    let count = 1;
    const renumbered = remaining.map((item) => {
      if (item.category === category) {
        return { ...item, rowNo: count++ };
      }
      return item;
    });
    onItemsChange(renumbered);
  };

  // Keyboard navigation across cells and rows
  const handleCellKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    col: 'desc' | 'amount' | 'cost' | 'tech',
    idx: number,
    item: WorkshopLineItem
  ) => {
    // Arrow Down navigation to same column next row
    if (e.key === 'ArrowDown') {
      if (idx < sectionItems.length - 1) {
        e.preventDefault();
        const nextId = sectionItems[idx + 1].id;
        const refMap =
          col === 'desc'
            ? descInputRefs
            : col === 'amount'
            ? amountInputRefs
            : col === 'cost'
            ? costInputRefs
            : techInputRefs;
        refMap.current.get(nextId)?.focus();
      }
      return;
    }

    // Arrow Up navigation to same column previous row
    if (e.key === 'ArrowUp') {
      if (idx > 0) {
        e.preventDefault();
        const prevId = sectionItems[idx - 1].id;
        const refMap =
          col === 'desc'
            ? descInputRefs
            : col === 'amount'
            ? amountInputRefs
            : col === 'cost'
            ? costInputRefs
            : techInputRefs;
        refMap.current.get(prevId)?.focus();
      }
      return;
    }

    // Enter navigation: advance or append
    if (e.key === 'Enter') {
      e.preventDefault();
      if (col === 'desc') {
        if (isJobCardMode) {
          techInputRefs.current.get(item.id)?.focus();
        } else {
          amountInputRefs.current.get(item.id)?.focus();
        }
      } else if (col === 'amount') {
        if (showCostColumns) {
          costInputRefs.current.get(item.id)?.focus();
        } else if (idx < sectionItems.length - 1) {
          const nextId = sectionItems[idx + 1].id;
          descInputRefs.current.get(nextId)?.focus();
        } else {
          handleAddRow();
        }
      } else if (col === 'cost' || col === 'tech') {
        if (idx < sectionItems.length - 1) {
          const nextId = sectionItems[idx + 1].id;
          descInputRefs.current.get(nextId)?.focus();
        } else {
          handleAddRow();
        }
      }
    }
  };

  // Section subtotals
  const sectionSubtotalSelling = roundCurrency(
    sectionItems.reduce((acc, curr) => acc + (Number(curr.sellingPriceRs) || 0), 0)
  );
  const sectionSubtotalCost = roundCurrency(
    sectionItems.reduce((acc, curr) => acc + (Number(curr.buyingCostRs) || 0), 0)
  );
  const sectionProfit = roundCurrency(sectionSubtotalSelling - sectionSubtotalCost);

  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-900/[0.06] bg-white shadow-xs overflow-hidden mb-5',
        className
      )}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between bg-slate-900 py-2 px-4 text-white">
        <div className="flex items-center space-x-2.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-slate-200 border border-slate-700">
            {sectionNumber}
          </span>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">{title}</h4>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium border border-slate-700">
            {sectionItems.length} {sectionItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {!isJobCardMode && (
            <div className="text-xs font-semibold text-emerald-400 font-sans tabular-nums">
              {formatRs(sectionSubtotalSelling)}
            </div>
          )}
          <button
            type="button"
            onClick={handleAddRow}
            className="h-6 text-[11px] px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 inline-flex items-center gap-1 transition-colors cursor-pointer"
            title="Add new row"
          >
            <Plus className="w-3 h-3 text-emerald-400" />
            <span>+ Add Row</span>
          </button>
        </div>
      </div>

      {/* High-Contrast Dense Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-medium text-slate-500">
              <th className="w-14 px-2.5 py-2 text-center border-r border-slate-200">No.</th>
              <th className="px-3 py-2 border-r border-slate-200">Description</th>

              {isJobCardMode ? (
                <>
                  <th className="w-48 px-2.5 py-2 border-r border-slate-200">
                    Assigned Technician
                  </th>
                  <th className="w-24 px-2.5 py-2 text-center border-r border-slate-200">
                    Completed
                  </th>
                </>
              ) : (
                <>
                  <th className="w-36 px-2.5 py-2 text-right border-r border-slate-200">
                    Amount (Rs.)
                  </th>
                  {showCostColumns && (
                    <>
                      <th className="w-36 px-2.5 py-2 text-right border-r border-emerald-200 bg-emerald-50/40 text-emerald-950 font-sans font-medium">
                        <Lock className="inline w-3 h-3 mr-1 text-emerald-600" />
                        Buying cost (Rs.)
                      </th>
                      <th className="w-36 px-2.5 py-2 text-right border-r border-emerald-200 bg-emerald-50/40 text-emerald-950 font-medium">
                        Line profit
                      </th>
                    </>
                  )}
                </>
              )}

              <th className="w-14 px-2 py-2 text-center no-print">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sectionItems.length === 0 ? (
              <tr>
                <td
                  colSpan={isJobCardMode ? 5 : showCostColumns ? 6 : 4}
                  className="py-6 text-center text-xs text-slate-400 italic bg-slate-50/50"
                >
                  No line items in this section. Press "+ Add Row" or press Enter.
                </td>
              </tr>
            ) : (
              sectionItems.map((item, idx) => {
                const lineProfit = roundCurrency(
                  (Number(item.sellingPriceRs) || 0) - (Number(item.buyingCostRs) || 0)
                );
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors focus-within:bg-slate-50"
                  >
                    {/* Row No */}
                    <td className="px-2.5 py-1 text-center text-xs font-mono font-bold text-slate-500 border-r border-slate-200 bg-slate-50/60">
                      {String(idx + 1).padStart(2, '0')}
                    </td>

                    {/* Description (Zero-chrome inline input) */}
                    <td className="px-2 py-1 border-r border-slate-200">
                      <div className="flex items-center gap-1.5">
                        {item.isSupplementary && (
                          <span
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shrink-0 uppercase tracking-tight"
                            data-testid={`supplementary-badge-${item.id}`}
                          >
                            Supplementary
                          </span>
                        )}
                        <Input
                          ref={(el) => {
                            if (el) descInputRefs.current.set(item.id, el);
                            else descInputRefs.current.delete(item.id);
                          }}
                          value={item.description}
                          onChange={(e) =>
                            handleUpdateItem(item.id, 'description', e.target.value)
                          }
                          onKeyDown={(e) => handleCellKeyDown(e, 'desc', idx, item)}
                          placeholder="Enter repair or replacement item description..."
                          className="h-8 text-xs border border-transparent hover:border-slate-300 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400 bg-transparent rounded-md transition-all"
                          data-testid={`desc-input-${item.id}`}
                        />
                      </div>
                    </td>

                    {isJobCardMode ? (
                      <>
                        {/* Assigned Technician */}
                        <td className="px-2 py-1 border-r border-slate-200">
                          <Input
                            ref={(el) => {
                              if (el) techInputRefs.current.set(item.id, el);
                              else techInputRefs.current.delete(item.id);
                            }}
                            value={item.assignedTechnician || ''}
                            onChange={(e) =>
                              handleUpdateItem(item.id, 'assignedTechnician', e.target.value)
                            }
                            onKeyDown={(e) => handleCellKeyDown(e, 'tech', idx, item)}
                            placeholder="Assign technician..."
                            className="h-8 text-xs border border-transparent hover:border-slate-300 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400 bg-transparent rounded-md transition-all"
                            data-testid={`tech-input-${item.id}`}
                          />
                        </td>
                        {/* Completed Checkbox */}
                        <td className="px-2 py-1 text-center border-r border-slate-200">
                          <input
                            type="checkbox"
                            checked={item.isCompleted}
                            onChange={(e) =>
                              handleUpdateItem(item.id, 'isCompleted', e.target.checked)
                            }
                            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 cursor-pointer"
                            data-testid={`completed-check-${item.id}`}
                          />
                        </td>
                      </>
                    ) : (
                      <>
                        {/* Selling Price / Customer Amount */}
                        <td className="px-2 py-1 border-r border-slate-200 text-right">
                          <Input
                            ref={(el) => {
                              if (el) amountInputRefs.current.set(item.id, el);
                              else amountInputRefs.current.delete(item.id);
                            }}
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.sellingPriceRs === 0 ? '' : item.sellingPriceRs}
                            onChange={(e) =>
                              handleUpdateItem(item.id, 'sellingPriceRs', e.target.value)
                            }
                            onKeyDown={(e) => handleCellKeyDown(e, 'amount', idx, item)}
                            placeholder="0.00"
                            className="h-8 text-xs text-right font-medium font-sans tabular-nums border border-transparent hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 bg-transparent rounded-md transition-all"
                            data-testid={`amount-input-${item.id}`}
                          />
                        </td>

                        {/* Admin Buying Cost (Smoothly revealed with mint tint) */}
                        {showCostColumns && (
                          <>
                            <td className="px-2 py-1 border-r border-emerald-200 bg-emerald-50/40 text-right">
                              <Input
                                ref={(el) => {
                                  if (el) costInputRefs.current.set(item.id, el);
                                  else costInputRefs.current.delete(item.id);
                                }}
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.buyingCostRs === 0 ? '' : item.buyingCostRs}
                                onChange={(e) =>
                                  handleUpdateItem(item.id, 'buyingCostRs', e.target.value)
                                }
                                onKeyDown={(e) => handleCellKeyDown(e, 'cost', idx, item)}
                                placeholder="0.00"
                                className="h-8 text-xs text-right font-medium font-sans tabular-nums border border-transparent hover:border-emerald-300 focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 bg-transparent text-emerald-900 rounded-md transition-all"
                                data-testid={`cost-input-${item.id}`}
                              />
                            </td>
                            <td className="px-2.5 py-1 border-r border-emerald-200 bg-emerald-50/40 text-right text-xs font-semibold">
                              <span
                                className={cn(
                                  'font-sans tabular-nums font-semibold',
                                  lineProfit >= 0 ? 'text-emerald-700' : 'text-red-700'
                                )}
                              >
                                {formatRs(lineProfit)}
                              </span>
                              {item.sellingPriceRs > 0 && (
                                <span className="block text-[10px] font-sans tabular-nums text-emerald-800 font-bold">
                                  ({Math.round((lineProfit / item.sellingPriceRs) * 100)}%)
                                </span>
                              )}
                            </td>
                          </>
                        )}
                      </>
                    )}

                    {/* Delete action */}
                    <td className="px-2 py-1 text-center no-print">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteRow(item.id)}
                        className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Remove row"
                        data-testid={`delete-btn-${item.id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Section Footer */}
          <tfoot>
            <tr className="border-t border-slate-300 bg-slate-50/90 font-medium text-xs text-slate-700">
              <td colSpan={2} className="px-3 py-2">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddRow}
                    className="h-7 text-xs border-dashed border-slate-400 text-slate-700 hover:border-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    data-testid={`add-row-btn-${category}`}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5 text-[#F95700]" />{' '}
                    {isJobCardMode
                      ? '+ Add Supplementary Item'
                      : '+ Add Row'}
                  </Button>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Press Enter ↵ in any row to add line
                  </span>
                </div>
              </td>

              {isJobCardMode ? (
                <td colSpan={2} className="px-3 py-2 text-right text-slate-500">
                  <div className="flex items-center justify-end space-x-1 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      {sectionItems.filter((i) => i.isCompleted).length} /{' '}
                      {sectionItems.length} completed
                    </span>
                  </div>
                </td>
              ) : (
                <>
                  <td className="px-3 py-2 text-right font-bold font-sans tabular-nums text-slate-900 border-r border-slate-200">
                    {formatRs(sectionSubtotalSelling)}
                  </td>
                  {showCostColumns && (
                    <>
                      <td className="px-3 py-2 text-right font-bold font-sans tabular-nums text-emerald-950 bg-emerald-50/60 border-r border-emerald-200">
                        {formatRs(sectionSubtotalCost)}
                      </td>
                      <td className="px-3 py-2 text-right font-bold font-sans tabular-nums text-emerald-800 bg-emerald-50/60">
                        {formatRs(sectionProfit)}
                      </td>
                    </>
                  )}
                </>
              )}

              <td className="no-print"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
