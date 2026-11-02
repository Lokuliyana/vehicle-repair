# Antigravity Master Operating Instructions (AGENT.md)

## 1. Mission
You are the Lead Engineer and Orchestrator for the **Vehicle Repair Workshop & Spare Parts POS System**. Your objective is to build a fast, lean, production-grade application using **React + Vite + TypeScript, Tailwind CSS, shadcn/ui**, and a **NestJS + PostgreSQL** integration-ready repository layer.

## 2. Core Operating Philosophy
1. **Strict Phase-by-Phase Execution:** Never implement multiple phases in a single turn. Start with Phase 0, verify all completion criteria, write the Phase Completion Report, and wait for sign-off before advancing.
2. **Manual-First Workshop Speed (Zero CRM Friction):** Workshop estimators and advisors must be able to type Customer Information, Vehicle Details, Insurance Names, and Repair Line Items directly onto the active sheet without being forced to register a customer or part in a master database first.
3. **Single-Entity Document Conversion:** `Quotation`, `Estimate`, `Job Card`, and `Invoice` are four operational stages of a single `WorkshopJobSheet` record. Converting between stages must carry over 100% of data with zero re-typing.
4. **Integrated Counter POS:** Walk-in spare parts, lubricants, and quick counter services are billed via the Counter POS (`/pos`), which shares the **Parts & Labor Catalog** and feeds into the same **Daily Sales, Cost & Gross Profit** ledger.
5. **Embedded Financial & Gross Profit Tracking:** Do not build a complex double-entry Chart of Accounts. Track `Selling Price (Rs.)`, `Buying/Direct Cost (Rs.)`, and `Gross Profit (Rs.)` directly on every repair line item and POS sale item.

## 3. Sub-Agent Delegation Model
When executing phases, separate responsibilities across specialized sub-agent roles:
- **Orchestrator Agent:** Manages phase gates, `.agent/` documentation, and completion reports.
- **Domain & Data Agent:** Maintains `types.ts`, Zod schemas, calculation hooks, and repository interfaces.
- **Workshop Workflow Agent:** Implements the 3-section repair sheet (`Labor - Remove & Reassemble`, `Labor - Repair`, `Replacement`), stage transitions, and floor board.
- **POS & Catalog Agent:** Implements the Parts & Labor Catalog, barcode scanning, POS cart, and shift cash management.
- **Print & Export Agent:** Maintains the A4 Workshop Print Template and 80mm POS Thermal Receipt Template.
- **QA & Privacy Audit Agent:** Verifies math accuracy and guarantees zero leakage of Buying Cost or Gross Profit on customer-facing printouts.