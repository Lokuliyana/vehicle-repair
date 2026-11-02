import { PosSaleTransaction, CreatePosSaleDto, PosSaleFilter } from '../types';

export interface IPosSaleRepository {
  getAll(): Promise<PosSaleTransaction[]>;
  getAllSync?(): PosSaleTransaction[];
  getById(id: string): Promise<PosSaleTransaction | null>;
  getByShiftId(shiftId: string): Promise<PosSaleTransaction[]>;
  filter(filter: PosSaleFilter): Promise<PosSaleTransaction[]>;
  create(dto: CreatePosSaleDto): Promise<PosSaleTransaction>;
  getNextReceiptNumber(): Promise<string>;
  resetToDefaults(): Promise<void>;
}
