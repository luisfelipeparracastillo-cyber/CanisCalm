# Milestone 4 Architectural & Technical Analysis: Breed Encyclopedia & Pet Profile Management

**Agent**: Explorer 2  
**Milestone**: Milestone 4 (Breed Encyclopedia & Pet Profile Management)  
**Date**: 2026-08-06  
**Working Directory**: `c:/Users/User/OneDrive/Desktop/CanisReact/KiraAI/diplomado/Antigravity/.agents/explorer_m4_2`

---

## 1. Executive Summary

Milestone 4 delivers two core functional hubs for CanisCalm:
1. **Breed Encyclopedia & Multi-Criteria Filtering System (`BreedEncyclopedia.jsx` & `BreedCard.jsx`)**: An interactive encyclopedia backed by the SQLite `breeds` table (12 seeded breeds in Spanish), featuring real-time multi-criteria filtering on 4 behavioral metrics (Energy Level, Prey Drive, Sensitivity, Arousal Threshold) plus keyword search.
2. **Pet Profile Management Hub (`DogProfilesView.jsx` & `DogFormModal.jsx`)**: Full CRUD pet management allowing users to create, read, update, and delete dog profiles. Dogs are linked to seeded database breeds, feature custom trigger tag chips ("Dog off leash", "Bike/Skateboard", "Person/Child", etc.), training goals, and can be designated as the active dog for live walk tracking.

The backend Express REST endpoints (`/api/breeds`, `/api/dogs`, `POST /api/dogs`, `PUT /api/dogs/:id`, `DELETE /api/dogs/:id`) are fully implemented and verified in `server/routes/breeds.js` and `server/routes/dogs.js`. The frontend services in `src/services/api.js` and state manager in `src/context/AppContext.jsx` provide the data access layer.

This document details the exact architectural requirements, missing component abstractions, state flows, prop interfaces, UI styling guidelines under the Calming Nature theme, and step-by-step verification procedures.

---

## 2. Codebase Investigation & Current State Assessment

### 2.1 Backend Schema & Endpoints Assessment

- **Database Tables (`server/db/schema.js`)**:
  - `breeds`: `id`, `name`, `description`, `energy_level` (1-5), `prey_drive` (1-5), `sensitivity` (1-5), `arousal_threshold` (1-5), `image_url`, `created_at`.
  - `dogs`: `id`, `name`, `breed_id` (FK to `breeds`), `age`, `weight`, `gender`, `photo_url`, `triggers` (JSON string array), `trigger_notes`, `comfort_distance`, `training_goals` (JSON string array), `created_at`, `updated_at`.
  - Indexed on `breeds` (energy, prey, sensitivity, arousal) and `dogs(breed_id)`.
- **Seeded Breeds (`server/db/seed.js`)**:
  - 12 breeds in Spanish: Pastor Alemán, Pastor Belga Malinois, Border Collie, Golden Retriever, Labrador Retriever, Rottweiler, American Staffordshire Terrier, Beagle, Jack Russell Terrier, Dóberman Pinscher, Shiba Inu, Mestizo (Criollo).
  - Seeded mock dog: "Kira" (Pastor Alemán, age 3, triggers: `['Dog off leash', 'Bike/Skateboard', 'Loud Noise']`).

- **API Route Contracts (`server/routes/breeds.js` & `server/routes/dogs.js`)**:
  - `GET /api/breeds`: Accepts `?energy=N&prey=N&sensitivity=N&arousal=N&search=STRING`. Applies SQLite filters: `energy_level <= N`, `prey_drive <= N`, `sensitivity <= N`, `arousal_threshold <= N`, and `(LOWER(name) LIKE %term% OR LOWER(description) LIKE %term%)`.
  - `GET /api/dogs`: Returns array of dog records formatted with `breed` nested object and parsed `triggers` & `training_goals` arrays.
  - `POST /api/dogs`: Accepts `{ name, breed_id, age, weight, gender, photo_url, triggers, trigger_notes, comfort_distance, training_goals }`. Returns `201 Created` with created dog object.
  - `PUT /api/dogs/:id`: Updates fields selectively with `COALESCE`. Returns updated dog object.
  - `DELETE /api/dogs/:id`: Deletes dog profile, returns `{ message, id }`.

### 2.2 Frontend Infrastructure Assessment

- **`src/services/api.js`**:
  - Contains `fetchBreeds(params)`, `fetchBreedById(id)`, `fetchDogs()`, `createDog(data)`, `updateDog(id, data)`, `deleteDog(id)`.
- **`src/context/AppContext.jsx`**:
  - Exposes `dogs`, `activeDog`, `setActiveDog`, `breeds`, `loadBreeds(params)`, `createNewDog(dogData)`, `updateExistingDog(id, dogData)`, `deleteExistingDog(id)`.
- **`src/components/breeds/BreedEncyclopedia.jsx`**:
  - Currently a monolithic placeholder with local client-side string filtering on breed name.
  - **Gaps**: Lacks 4-criteria slider/button filters for Energy, Prey Drive, Sensitivity, Arousal; lacks backend query parameter integration on filter change; lacks modular `BreedCard.jsx` component; lacks visual rating bars/radars and image avatar fallbacks.
- **`src/components/profiles/DogProfilesView.jsx`**:
  - Currently has simple dog list display and basic inline create form inside modal.
  - **Gaps**: Lacks separate `DogFormModal.jsx` component; lacks Edit profile (`PUT /api/dogs/:id`) modal workflow; lacks interactive custom trigger tag manager (adding preset/custom chips with remove buttons); lacks training goals list editor; lacks delete confirmation dialog.

---

## 3. Component Architecture & Design Specifications

### 3.1 Breed Encyclopedia & Multi-Criteria Filtering Architecture

#### File Structure
- `src/components/breeds/BreedEncyclopedia.jsx`: Main view container containing search input, multi-criteria filter panel (collapsible or grid of 4 metric controls), active filter badges, reset action, and grid of breed cards.
- `src/components/breeds/BreedCard.jsx`: Dedicated card component for displaying an individual breed profile.

#### Filter Control Specifications (`BreedEncyclopedia.jsx`)
- **4 Filter Metrics**:
  1. **Nivel de Energía (Energy Level)**: 1-5 scale. Filter condition: `energy_level <= selected_val`.
  2. **Impulso de Presa (Prey Drive)**: 1-5 scale. Filter condition: `prey_drive <= selected_val`.
  3. **Sensibilidad (Sensitivity)**: 1-5 scale. Filter condition: `sensitivity <= selected_val`.
  4. **Umbral de Excitación (Arousal Threshold)**: 1-5 scale. Filter condition: `arousal_threshold <= selected_val`.
- **Filter UI Mechanism**:
  - Each metric features a 5-step rating button group (1, 2, 3, 4, 5, or "Cualquiera" [5]) or slider. Button groups (1-5 pills) provide optimal mobile accessibility and instant feedback.
  - Metric icons:
    - Energy Level: `Zap` (Amber color `#F59E0B`)
    - Prey Drive: `Flame` (Terracotta color `#D97757`)
    - Sensitivity: `ShieldAlert` (Rose color `#F43F5E`)
    - Arousal Threshold: `Activity` (Sage color `#4E6E58`)
  - Debounced backend sync: When filter states change, trigger `loadBreeds({ energy, prey, sensitivity, arousal, search })` with 300ms debounce for text search and instant dispatch for rating buttons.

#### Breed Card Specification (`BreedCard.jsx`)
- **Props Contract**:
```typescript
interface BreedCardProps {
  breed: {
    id: number;
    name: string;
    description: string;
    energy_level: number;
    prey_drive: number;
    sensitivity: number;
    arousal_threshold: number;
    image_url?: string;
  };
  onSelectForDog?: (breed: Breed) => void;
}
```
- **Visual Design**:
  - **Header**: Spanish breed name (`breed.name`), image avatar (64x64px thumbnail with fallback dog icon avatar if `image_url` fails or is missing), and group badge ("Trabajo", "Pastor", "Terrier", etc.).
  - **Description**: Truncated 3-line description text with expanding "Ver más" tooltip or toggle.
  - **Rating Progress Bars**: Visual 5-segment rating bar or mini progress bar for each metric:
    - Energy Level: `breed.energy_level` / 5 (Amber filled blocks)
    - Prey Drive: `breed.prey_drive` / 5 (Terracotta filled blocks)
    - Sensitivity: `breed.sensitivity` / 5 (Rose filled blocks)
    - Arousal Threshold: `breed.arousal_threshold` / 5 (Sage filled blocks)
  - **Action Button**: "Crear Perro con esta Raza" -> switches tab to `profiles` and pre-fills `breed_id` in `DogFormModal`.

---

### 3.2 Pet Profile Management Architecture

#### File Structure
- `src/components/profiles/DogProfilesView.jsx`: Main pet manager view listing dog profile cards, active dog selector banner, "Nuevo Perro" button, and delete modal handler.
- `src/components/profiles/DogFormModal.jsx`: Reusable modal component for both Create (`POST /api/dogs`) and Edit (`PUT /api/dogs/:id`) modes.

#### Dog Form Modal Specification (`DogFormModal.jsx`)
- **Props Contract**:
```typescript
interface DogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  dogToEdit?: DogProfile | null; // null for create mode, object for edit mode
  breeds: Breed[];
  onSave: (dogData: Partial<DogProfile>) => Promise<void>;
}
```
- **Form Fields & Controls**:
  1. **Nombre (Name)**: Text input, required.
  2. **Raza (Breed)**: Select dropdown options populated with `breeds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)`. When selected, renders mini preview chip of the breed's ratings.
  3. **Edad (Age)**: Number input (0-25 years).
  4. **Peso (Weight in kg)**: Number input (0-100 kg, step 0.5).
  5. **Género (Gender)**: Select dropdown ("Macho", "Hembra", "Macho Castrado", "Hembra Esterilizada").
  6. **Distancia de Confort (Comfort Distance in meters)**: Number input (default 10m).
  7. **Desencadenantes (Custom Trigger Tags)**:
     - Interactive tag chip bar.
     - **Preset buttons**: "Perro sin correa", "Bicicletas/Patinetas", "Persona/Niño", "Ruido Fuerte", "Vehículos". Clicking a preset toggles it in the active triggers array.
     - **Custom tag input**: Input box + "Agregar" button to add user-defined triggers ("Gatos", "Patinetes", etc.).
     - Active trigger chips display with a cross icon (`X`) to remove.
  8. **Metas de Entrenamiento (Training Goals)**:
     - Multi-line textarea or bullet tag list ("Reducción de latidos...", "Desensibilización con método LAT...", etc.).
  9. **Notas de Detonantes (Trigger Notes)**: Textarea for contextual observations.

- **Payload Formatting**:
  - `triggers`: Array of strings, serialized as JSON array or sent as array (backend accepts both).
  - `training_goals`: Array of strings or multi-line string.

#### Dog Profile Card Specification (`DogProfilesView.jsx`)
- **Visual Design**:
  - **Active Dog Indicator**: Sage border highlight (`border-sage-500 ring-4 ring-sage-100`) and "PERRO ACTIVO PARA PASEOS" badge when `activeDog?.id === dog.id`.
  - **Avatar & Header**: Initial circle or photo URL, dog name, breed name (linked to breed info), age, gender, weight.
  - **Comfort Distance Badge**: e.g., "Zona de confort: 10m".
  - **Triggers Chip Bar**: Badges using `Badge` component with `variant="terracotta"`.
  - **Training Goals Section**: Structured list or formatted paragraph.
  - **Card Footer Actions**:
    - **"Seleccionar para Paseos" Button**: Sets active dog in `AppContext`.
    - **"Editar" Button**: Opens `DogFormModal` with `dogToEdit={dog}`.
    - **"Eliminar" Button**: Triggers confirmation dialog before calling `deleteExistingDog(dog.id)`.

---

### 3.3 UI Integration & Calming Nature Theme

All components strictly implement the Calming Nature design system tokens specified in `tailwind.config.js`:

| Component Element | Color Token | Hex Code / Tailwind Class |
|---|---|---|
| Page Background | Warm Cream | `#FAF8F5` (`bg-cream-100`) |
| Primary Accent / Active States | Sage | `#4E6E58` (`bg-sage-500`, `text-sage-800`) |
| Secondary Accent / Trigger Badges | Terracotta | `#D97757` (`bg-terracotta-500`, `bg-terracotta-100`) |
| Metric - Energy | Amber | `#F59E0B` (`text-amber-500`, `bg-amber-100`) |
| Metric - Sensitivity | Rose | `#F43F5E` (`text-rose-500`, `bg-rose-100`) |
| Metric - Arousal | Sage | `#4E6E58` (`text-sage-600`, `bg-sage-100`) |
| Metric - Prey Drive | Terracotta | `#D97757` (`text-terracotta-500`, `bg-terracotta-100`) |
| Card Containers | White + Soft Border | `#FFFFFF`, `rounded-3xl border border-surface-border shadow-soft` |

---

## 4. Verification Strategy & Test Commands

To verify implementation integrity without modifying source files during exploration:
1. **Express Server & REST Endpoints Verification**:
   - `node server/verify-backend.js` (Checks backend API responsiveness, breed queries, dog CRUD operations).
2. **Frontend Production Build Verification**:
   - `npm run build` (Ensures Vite compiles JSX, imports, and Tailwind classes without syntax errors or missing dependencies).
3. **Database Pre-population Integrity**:
   - Query `/api/breeds` to verify 12 Spanish breeds loaded with ratings 1-5.
   - Query `/api/dogs` to verify mock dog "Kira" with breed details joined correctly.

