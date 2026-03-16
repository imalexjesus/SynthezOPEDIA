# AGENTS.md - SynthezOPEDIA

SvelteKit application for a vintage synthesizer encyclopedia (Энциклопедия Винтажных Синтезаторов).

## Build & Development Commands

```bash
# Install dependencies
npm install

# Development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking (run before committing)
npm run check

# Type checking with watch mode
npm run check:watch
```

### Docker Deployment

```bash
# Build Docker image
docker build -t synthezopedia:latest .

# Run container
docker run -p 3000:3000 synthezopedia:latest

# Deploy script (on server)
./deploy.sh --force
```

## Code Style Guidelines

### TypeScript & Svelte 5

- **Always use TypeScript**: All `.svelte` files must have `<script lang="ts">`
- **Svelte 5 syntax**: Use `$props()`, `$state()`, `$derived()` instead of `export let`
- **Strict mode**: Enabled in `tsconfig.json` - all types must be explicit

```svelte
<!-- ✅ Good: Svelte 5 with explicit types -->
<script lang="ts">
  import type { SynthModel } from '$lib/data/synths';
  
  let { synth, showImage = true }: { synth: SynthModel; showImage?: boolean } = $props();
  let cachedUrl: string | null = $state(null);
</script>
```

### Imports

- **Order imports**: Svelte/Kit imports first, then external packages, then internal imports
- **Use path aliases**: `$lib/` for `src/lib/`, `$app/` for SvelteKit internals
- **No relative imports** for top-level directories (use aliases)

```typescript
// ✅ Good import order
import { json } from '@sveltejs/kit';
import * as fs from 'fs/promises';
import axios from 'axios';
import { calculateInflation } from '$lib/utils/economy';
import type { SynthModel } from '$lib/data/synths';
```

### Naming Conventions

- **Variables**: camelCase (`cachedImageUrl`, `releasePriceUSD`)
- **Functions**: camelCase (`calculateInflation`, `cacheImage`)
- **Components**: PascalCase (`SynthCard.svelte`, `FilterPanel.svelte`)
- **API Routes**: lowercase with dashes (`/api/cache-image`, `/api/images/cache`)
- **Types/Interfaces**: PascalCase (`InflationResult`, `SynthModel`)
- **Constants**: UPPER_SNAKE_CASE (`CURRENT_YEAR`, `NO_CACHE`)

### Error Handling

- **Always catch errors** in async operations
- **Type narrowing**: Use `instanceof Error` for error messages
- **Graceful fallbacks**: Return sensible defaults instead of throwing
- **Console errors**: Log errors for debugging, but don't crash the app

```typescript
// ✅ Good error handling
try {
  const response = await axios.get(url, { timeout: 30000 });
  return response.data;
} catch (error: unknown) {
  console.error('Error fetching data:', error);
  const message = error instanceof Error ? error.message : 'Unknown error';
  return { error: message, status: 500 };
}
```

### Svelte Components

- **Script section first**: `<script lang="ts">` before template
- **Props with types**: Always type your props
- **Event handlers**: Use lowercase `on:click`, `on:error`, `on:load`
- **No semicolons in template**: Svelte template syntax doesn't need them

```svelte
<script lang="ts">
  import type { SynthModel } from '$lib/data/synths';
  
  let { synth }: { synth: SynthModel } = $props();
  let imageUrl: string | null = $state(null);
</script>

<div class="card">
  <img
    src={imageUrl || synth.images[0]}
    alt={synth.modelName}
    on:load={() => console.log('Loaded')}
    on:error={(e) => e.target.style.display = 'none'}
  />
</div>
```

### API Routes

- **File structure**: `+server.ts` with exported `GET`, `POST`, `PATCH`, etc.
- **Return type**: Use `Response` or SvelteKit's `json()` helper
- **Parameters**: Use `{ params }` for route params, `{ url }` for query strings

```typescript
// ✅ Good API route
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const id = url.searchParams.get('id');
  if (!id) return json({ error: 'ID required' }, { status: 400 });
  
  const data = await fetchData(id);
  return json(data);
};
```

### File Organization

```
src/
├── lib/
│   ├── data/          # Data models and arrays (synths.ts)
│   ├── utils/         # Utility functions (economy.ts)
│   ├── stores/        # Svelte stores (filters.ts)
│   └── components/    # Reusable components
├── routes/
│   ├── +layout.svelte # Root layout
│   ├── +page.svelte   # Homepage
│   ├── api/           # API endpoints
│   │   └── cache-image/+server.ts
│   └── synths/        # Dynamic routes
│       └── [brand]/[series]/[model]/
│           ├── +page.ts     # Data loading
│           └── +page.svelte # Page component
└── app.css            # Global styles
```

### Testing

This project uses TypeScript's static type checking as primary validation:

```bash
# Run type checking (equivalent to tests)
npm run check

# For single file checking, use svelte-check directly
npx svelte-check --tsconfig ./tsconfig.json --workspace src/lib/components/SynthCard.svelte
```

**Note**: There are no unit tests configured. Validation is done via:
- TypeScript strict mode
- Svelte component type checking
- Manual testing in dev server

### Environment Variables

Required for production features:

```bash
# NocoDB integration (optional)
NOCODB_BASE_URL=https://your-noco-instance.com
NOCODB_TABLE_ID=your-table-id
NOCODB_EMAIL=your@email.com
NOCODB_PASSWORD=your-password
```

### Editor Functionality

The synthesizer editor is available on each synth detail page via the "✏️ Редактировать" button.

#### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| brand | select | Yes | Yamaha, Casio, Korg, Roland, Bontempi, Other |
| series | text | Yes | Series name |
| modelName | text | Yes | Model name |
| year | number | Yes | Release year (1900-2030) |
| formFactor | select | Yes | micro, mini, compact, full |
| keysCount | number | Yes | Number of keys |
| synthEngine | text | No | Sound engine description |
| description | textarea | No | Full description |
| images | textarea | No | One URL per line |
| dimensions | text | No | Physical dimensions |
| polyphony | number | No | Voice count |
| midi | checkbox | No | MIDI support |
| sequencer | checkbox | No | Built-in sequencer |
| autoAccompaniment | checkbox | No | Auto-accompaniment feature |
| power | text | No | Power supply info |
| releasePriceUSD | number | No | Original price in USD |
| featureTags | textarea | No | One tag per line |
| isGem | checkbox | No | GEM collection badge |
| isActive | toggle | - | Show/hide from catalog |

#### isActive Toggle

When `isActive` is unchecked, the synth is hidden from the main catalog but NOT deleted. It can still be accessed directly via URL or seen in `/photo-tool` with `?includeInactive=true`.

This is useful for:
- Temporarily hiding work-in-progress entries
- Marking duplicates or errors without deleting
- Seasonal or temporary items

#### Temporary vs Permanent Data

**Permanent (requires admin action to change):**
- All synth fields edited via the editor
- `isActive` status (hides from catalog)
- Cached images in `/app/static/images/cache/`

**Temporary (auto-cleared or session-based):**
- `/photo-tool` overrides (browser localStorage) - for testing only
- Browser image cache (standard HTTP caching)
- Runtime memory (cleared on container restart unless volume mounted)

### Data Storage & Persistence

This section explains what data is **temporary/session-based** vs **persistent**.

#### Persistent Data (saved permanently)

| Data Type | Storage Location | How to Modify |
|-----------|-----------------|---------------|
| Synth definitions (name, brand, year, specs, etc.) | `/app/data/synths.json` (via volume) | Edit via `/synths/[id]` page → "Редактировать" button |
| Synth images | `/app/static/images/cache/` (via volume) | Auto-cached on first view, or use refresh button on card |
| Cached image metadata | Same as above | N/A - automatic |

**⚠️ Important**: Without NocoDB configured, all edits are stored in the Docker volume (`/opt/docker/synthezopedia/data/synths.json`). If you rebuild the container without mounting this volume, data will be lost.

#### Temporary/Session Data (not persisted)

| Data Type | Storage | Notes |
|-----------|---------|-------|
| Photo overrides in `/photo-tool` | Browser `localStorage` | Only used in photo-tool, exported manually |
| Image cache in browser | Browser cache | Standard HTTP caching |

#### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Storage Options                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. LOCAL FILE (current default)                           │
│     └── /opt/docker/synthezopedia/data/synths.json        │
│         ↕ (mounted as volume)                               │
│     └── /app/data/synths.json (inside container)          │
│                                                             │
│  2. NOCODB (optional, not configured)                     │
│     └── Requires env vars: NOCODB_BASE_URL,               │
│         NOCODB_TABLE_ID, NOCODB_EMAIL, NOCODB_PASSWORD   │
│                                                             │
│  3. FALLBACK - Hardcoded in repo                          │
│     └── src/lib/data/synths.ts                            │
│         (used if no other storage available)              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Git Workflow

1. **Before committing**: Run `npm run check` to verify types
2. **Commit messages**: Use clear, descriptive messages in English
3. **Branch naming**: Use descriptive names like `feature/image-cache` or `fix/inflation-calc`
4. **Docker updates**: After code changes, rebuild and redeploy container

---

*Last updated: Generated from codebase analysis*
