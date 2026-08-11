# Analysis Report — Milestone 4: Breed Encyclopedia & Pet Profile Management

## 1. Context & Objectives

Milestone 4 of CanisCalm focuses on two core domains:
1. **Breed Encyclopedia & Multi-Criteria Filtering**: Providing reactive dog owners with a temperament database of dog breeds to understand breed-specific behavioral traits (Energy Level, Prey Drive, Sensitivity, Arousal Threshold) and filter breeds based on multi-criteria ratings.
2. **Pet Profile Management**: Enabling full CRUD management for user dog profiles, linking dogs to seeded breeds, managing custom reactivity trigger tags, setting comfort distances and training goals, and selecting the active dog for live walk tracking.

---

## 2. Existing Codebase Analysis

### 2.1 Backend Architecture & APIs (`server/`)
- **Database Schema (`server/db/schema.js`)**:
  - `breeds` table: `id`, `name`, `description`, `energy_level` (1-5), `prey_drive` (1-5), `sensitivity` (1-5), `arousal_threshold` (1-5), `image_url`, `created_at`. Indexed by rating columns.
  - `dogs` table: `id`, `name`, `breed_id` (FK to `breeds`), `age`, `weight`, `gender`, `photo_url`, `triggers` (JSON string), `trigger_notes`, `comfort_distance`, `training_goals` (JSON string/text), `created_at`, `updated_at`.
- **Seeded Breed Data (`server/db/seed.js`)**:
  - Contains 12 seeded dog breeds with Spanish names and detailed behavioral descriptions (e.g. *Pastor Alemán*, *Pastor Belga Malinois*, *Border Collie*, *Golden Retriever*, *Labrador Retriever*, *Rottweiler*, *American Staffordshire Terrier*, *Beagle*, *Jack Russell Terrier*, *Dóberman Pinscher*, *Shiba Inu*, *Mestizo*).
- **REST Endpoints**:
  - `GET /api/breeds`: Implemented in `server/routes/breeds.js`. Accepts query params `energy`, `prey`, `sensitivity`, `arousal`, and `search`. Filters using `WHERE energy_level <= ? AND prey_drive <= ? AND sensitivity <= ? AND arousal_threshold <= ? AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ?)`.
  - `GET /api/dogs`, `POST /api/dogs`, `PUT /api/dogs/:id`, `DELETE /api/dogs/:id`: Implemented in `server/routes/dogs.js`. Handles JSON parsing of `triggers` and `training_goals`, performs SQL LEFT JOIN with `breeds` to return nested breed details.

### 2.2 Frontend Foundation (`src/`)
- **API Client (`src/services/api.js`)**:
  - `fetchBreeds(params)`: Encodes query string for `search`, `energy`, `prey`, `sensitivity`, `arousal`.
  - `fetchDogs()`, `createDog(data)`, `updateDog(id, data)`, `deleteDog(id)`: Full REST bindings to backend endpoints.
- **Global State (`src/context/AppContext.jsx`)**:
  - Manages `dogs`, `activeDog`, `setActiveDog`, `breeds`, `loadBreeds`, `createNewDog`, `updateExistingDog`, `deleteExistingDog`.
  - Auto-selects the first dog if none is active.
- **Current UI Components**:
  - `BreedEncyclopedia.jsx`: Basic text search input, needs multi-criteria 1-5 sliders/buttons for all 4 temperamental attributes and extraction of `BreedCard.jsx`.
  - `DogProfilesView.jsx`: Basic display and inline creation modal. Needs extraction of `DogFormModal.jsx` for full CRUD (Create, Edit, Delete), trigger tag manager chips, breed selector, and active dog selection.

---

## 3. Detailed Component & Implementation Strategy

### 3.1 `BreedCard.jsx` (`src/components/breeds/BreedCard.jsx`)
- **Responsibilities**: Visual card for displaying an individual dog breed.
- **Props**: `{ breed }`
- **Visual Design**:
  - Image header / fallback avatar with breed image URL or custom icon.
  - Spanish Breed Name and group badge.
  - Full temperament description.
  - Attribute Rating Bars / Meters:
    - **Nivel de Energía**: rating bar (1-5) with icon (⚡ `Zap`)
    - **Impulso de Presa**: rating bar (1-5) with icon (🔥 `Flame`)
    - **Sensibilidad**: rating bar (1-5) with icon (🛡️ `ShieldAlert`)
    - **Umbral de Excitación**: rating bar (1-5) with icon (📈 `Activity`)
  - Color-coded ratings (Green for 1-2, Amber for 3, Terracotta/Rose for 4-5).

### 3.2 `BreedEncyclopedia.jsx` (`src/components/breeds/BreedEncyclopedia.jsx`)
- **Responsibilities**: Container view for searching, filtering, and listing breeds.
- **Filter Controls**:
  - Text search input for breed name / description (`search`).
  - 4 Multi-criteria rating selectors (1-5 buttons/chips or sliders) for:
    - `energy`: Max Energy Level filter
    - `prey`: Max Prey Drive filter
    - `sensitivity`: Max Sensitivity filter
    - `arousal`: Max Arousal Threshold filter
  - Quick Reset Filters button ("Limpiar Filtros").
- **Integration**:
  - Debounced effect or onChange handler calling `loadBreeds(params)`.
  - Grid render of `BreedCard` components.
  - Empty state with "No se encontraron razas con los criterios seleccionados."

### 3.3 `DogFormModal.jsx` (`src/components/profiles/DogFormModal.jsx`)
- **Responsibilities**: Modal dialog for creating a new pet profile or editing an existing one.
- **Props**: `{ isOpen, onClose, dogToEdit, onSave }`
- **Form State & Fields**:
  - `name`: Text input (required)
  - `breed_id`: Dropdown select from available `breeds` (required)
  - `age`: Number input (years)
  - `weight`: Number input (kg)
  - `gender`: Select dropdown ("Macho", "Hembra", "Macho Castrado", "Hembra Esterilizada")
  - `triggers`: Array of strings managed via:
    - Quick-preset buttons: "Perro sin correa", "Bicicletas/Patineta", "Persona/Niño", "Ruido Fuerte", "Vehículo"
    - Custom tag input field + "Agregar" button
    - Interactive removable tag chips (`Badge` with `X` button)
  - `comfort_distance`: Number slider or input (meters)
  - `training_goals`: Textarea for desensitization goals
- **Submit Logic**:
  - Calls `createNewDog` for new profiles or `updateExistingDog` when `dogToEdit` is present.

### 3.4 `DogProfilesView.jsx` (`src/components/profiles/DogProfilesView.jsx`)
- **Responsibilities**: Container view for pet profiles management.
- **Features**:
  - Top action bar with "Nuevo Perro" button.
  - Responsive grid of dog profile cards.
  - Active dog selection toggle (`setActiveDog`). Visual badge "Activo para Paseos".
  - Display of dog breed, age, weight, comfort distance, trigger tags, and training goals.
  - Card Action buttons:
    - "Editar" (opens `DogFormModal` with `dogToEdit`)
    - "Eliminar" (calls `deleteExistingDog(id)` with confirmation prompt)
  - Empty state prompt when no dogs exist.

---

## 4. UI/UX & Calming Nature Theme Integration
- Color Palette Compliance:
  - Primary Accent (Sage): `#4E6E58` (`sage-500`, `sage-600`, `sage-800`)
  - Secondary Accent (Terracotta): `#D97757` (`terracotta-500`, `terracotta-600`)
  - Background (Warm Cream): `#FAF8F5` (`cream-100`)
  - Surface & Cards: White with soft borders (`border-surface-border`), `rounded-2xl` / `rounded-3xl` corners, `shadow-soft`.
- Lucide Icons: `BookOpen`, `Search`, `SlidersHorizontal`, `Zap`, `Flame`, `ShieldAlert`, `Activity`, `Dog`, `Plus`, `Edit2`, `Trash2`, `CheckCircle2`, `Tag`, `Target`.

---

## 5. Verification Strategy
- Executing frontend compilation check (`npm run build`).
- Running backend verification script (`node server/verify-backend.js`).
- Manual inspection of component props, state flows, and REST payload structure.
