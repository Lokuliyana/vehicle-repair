import { useState } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MockVehicleHistoryRepository,
  normalizePlate,
} from '@/features/workshop/repository/vehicle-history.repository.mock';
import { VehicleLookupInput } from '@/features/workshop/components/VehicleLookupInput';
import { VehicleHistoricalRecord } from '@/features/workshop/types';

describe('Smart Vehicle Plate History Lookup', () => {
  let repo: MockVehicleHistoryRepository;

  beforeEach(async () => {
    repo = new MockVehicleHistoryRepository();
    await repo.resetToDefaults();
  });

  describe('Plate Normalization & Repository Lookup', () => {
    it('normalizes plate strings by stripping spaces, hyphens, and casing', () => {
      expect(normalizePlate('WP CBA-1234')).toBe('WPCBA1234');
      expect(normalizePlate('cba-1234')).toBe('CBA1234');
      expect(normalizePlate('  sp  kx - 7722 ')).toBe('SPKX7722');
      expect(normalizePlate('WP/CAB_4521')).toBe('WPCAB4521');
    });

    it('matches plate regardless of whitespace, hyphenation, or lowercase', async () => {
      // 1. Exact with province
      const exact = await repo.lookupByPlate('WP CBA-1234');
      expect(exact.length).toBeGreaterThanOrEqual(1);
      expect(exact[0].vehicleNumber).toBe('WP CBA-1234');

      // 2. Without province prefix and with lowercase
      const withoutProvince = await repo.lookupByPlate('cba-1234');
      expect(withoutProvince.length).toBeGreaterThanOrEqual(1);
      expect(withoutProvince[0].vehicleNumber).toBe('WP CBA-1234');

      // 3. Compact without hyphen
      const compact = await repo.lookupByPlate('cba1234');
      expect(compact.length).toBeGreaterThanOrEqual(1);
      expect(compact[0].vehicleNumber).toBe('WP CBA-1234');

      // 4. Just number
      const justNumber = await repo.lookupByPlate('1234');
      expect(justNumber.some((r) => r.vehicleNumber === 'WP CBA-1234')).toBe(true);
    });

    it('matches historical customer name or phone query', async () => {
      const byName = await repo.lookupByPlate('Nimal');
      expect(byName.length).toBeGreaterThanOrEqual(1);
      expect(byName[0].customerName).toBe('Nimal Perera');

      const byPhone = await repo.lookupByPlate('077-1234567');
      expect(byPhone.length).toBeGreaterThanOrEqual(1);
      expect(byPhone[0].vehicleNumber).toBe('WP CBA-1234');
    });

    it('returns empty array when query is less than 2 characters', async () => {
      const res = await repo.lookupByPlate('C');
      expect(res).toEqual([]);
    });

    it('saves a new vehicle record and finds it on subsequent lookup', async () => {
      const newRec: VehicleHistoricalRecord = {
        vehicleNumber: 'WP CAR-9999',
        vehicleMake: 'Mazda',
        vehicleModel: 'Axela',
        yearOfMake: '2019',
        vehicleColor: 'Soul Red',
        chassisNumber: 'BM5FP-300400',
        insuranceName: 'AIA Insurance',
        customerInfo: 'Saman Kumara - 071 999 8877 / Moratuwa',
        customerName: 'Saman Kumara',
        customerPhone: '071-9998877',
      };

      await repo.saveRecord(newRec);

      const found = await repo.lookupByPlate('car-9999');
      expect(found.length).toBe(1);
      expect(found[0].vehicleMake).toBe('Mazda');
      expect(found[0].vehicleColor).toBe('Soul Red');
    });
  });

  describe('VehicleLookupInput Component & Zero-CRM Experience', () => {
    function ControlledTestInput({
      onPopulate,
    }: {
      onPopulate: (record: VehicleHistoricalRecord) => void;
    }) {
      const [val, setVal] = useState('');
      return (
        <VehicleLookupInput
          value={val}
          onChange={setVal}
          onPopulate={onPopulate}
          label="Vehicle Number"
        />
      );
    }

    it('renders text input and allows free-form manual typing without blocking', async () => {
      const populateSpy = vi.fn();
      render(<ControlledTestInput onPopulate={populateSpy} />);

      const input = screen.getByTestId('vehicle-lookup-input');
      expect(input).toBeInTheDocument();

      fireEvent.change(input, { target: { value: 'ND-5544' } });
      expect(input).toHaveValue('ND-5544');
      // No suggestion for unknown plate
      expect(screen.queryByTestId('vehicle-suggestion-pill')).not.toBeInTheDocument();
    });

    it('displays 1-click suggestion pill when existing vehicle plate is typed', async () => {
      const populateSpy = vi.fn();
      render(<ControlledTestInput onPopulate={populateSpy} />);

      const input = screen.getByTestId('vehicle-lookup-input');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'CBA-1234' } });
      });

      await waitFor(() => {
        expect(screen.getByTestId('vehicle-suggestion-pill')).toBeInTheDocument();
      });

      // Verify pill content
      expect(screen.getByText('WP CBA-1234')).toBeInTheDocument();
      expect(screen.getByText(/Toyota Corolla Axio/i)).toBeInTheDocument();
      expect(screen.getByText(/Nimal Perera/i)).toBeInTheDocument();
      expect(screen.getByTestId('vehicle-populate-btn')).toBeInTheDocument();
    });

    it('populates full vehicle & customer record on 1-click populate button', async () => {
      let populatedRecord: VehicleHistoricalRecord | null = null;
      const onPopulate = (record: VehicleHistoricalRecord) => {
        populatedRecord = record;
      };

      render(<ControlledTestInput onPopulate={onPopulate} />);

      const input = screen.getByTestId('vehicle-lookup-input');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'CAB-4521' } });
      });

      await waitFor(() => {
        expect(screen.getByTestId('vehicle-suggestion-pill')).toBeInTheDocument();
      });

      const populateBtn = screen.getByTestId('vehicle-populate-btn');
      await act(async () => {
        fireEvent.click(populateBtn);
      });

      expect(populatedRecord).not.toBeNull();
      expect(populatedRecord!.vehicleNumber).toBe('WP CAB-4521');
      expect(populatedRecord!.vehicleMake).toBe('Honda');
      expect(populatedRecord!.vehicleModel).toBe('Vezel Hybrid Z');
      expect(populatedRecord!.yearOfMake).toBe('2017');
      expect(populatedRecord!.vehicleColor).toBe('Metallic Black');
      expect(populatedRecord!.chassisNumber).toBe('RU3-9876543');
      expect(populatedRecord!.insuranceName).toBe('Ceylinco General Insurance');
      expect(populatedRecord!.customerInfo).toContain('Kasun Perera');

      // Pill should disappear after population
      expect(screen.queryByTestId('vehicle-suggestion-pill')).not.toBeInTheDocument();
    });

    it('dismisses suggestion pill when dismiss button (X) is clicked', async () => {
      render(<ControlledTestInput onPopulate={() => {}} />);

      const input = screen.getByTestId('vehicle-lookup-input');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'CBA-1234' } });
      });

      await waitFor(() => {
        expect(screen.getByTestId('vehicle-suggestion-pill')).toBeInTheDocument();
      });

      const dismissBtn = screen.getByTestId('vehicle-suggestion-dismiss');
      await act(async () => {
        fireEvent.click(dismissBtn);
      });

      expect(screen.queryByTestId('vehicle-suggestion-pill')).not.toBeInTheDocument();
    });

    it('guarantees suggestion pill does NOT pop back up after auto-populating vehicle number', async () => {
      function RealWorldWorkbenchIntake() {
        const [plate, setPlate] = useState('');
        return (
          <VehicleLookupInput
            value={plate}
            onChange={setPlate}
            onPopulate={(rec) => setPlate(rec.vehicleNumber)}
          />
        );
      }

      render(<RealWorldWorkbenchIntake />);
      const input = screen.getByTestId('vehicle-lookup-input');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'CBA-1234' } });
      });

      await waitFor(() => {
        expect(screen.getByTestId('vehicle-suggestion-pill')).toBeInTheDocument();
      });

      const populateBtn = screen.getByTestId('vehicle-populate-btn');
      await act(async () => {
        fireEvent.click(populateBtn);
      });

      // The input should now have the full plate
      expect(input).toHaveValue('WP CBA-1234');

      // Wait past debounce period (150ms) to ensure pill does NOT reappear
      await act(async () => {
        await new Promise((r) => setTimeout(r, 200));
      });

      expect(screen.queryByTestId('vehicle-suggestion-pill')).not.toBeInTheDocument();
    });

    it('recognizes Sri Lankan vintage & classic plates (e.g. 14-1234 and 5 Sri 4567 including Sinhala script)', async () => {
      const matchBJ40 = await repo.lookupByPlate('14-1234');
      expect(matchBJ40.length).toBe(1);
      expect(matchBJ40[0].vehicleMake).toBe('Toyota');
      expect(matchBJ40[0].vehicleModel).toContain('Land Cruiser BJ40');

      const matchSriEnglish = await repo.lookupByPlate('5 sri 4567');
      expect(matchSriEnglish.length).toBe(1);
      expect(matchSriEnglish[0].vehicleMake).toBe('Austin');

      // Sinhala script input "5 ශ්‍රී 4567"
      const matchSriSinhala = await repo.lookupByPlate('5 ශ්‍රී 4567');
      expect(matchSriSinhala.length).toBe(1);
      expect(matchSriSinhala[0].vehicleNumber).toBe('5 Sri 4567');
    });
  });
});
