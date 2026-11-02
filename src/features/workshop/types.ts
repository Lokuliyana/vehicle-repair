export interface VehicleHistoricalRecord {
  vehicleNumber: string; // e.g. 'WP CBA-1234'
  vehicleMake: string;
  vehicleModel: string;
  yearOfMake: string;
  vehicleColor: string;
  chassisNumber: string;
  insuranceName: string;
  customerInfo: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  lastJobNumber?: string;
  lastServiceDate?: string;
}
