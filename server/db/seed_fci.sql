-- Script SQL para actualizar la tabla 'breeds' en Supabase con Estándares Oficiales FCI
ALTER TABLE breeds ADD COLUMN IF NOT EXISTS fci_group TEXT;
ALTER TABLE breeds ADD COLUMN IF NOT EXISTS fci_standard TEXT;
ALTER TABLE breeds ADD COLUMN IF NOT EXISTS fci_origin TEXT;

-- Actualización de los datos FCI oficiales para las razas
UPDATE breeds SET 
  fci_group = 'Grupo 1: Perros de Pastor',
  fci_standard = 'FCI N° 166',
  fci_origin = 'Alemania'
WHERE name ILIKE '%Pastor Alemán%';

UPDATE breeds SET 
  fci_group = 'Grupo 1: Perros de Pastor',
  fci_standard = 'FCI N° 15',
  fci_origin = 'Bélgica'
WHERE name ILIKE '%Malinois%';

UPDATE breeds SET 
  fci_group = 'Grupo 1: Perros de Pastor',
  fci_standard = 'FCI N° 297',
  fci_origin = 'Gran Bretaña'
WHERE name ILIKE '%Border Collie%';

UPDATE breeds SET 
  fci_group = 'Grupo 8: Cobradores y Perros de Agua',
  fci_standard = 'FCI N° 111',
  fci_origin = 'Gran Bretaña'
WHERE name ILIKE '%Golden Retriever%';

UPDATE breeds SET 
  fci_group = 'Grupo 8: Cobradores y Perros de Agua',
  fci_standard = 'FCI N° 122',
  fci_origin = 'Gran Bretaña'
WHERE name ILIKE '%Labrador Retriever%';

UPDATE breeds SET 
  fci_group = 'Grupo 2: Pinscher y Schnauzer - Molosoides',
  fci_standard = 'FCI N° 147',
  fci_origin = 'Alemania'
WHERE name ILIKE '%Rottweiler%';

UPDATE breeds SET 
  fci_group = 'Grupo 3: Terriers',
  fci_standard = 'FCI N° 286',
  fci_origin = 'Estados Unidos'
WHERE name ILIKE '%Staffordshire%';

UPDATE breeds SET 
  fci_group = 'Grupo 6: Perros tipo Sabueso',
  fci_standard = 'FCI N° 163',
  fci_origin = 'Gran Bretaña'
WHERE name ILIKE '%Beagle%';

UPDATE breeds SET 
  fci_group = 'Grupo 3: Terriers',
  fci_standard = 'FCI N° 345',
  fci_origin = 'Australia / Gran Bretaña'
WHERE name ILIKE '%Jack Russell%';

UPDATE breeds SET 
  fci_group = 'Grupo 2: Pinscher y Schnauzer - Molosoides',
  fci_standard = 'FCI N° 143',
  fci_origin = 'Alemania'
WHERE name ILIKE '%Dóberman%';

UPDATE breeds SET 
  fci_group = 'Grupo 5: Perros tipo Spitz y Primitivo',
  fci_standard = 'FCI N° 257',
  fci_origin = 'Japón'
WHERE name ILIKE '%Shiba%';

UPDATE breeds SET 
  fci_group = 'Mestizo / Raza Combinada',
  fci_standard = 'No Estandarizado',
  fci_origin = 'Global'
WHERE name ILIKE '%Mestizo%';
