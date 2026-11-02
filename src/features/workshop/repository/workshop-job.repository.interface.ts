import {
  WorkshopJobSheet,
  CreateWorkshopJobSheetDto,
  UpdateWorkshopJobSheetDto,
  WorkshopJobFilter,
} from '../types';

export interface IWorkshopJobRepository {
  getAll(): Promise<WorkshopJobSheet[]>;
  getAllSync?(): WorkshopJobSheet[];
  getById(id: string): Promise<WorkshopJobSheet | null>;
  getByJobNumber(jobNumber: string): Promise<WorkshopJobSheet | null>;
  create(dto: CreateWorkshopJobSheetDto): Promise<WorkshopJobSheet>;
  update(id: string, updates: UpdateWorkshopJobSheetDto): Promise<WorkshopJobSheet>;
  delete(id: string): Promise<boolean>;
  filter(filter: WorkshopJobFilter): Promise<WorkshopJobSheet[]>;
  filterSync?(filter: WorkshopJobFilter): WorkshopJobSheet[];
  getNextJobNumber(): Promise<string>;
  resetToDefaults(): Promise<void>;
}
