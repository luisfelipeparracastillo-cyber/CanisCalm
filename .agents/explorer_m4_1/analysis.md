# Analysis Report: Milestone 4 — Breed Encyclopedia & Pet Profile Management

**Agent**: Explorer 1 (`explorer_m4_1`)  
**Milestone**: M4 (Breed Encyclopedia & Pet Profile Management)  
**Date**: 2026-08-06  
**Status**: Investigation Complete — Architectural & Implementation Strategy Formulated  

---

## 1. Executive Summary

Milestone 4 delivers two core functional pillars of CanisCalm:
1. **Breed Encyclopedia & Multi-Criteria Filtering**: Interactive breed lookup connected to `GET /api/breeds` with search and 4 rating filters (Energy Level, Prey Drive, Sensitivity, Arousal Threshold). Visual rating indicators and individual `BreedCard.jsx` components render the 12 seeded dog breeds in Spanish.
2. **Pet Profile Management**: Full CRUD lifecycle for user dog profiles connected to REST API endpoints (`GET/POST/PUT/DELETE /api/dogs`). Features breed linking, custom trigger tag management, training goals tracking, and active dog selection for GPS walks.

The backend infrastructure (`server/routes/breeds.js`, `server/routes/dogs.js`, `server/db/schema.js`, `server/db/seed.js`) and frontend service layer (`src/services/api.js`, `src/context/AppContext.jsx`) are already fully implemented and verified. The primary remaining work for Milestone 4 consists of modularizing and expanding the frontend components:
- Splitting `BreedEncyclopedia.jsx` into a container with multi-criteria stateful filters + `BreedCard.jsx`.
- Extracting `DogFormModal.jsx` from `DogProfilesView.jsx` to support both Create and Edit operations with tag selection.
- Ensuring full visual compliance with the Calming Nature theme (Sage `#4E6E58`, Terracotta `#D97757`, Warm Cream `#FAF8F5`).

---

## 2. Evidence Chain & Codebase Investigation Findings

### Observation 2.1: Backend REST API Capability
- **`server/routes/breeds.js`**:
  - `GET /api/breeds`: Accepts query params `energy` (or `energy_level`), `prey` (or `prey_drive`), `sensitivity`, `arousal` (or `arousal_threshold`), and `search`.
  - Filters using SQL: `energy_level <= ?`, `prey_drive <= ?`, `sensitivity <= ?`, `arousal_threshold <= ?`, and `(LOWER(name) LIKE ? OR LOWER(description) LIKE ?)`.
  - Returns `200 OK` with JSON array of breed objects.
- **`server/routes/dogs.js`**:
  - `GET /api/dogs`: Returns all dog profiles left-joined with breed table. Auto-parses `triggers` and `training_goals` JSON strings into native JS arrays.
  - `POST /api/dogs`: Accepts `{ name, breed_id, age, weight, gender, photo_url, triggers, trigger_notes, comfort_distance, training_goals }`. Returns `201 Created` with formatted dog object.
  - `PUT /api/dogs/:id`: Updates fields of existing dog profile. Returns `200 OK` with updated dog object.
  - `DELETE /api/dogs/:id`: Deletes dog profile. Returns `200 OK` with `{ message, id }`.

### Observation 2.2: Existing Frontend Service & Context Integration
- **`src/services/api.js`**:
  - Contains `fetchBreeds(params)`, `fetchBreedById(id)`, `fetchDogs()`, `fetchDogById(id)`, `createDog(data)`, `updateDog(id, data)`, `deleteDog(id)`.
  - Encapsulates URL search param serialization for breed query filters.
- **`src/context/AppContext.jsx`**:
  - Exposes state: `dogs`, `activeDog`, `setActiveDog`, `breeds`, `loading`, `error`.
  - Exposes mutation actions: `loadBreeds(params)`, `loadDogs()`, `createNewDog(dogData)`, `updateExistingDog(id, dogData)`, `deleteExistingDog(id)`.

### Observation 2.3: Current Frontend Component Gaps
- **`src/components/breeds/BreedEncyclopedia.jsx`**:
  - Currently filters only locally in memory on the initial `breeds` list (`breeds.filter(...)`).
  - Lacks multi-criteria filter controls (Energy, Prey Drive, Sensitivity, Arousal Threshold) for 1-5 ratings.
  - Renders inline cards instead of using a modular `BreedCard.jsx` component.
  - `src/components/breeds/BreedCard.jsx` does NOT exist yet.
- **`src/components/profiles/DogProfilesView.jsx`**:
  - Contains inline form state and inline `<Modal>` for creation only.
  - Lacks Edit profile action (`updateExistingDog`) and edit modal trigger.
  - Handles trigger tags as simple comma-separated string rather than interactive tag selector.
  - `src/components/profiles/DogFormModal.jsx` does NOT exist yet.

---

## 3. Detailed Component & Architectural Design Strategy

### 3.1 Component 1: `BreedCard.jsx`
- **File Path**: `src/components/breeds/BreedCard.jsx`
- **Purpose**: Render an individual breed card showcasing temperament, ratings, photo placeholder, and key traits.
- **Interface & Props**:
```typescript
interface BreedCardProps {
  breed: {
    id: number;
    name: string;
    description: string;
    energy_level: number;       // 1..5
    prey_drive: number;         // 1..5
    sensitivity: number;        // 1..5
    arousal_threshold: number;  // 1..5
    image_url?: string;
  };
  onSelectBreed?: (breedId: number) => void;
}
```
- **Visual Design & UI Elements**:
  - Header: Breed name in bold Sage (`text-sage-900`), avatar / cover image (`breed.image_url` with fallback dog avatar SVG/icon).
  - Body: Temperament description (`line-clamp-3` or full text inside expandable card).
  - Rating Indicators (4 Metrics):
    1. **Nivel de Energía** (Icon: `Zap`, Amber/Sage bar 1-5)
    2. **Impulso de Presa** (Icon: `Flame`, Terracotta bar 1-5)
    3. **Sensibilidad** (Icon: `ShieldAlert`, Rose/Sage bar 1-5)
    4. **Umbral de Excitación** (Icon: `Activity`, Sage bar 1-5)
  - Rating Bar UI: 5 segment blocks or progress bar with active segments filled with theme color (`bg-sage-500` / `bg-terracotta-500`) and inactive in `bg-sage-100`.
  - Footer Action: "Ver Detalles" or "Crear Perro con esta Raza" button.

### 3.2 Component 2: `BreedEncyclopedia.jsx`
- **File Path**: `src/components/breeds/BreedEncyclopedia.jsx`
- **Purpose**: Container for breed search, 4-criteria slider/button filters, API connection, and grid rendering.
- **State Management**:
```javascript
const [searchTerm, setSearchTerm] = useState('');
const [energyFilter, setEnergyFilter] = useState(0);       // 0 = All, 1..5 = Max level
const [preyFilter, setPreyFilter] = useState(0);         // 0 = All, 1..5 = Max level
const [sensitivityFilter, setSensitivityFilter] = useState(0); // 0 = All, 1..5 = Max level
const [arousalFilter, setArousalFilter] = useState(0);     // 0 = All, 1..5 = Max level
```
- **API Flow**:
  - Effect triggers `loadBreeds({ search: searchTerm, energy: energyFilter || undefined, prey: preyFilter || undefined, sensitivity: sensitivityFilter || undefined, arousal: arousalFilter || undefined })` whenever filter state changes (debounced search input by 300ms).
- **UI Elements**:
  - Search Input: Search box with `Search` icon and clear button.
  - Multi-Criteria Filter Controls:
    - Control for each of the 4 traits (Energy, Prey Drive, Sensitivity, Arousal Threshold).
    - Button pills (1, 2, 3, 4, 5, Todos) or range sliders allowing users to filter breeds with rating `<= selectedValue`.
    - Active filter badges and a "Limpiar Filtros" (Reset All) button.
  - Results Grid: Responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`) rendering `BreedCard` for each matching breed.
  - Empty State: Calming card indicating no breeds matched the filter criteria with suggestion to reset filters.

### 3.3 Component 3: `DogFormModal.jsx`
- **File Path**: `src/components/profiles/DogFormModal.jsx`
- **Purpose**: Reusable Modal dialog for both Creating new dog profiles and Updating existing dog profiles.
- **Interface & Props**:
```typescript
interface DogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  dogToEdit?: DogObject | null; // null for Create, DogObject for Edit
  onSave: (formData: DogPayload) => Promise<void>;
  breeds: BreedObject[];
}
```
- **Form Fields & Validation**:
  - `name`: Required text input.
  - `breed_id`: Required select dropdown populated from `breeds` list.
  - `age`: Number input (years, min 0, max 25).
  - `weight`: Number input (kg, min 0, optional).
  - `gender`: Select dropdown ("Macho", "Hembra", "Otro").
  - `triggers`: Interactive tag selection featuring preset quick-tags ("Perro sin correa", "Bicis/Patinetas", "Persona/Niño", "Ruido Fuerte", "Vehículo") + custom tag entry input. Clicking a tag toggles selection; custom tags can be added/removed.
  - `trigger_notes`: Textarea for specific trigger observations/distance.
  - `comfort_distance`: Range slider or number input (meters, default 10m).
  - `training_goals`: Textarea or tag list for desensitization goals.
- **Submit Handling**:
  - Construct payload with `triggers` as array (or JSON string depending on helper) and call `onSave(payload)`.
  - Close modal on successful response; display error message if request fails.

### 3.4 Component 4: `DogProfilesView.jsx`
- **File Path**: `src/components/profiles/DogProfilesView.jsx`
- **Purpose**: Full pet profiles view for listing, selecting active dog, editing, and deleting dog profiles.
- **State & Handlers**:
  - State: `isModalOpen` (boolean), `editingDog` (DogObject | null).
  - Handlers:
    - `handleOpenCreate()`: Sets `editingDog = null`, opens modal.
    - `handleOpenEdit(dog)`: Sets `editingDog = dog`, opens modal.
    - `handleSaveDog(formData)`: If `editingDog` exists, calls `updateExistingDog(editingDog.id, formData)`; else calls `createNewDog(formData)`.
    - `handleDeleteDog(dogId)`: Shows confirmation modal/dialog and calls `deleteExistingDog(dogId)`.
    - `handleSelectActive(dog)`: Calls `setActiveDog(dog)`.
- **UI Elements**:
  - View Header: "Mis Perros" title, subtitle, and "+ Nuevo Perro" button.
  - Active Dog Highlight Banner: Prominently displays the active dog selected for walk tracking with badge "Perro Activo para Paseo".
  - Cards Grid: Render dog profile cards with:
    - Name, Breed Name, Age, Gender, Weight.
    - Active Dog Badge (`Badge variant="sage"`).
    - Trigger Tags (`Badge variant="terracotta"` for each trigger).
    - Training Goals summary.
    - Card Actions: "Seleccionar Activo" button, "Editar" icon button (`Edit2`), "Eliminar" icon button (`Trash2`).
  - Integration with `DogFormModal`.

---

## 4. UI Theme & Design System Integration

All components strictly comply with the **Calming Nature** design system defined in `PROJECT.md` and `tailwind.config.js`:
- **Palette**:
  - Primary Accent (Sage): `#4E6E58` (`sage-500`) for headers, primary buttons, active state highlights.
  - Secondary Accent (Terracotta): `#D97757` (`terracotta-500`) for trigger tags, warning accents, rating bars.
  - Warm Cream: `#FAF8F5` (`cream-100`) for background cards and page wrapper.
  - Surface: White (`#FFFFFF`) with borders `#E2E8E4` (`border-surface-border`).
- **Typography & Radii**:
  - Rounded cards (`rounded-3xl`), rounded buttons (`rounded-2xl`), rounded badges (`rounded-full`).
  - Lucide Icons for visual cues (`Zap`, `Flame`, `ShieldAlert`, `Activity`, `Dog`, `Tag`, `Plus`, `Edit2`, `Trash2`, `Check`).

---

## 5. Risk Assessment & Verification Strategy

### Risks & Mitigations
1. **API Filter Compatibility**: Backend `GET /api/breeds` checks `energy_level <= ?`. Frontend filter buttons (1-5) must match backend parameter names (`energy`, `prey`, `sensitivity`, `arousal`, `search`).
2. **Dog Triggers JSON Serialization**: `dogs.triggers` in backend DB is stored as JSON string. `server/routes/dogs.js` automatically parses `triggers` into array on GET, but accepts either JSON string or Array on POST/PUT. Frontend should send array for clean handling.
3. **Active Dog Sync**: When a dog is deleted or updated, `activeDog` state in `AppContext` must stay in sync so the Live Walk tracker doesn't hold a stale dog ID. `loadDogs()` in `AppContext` already handles auto-selecting the first available dog.

---
