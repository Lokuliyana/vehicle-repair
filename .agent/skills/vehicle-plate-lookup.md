# Reusable Skill: Smart Vehicle Plate Lookup (vehicle-plate-lookup)

## Purpose
Provides instantaneous, non-blocking auto-completion for vehicle specifications (Make, Model, Year, Color, Chassis No) and Customer Information (Name, Phone, Address) based on historical repair jobs, eliminating CRM setup friction.

## Implementation Standard
1. As the user types in `vehicleNumber` (e.g., `CBA-1234` or `WP CA-5678`), normalize string by stripping whitespace and uppercase.
2. Query indexed past jobs for matching plate numbers.
3. If matches are found, display a subtle auto-complete suggestion pill:
   `"Found previous job for CBA-1234 (Toyota Corolla - Nimal Perera). Click to populate."`
4. On click, populate:
   - `vehicleMake`
   - `vehicleModel`
   - `yearOfMake`
   - `vehicleColor`
   - `chassisNumber`
   - `customerInfo`
5. Keep all fields 100% manually editable; never lock or prevent custom input.
