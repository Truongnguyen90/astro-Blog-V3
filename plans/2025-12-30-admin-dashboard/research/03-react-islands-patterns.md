# React Island Patterns in Astro - Research & Best Practices

**Date:** 2025-12-30
**Purpose:** Optimize admin dashboard interactivity with minimal JavaScript overhead
**Focus:** Partial hydration, client directives, state management, bundle optimization

---

## 1. ASTRO ISLANDS ARCHITECTURE

### 1.1 Core Concept

**Island Architecture** = Static HTML + Strategic Interactive Components (React/Vue/Svelte)

- Default: Everything is static HTML (server-rendered)
- Islands: Components hydrated with JavaScript only when needed
- Result: Minimal JS, maximum performance

**Key Benefit:** Only interactive parts get JS; static content stays pure HTML

### 1.2 Client Directives Deep Dive

#### client:load
**When:** Component needs interactivity immediately on page load
**Use Cases:**
- Navigation state management
- Authentication UI (login buttons, user menus)
- Critical real-time features (notifications)
- Above-the-fold interactive elements

**Trade-off:** Blocks page rendering; JS loads synchronously
**Bundle Impact:** Highest (immediate hydration)

```astro
---
import AuthWidget from '../components/AuthWidget.jsx'
---
<AuthWidget client:load />
```

#### client:visible (Recommended default)
**When:** Component needs interactivity when visible in viewport
**Use Cases:**
- Analytics charts (visible on scroll)
- Collapsible sections/modals
- Form fields (below fold)
- Dashboard widgets on secondary views
- File upload widgets (when user scrolls to upload area)

**Trade-off:** Waits for intersection; slightly delayed hydration
**Bundle Impact:** Medium (lazy hydration)
**Performance:** Great for dashboards - most admin UI is below fold

```astro
---
import ChartWidget from '../components/ChartWidget.jsx'
---
<ChartWidget client:visible />
```

#### client:idle
**When:** Component can wait until browser is idle
**Use Cases:**
- Non-critical UI enhancements
- Secondary features
- Analytics tracking widgets
- Help/documentation popups
- Form validation helpers (non-blocking)

**Trade-off:** Longest delay before hydration; lowest priority
**Bundle Impact:** Lowest (progressive enhancement)
**Performance:** Best - great for polish features

```astro
---
import FormHints from '../components/FormHints.jsx'
---
<FormHints client:idle />
```

#### client:only (No Astro rendering)
**When:** Component MUST be React-only (can't render on server)
**Use Cases:**
- Uses browser APIs directly (localStorage, etc.)
- Requires client-specific hooks
- Third-party libraries with no SSR support

**Trade-off:** No HTML fallback; JavaScript only
**Bundle Impact:** Medium (no server render, but no hydration overhead)

```astro
---
import MapComponent from '../components/MapComponent.jsx'
---
<MapComponent client:only="react" />
```

### 1.3 Client Directive Selection Matrix

| Directive | Load Time | Hydration | Use in Dashboard |
|-----------|-----------|-----------|------------------|
| `client:load` | Page load | Sync | Auth, critical nav |
| `client:visible` | On scroll | Lazy (intersection) | Most forms, charts |
| `client:idle` | 2+ sec | Deferred | Polish, hints, help |
| `client:only` | Page load | N/A (no SSR) | Maps, browser APIs |

---

## 2. PARTIAL HYDRATION STRATEGIES

### 2.1 Strategy 1: Minimal Islands
**Goal:** Isolate interactivity to smallest possible components

**Pattern:**
```
Admin Dashboard (Static Astro)
├── Header Navigation (Static HTML)
├── Sidebar (Static HTML)
├── Main Content Area (Static HTML)
│   ├── File Upload Widget [React Island - client:visible]
│   ├── Analytics Chart [React Island - client:visible]
│   ├── Form [Static Astro + React Island just for file picker]
│   └── Data Table [Static HTML with data-attributes]
└── Footer (Static HTML)
```

**Benefits:**
- 70-80% smaller bundle than full React SPA
- Better SEO (static content crawlable)
- Faster initial page load
- Progressive enhancement

### 2.2 Strategy 2: Islands with Progressive Enhancement
**Goal:** Provide working experience without JavaScript

**Pattern:**
```
Form (Static Astro HTML)
├── Input fields (native HTML)
├── File upload (static form)
└── Submit button
   └── Client-side validation [React Island - client:visible]
```

When JS loads, React island validates form in real-time. Without JS, form still works (server-side validation).

### 2.3 Strategy 3: Container + Consumers Pattern
**Goal:** Share state across multiple islands

**Issue:** Multiple React islands = multiple hydration trees (no shared state by default)

**Solution: Using Context + Props**
```
// Parent Astro component
---
import Dashboard from '../components/Dashboard.jsx'

// Generate initial state on server
const initialState = await fetchDashboardData()
---
<Dashboard client:visible initialState={initialState} />

// Inside Dashboard.jsx - provides context
export function Dashboard({ initialState }) {
  const [state, setState] = useState(initialState)

  return (
    <DashboardContext.Provider value={{ state, setState }}>
      <FileUpload />
      <AnalyticsChart />
      <FormWidget />
    </DashboardContext.Provider>
  )
}
```

**Key:** Single React root wraps multiple interactive areas = shared state

### 2.4 Strategy 4: Islands with Web Components Bridge
**Goal:** Communicate between islands without prop drilling

**Pattern:** Use browser CustomEvents + localStorage
```javascript
// File upload island
function FileUpload() {
  const handleUpload = (file) => {
    // Emit custom event
    window.dispatchEvent(
      new CustomEvent('file-uploaded', {
        detail: { fileName: file.name, size: file.size }
      })
    )
  }
}

// Analytics chart island - listens to file uploads
function AnalyticsChart() {
  useEffect(() => {
    window.addEventListener('file-uploaded', (e) => {
      console.log('New file:', e.detail)
      // Update chart
    })
  }, [])
}
```

**Benefits:**
- Islands remain independent modules
- No prop drilling required
- Loose coupling
- Easy to add/remove islands

---

## 3. STATE MANAGEMENT BETWEEN ISLANDS

### 3.1 Approaches Ranked by Performance

#### 1. URL Query Params (Best for Dashboard)
**Good for:** Filters, sorting, view modes

```astro
---
// dashboard.astro
const { view = 'grid', sort = 'date' } = Astro.url.searchParams
---
<Dashboard client:visible initialView={view} initialSort={sort} />
```

**Advantages:**
- Shareable URLs
- Browser history integration
- No extra JS needed for persistence
- SEO friendly

#### 2. Context + Single React Root (Good for Grouped Islands)
**Use when:** Multiple islands need to share state

```jsx
// DashboardContainer.jsx
export function DashboardContainer() {
  const [files, setFiles] = useState([])

  return (
    <FileContext.Provider value={{ files, setFiles }}>
      <FileUpload />
      <FileList />
    </FileContext.Provider>
  )
}
```

#### 3. sessionStorage (Good for Temporary State)
**Use when:** State needed across page navigations

```javascript
// File upload island
function FileUpload() {
  const handleUpload = (file) => {
    sessionStorage.setItem('uploadedFile', JSON.stringify(file))
    // Other islands can read this
  }
}
```

**Caveat:** JavaScript required; loses data on tab close

#### 4. Custom Events + Window API (Good for Loose Coupling)
See Strategy 4 above. Best for independent islands.

#### 5. NOT RECOMMENDED: Multiple Independent React Roots
```astro
<!-- ANTI-PATTERN - Avoid this -->
<FileUpload client:visible />
<FileList client:visible />  <!-- Separate React tree, can't access FileUpload state -->
```
Result: No shared state, difficult to sync.

### 3.2 Recommended Pattern for Admin Dashboard

```astro
---
// admin-dashboard.astro
const { view = 'grid', page = 1 } = Astro.url.searchParams
const files = await getFiles(page)
---

<AdminWrapper client:visible
  initialFiles={files}
  initialView={view}
  initialPage={page}
>
  <!-- All interactive areas wrapped in single React tree -->
</AdminWrapper>
```

**In AdminWrapper.jsx:**
```jsx
export function AdminWrapper({ initialFiles, initialView, initialPage }) {
  const [files, setFiles] = useState(initialFiles)
  const [view, setView] = useState(initialView)
  const [page, setPage] = useState(initialPage)

  // Share state across all child components
  return (
    <DashboardProvider value={{ files, setFiles, view, setView }}>
      <Header />
      <FileUpload />       {/* Has access to setFiles */}
      <FileList />         {/* Has access to files, view */}
      <Pagination />       {/* Has access to page, setPage */}
    </DashboardProvider>
  )
}
```

---

## 4. PROPS PASSING & SERIALIZATION

### 4.1 Astro → React Props Rules

**What CAN be passed:**
- ✅ Primitives: string, number, boolean, null
- ✅ Arrays of primitives/objects
- ✅ Plain objects (JSON-serializable)
- ✅ Dates (automatic JSON serialization)

**What CANNOT be passed:**
- ❌ Functions (will be stripped)
- ❌ Symbols
- ❌ Classes/instances
- ❌ Circular references

### 4.2 Safe Props Pattern

```astro
---
// admin-dashboard.astro
const userData = {
  id: 1,
  name: "John",
  email: "john@example.com",
  permissions: ['read', 'write'],
  lastLogin: new Date()
}

// Safe to pass - all serializable
---

<Dashboard client:visible
  user={userData}
  appConfig={{ theme: 'dark', language: 'en' }}
  features={['fileUpload', 'analytics']}
/>
```

### 4.3 Complex Patterns

#### Callbacks from React → Astro
**Problem:** Can't pass functions directly

**Solution 1: Server Actions (Astro experimental feature)**
```astro
---
import FileUploadForm from '../components/FileUploadForm.jsx'

export const handleUpload = async (formData) => {
  // Server-side processing
  const file = formData.get('file')
  // ... save file ...
  return { success: true, fileId: 123 }
}
---

<FileUploadForm client:visible action={handleUpload} />
```

**Solution 2: Use Fetch + API Routes**
```jsx
// FileUploadForm.jsx
export function FileUploadForm({ apiEndpoint }) {
  const handleUpload = async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      body: formData
    })
    return response.json()
  }

  return (/* form JSX */)
}
```

```astro
<!-- admin-dashboard.astro -->
<FileUploadForm client:visible apiEndpoint="/api/upload" />
```

#### Events from Child Components
**Use Web APIs (CustomEvent) instead of callbacks:**
```jsx
// FileUpload.jsx
export function FileUpload() {
  const handleUpload = (file) => {
    window.dispatchEvent(
      new CustomEvent('astro:fileUploaded', {
        detail: { fileName: file.name, size: file.size }
      })
    )
  }
  return (/* upload UI */)
}
```

---

## 5. LIGHTWEIGHT PATTERNS FOR ADMIN DASHBOARD

### 5.1 Minimize React Island Usage

**Decision Tree:**

```
Feature needs interactivity?
├─ YES: Form input, file picker, real-time validation?
│  └─ YES: Use React island [client:visible]
│  └─ NO: Static HTML is fine
├─ NO: Pure display (table, chart, text)?
│  └─ Make static Astro component + use data attributes
│  └─ Use native HTML for interactions (details/summary, etc.)
```

### 5.2 Use Native Web APIs

**Instead of React for simple interactions:**

| Interaction | React Island? | Native Alternative |
|------------|---------------|--------------------|
| Show/hide sections | No | `<details>` element |
| Tab navigation | No | CSS + `data-active` |
| Sortable table | No | HTML attributes + light JS |
| Theme toggle | No | localStorage + CSS variables |
| Form validation | Maybe | HTML5 validation + client:idle JS |
| Modals | Maybe | `<dialog>` element + minimal JS |
| Dropdowns | No | CSS or `<details>` |

**Example: Native Details (No React Needed)**
```astro
---
// dashboard.astro
---
<details class="collapsible">
  <summary>Advanced Filters</summary>
  <div class="filter-panel">
    <input type="text" placeholder="Search...">
    <button type="submit">Filter</button>
  </div>
</details>
```

**Example: Data Tables with Sorting (Light Progressive Enhancement)**
```astro
---
import FileList from '../components/FileList.astro'

const files = await getFiles()
---

<FileList files={files} />

<script>
// Minimal vanilla JS for client:idle enhancement
const headers = document.querySelectorAll('th[data-sortable]')
headers.forEach(header => {
  header.style.cursor = 'pointer'
  header.addEventListener('click', () => {
    // Sort logic here
  })
})
</script>
```

### 5.3 Progressive Enhancement Approach

**Layer 1 (HTML):** Static, works without JS
```astro
<form method="POST" action="/api/upload">
  <input type="file" name="file" required />
  <button type="submit">Upload</button>
</form>
```

**Layer 2 (CSS):** Styling, loading states
```css
.upload-form.loading button {
  opacity: 0.5;
  pointer-events: none;
}
```

**Layer 3 (React - client:visible):** Real-time validation, better UX
```jsx
export function FileUploadForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Only enhances existing form; form works without this
}
```

### 5.4 Bundle Size Optimization

**Recommended packages per island:**
- ✅ **file-upload island:** `tiny-react` (47KB gzipped) instead of `react-dropzone` (52KB) - marginal difference, stick with popular
- ✅ **forms island:** Zod validation (30KB gzipped) + plain React (45KB)
- ✅ **charts island:** `recharts` (30KB gzipped) or `uplot` (40KB) instead of `chart.js` (80KB)
- ❌ Avoid: `moment.js` - use `date-fns` (14KB) or `dayjs` (7KB)

**Total reasonable bundle for small admin dashboard:** 150-200KB (gzipped)

**Breakdown:**
- React runtime: 45KB
- File upload island: 25KB
- Forms/validation: 30KB
- Charts: 30KB
- Utilities: 20KB

---

## 6. ADMIN DASHBOARD SPECIFIC PATTERNS

### 6.1 Static vs. Interactive Matrix

| Feature | Component Type | Directive | Reason |
|---------|---|---|---|
| Header/nav | Static Astro | — | No interactivity needed |
| Sidebar | Static Astro + dark mode toggle | client:idle | Toggle is enhancement |
| Page title | Static Astro | — | Pure display |
| **File upload widget** | React Island | client:visible | Core feature, needs real-time feedback |
| **Analytics charts** | Static Astro or React | client:visible* | Static if data is pre-generated; React if real-time |
| **Data tables** | Static Astro | client:idle for sorting** | Native HTML with progressive JS |
| **Forms** | Static HTML | client:visible (validation) | Forms work without JS |
| **Modals/dialogs** | Native + light JS | client:idle | Use `<dialog>` element |
| **Real-time notifications** | React Island | client:load | Needs immediate interactivity |
| **Settings/config forms** | Static Astro | client:visible (only form helpers) | Minimal JS |

*Depends on data source
**Add sorting only if needed; pagination can be server-side

### 6.2 File Upload Widget Pattern (Recommended)

```astro
---
// admin/upload.astro
import FileUploadIsland from '../components/FileUploadIsland.jsx'
---

<section class="upload-section">
  <h2>Upload Files</h2>

  <!-- React island handles file selection & upload -->
  <FileUploadIsland client:visible
    maxSize={5242880}  <!-- 5MB -->
    apiEndpoint="/api/upload"
    allowedTypes={['application/pdf', 'image/jpeg', 'image/png']}
  />

  <!-- Server-rendered list of uploaded files -->
  <div id="file-list">
    {/* Pre-fetched data from server */}
  </div>
</section>

<script>
// Listen for upload events to refresh file list
window.addEventListener('file-uploaded', async () => {
  const response = await fetch('/api/files')
  const html = await response.text()
  document.getElementById('file-list').innerHTML = html
})
</script>
```

**FileUploadIsland.jsx:**
```jsx
import { useState } from 'react'

export function FileUploadIsland({
  maxSize,
  apiEndpoint,
  allowedTypes
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)

  const handleFile = async (file) => {
    // Validation
    if (file.size > maxSize) {
      setError(`File too large (max ${maxSize / 1024 / 1024}MB)`)
      return
    }

    if (!allowedTypes.includes(file.type)) {
      setError('File type not allowed')
      return
    }

    // Upload
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        // Emit event for other components
        window.dispatchEvent(
          new CustomEvent('file-uploaded', { detail: data })
        )
      } else {
        setError('Upload failed')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div
      className={`drop-zone ${isDragging ? 'dragging' : ''}`}
      onDragOver={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        handleFile(e.dataTransfer.files[0])
      }}
    >
      <p>Drag files here or click to select</p>
      <input
        type="file"
        onChange={(e) => handleFile(e.target.files[0])}
      />
      {error && <p className="error">{error}</p>}
      {isUploading && <p>Uploading...</p>}
    </div>
  )
}
```

### 6.3 Analytics Charts Pattern

**Option A: Static + client:idle enhancement**
```astro
---
// analytics.astro
const data = await fetchChartData()
const chartHTML = generateChartSVG(data)  // On server
---

<div class="chart-container">
  <img src={chartHTML} alt="Chart" />
</div>
```

**Option B: React for real-time**
```astro
---
import LiveChart from '../components/LiveChart.jsx'

// Only pass data reference, not the whole dataset
---

<LiveChart client:visible dataSource="/api/analytics" pollInterval={30000} />
```

### 6.4 Forms Pattern

**For most admin forms: Static HTML + light client:idle enhancement**

```astro
---
// components/UserForm.astro
---
<form method="POST" action="/api/users" class="user-form">
  <input
    type="text"
    name="name"
    required
    pattern="[A-Za-z ]+"
    title="Letters and spaces only"
  />
  <input type="email" name="email" required />
  <button type="submit">Save User</button>
</form>

<script>
// Progressive enhancement with client:idle
const form = document.querySelector('.user-form')
form.addEventListener('submit', async (e) => {
  // Add client-side validation before server POST
  // Form works without this script too
})
</script>
```

**Only use React island if needed (highly complex validation, live preview, etc.):**
```astro
---
import ComplexForm from '../components/ComplexForm.jsx'
---

<ComplexForm client:visible />
```

---

## 7. BEST PRACTICES

### 7.1 Code Splitting

**Automatic:** Astro splits each island into separate JS bundle
```
dist/chunks/
├── FileUpload.astro.js
├── Chart.astro.js
└── Form.astro.js
```

**Manual (if needed):**
```jsx
// Dynamic imports for heavy libraries
const recharts = await import('recharts')
```

### 7.2 Lazy Loading

Use Astro's native support:
```astro
---
import FileUpload from '../components/FileUpload.jsx'
---

<!-- Automatically lazy-loads when visible -->
<FileUpload client:visible />
```

**For nested content:**
```astro
---
import ChartContainer from '../components/ChartContainer.astro'
---

<ChartContainer />
```

### 7.3 Shared State Patterns

**Best Practice: Container Component**
```jsx
// DashboardContainer.jsx
export function DashboardContainer({ initialData }) {
  const [data, setData] = useState(initialData)

  return (
    <div>
      <FileUpload onUpload={(file) => setData([...data, file])} />
      <FileList files={data} />
    </div>
  )
}
```

**Avoid: Multiple independent roots**
```astro
<!-- BAD - No shared state -->
<FileUpload client:visible />
<FileList client:visible />
```

### 7.4 TypeScript Integration

**Astro component with typed React island:**
```astro
---
import FileUpload from '../components/FileUpload'
import type { FileUploadProps } from '../components/FileUpload'

const props: FileUploadProps = {
  maxSize: 5242880,
  allowedTypes: ['application/pdf']
}
---

<FileUpload client:visible {...props} />
```

**FileUpload.tsx:**
```tsx
export interface FileUploadProps {
  maxSize: number
  allowedTypes: string[]
  apiEndpoint?: string
}

export function FileUpload(props: FileUploadProps) {
  // ...
}
```

### 7.5 Performance Monitoring

```astro
---
// admin-dashboard.astro
---

<script>
// Log hydration timing
if ('PerformanceObserver' in window) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('Hydration:', entry.name, entry.duration, 'ms')
    }
  })
  observer.observe({ entryTypes: ['measure'] })
}
</script>
```

### 7.6 Testing Islands

**Unit test (Jest + React Testing Library):**
```jsx
import { render, screen } from '@testing-library/react'
import { FileUpload } from './FileUpload'

test('shows error for oversized file', () => {
  const largeFile = new File(['x'.repeat(10485760)], 'large.txt')

  const { getByText } = render(
    <FileUpload maxSize={5242880} />
  )

  // Simulate drag and drop
  // Assert error is shown
})
```

**Integration test (Playwright):**
```javascript
test('file upload updates file list', async ({ page }) => {
  await page.goto('/admin/upload')

  await page.setInputFiles('input[type="file"]', 'test-file.pdf')
  await page.click('button:has-text("Upload")')

  await expect(page.locator('text=test-file.pdf')).toBeVisible()
})
```

---

## 8. ANTI-PATTERNS TO AVOID

| Anti-pattern | Why Bad | Solution |
|---|---|---|
| Everything as React islands | Fat bundle, poor performance | Use selective hydration |
| Multiple independent React roots sharing state | State sync problems | Single container component |
| Passing functions as props | Not serializable | Use API routes + fetch |
| Large monolithic islands | Hard to optimize | Split into smaller islands |
| Not using client directives | Everything loads immediately | Use `client:visible` by default |
| Over-engineering state | Unnecessary complexity | Prefer URL params + Context |
| Ignoring SSR capabilities | Missed optimization | Render static content on server |
| Forgetting progressive enhancement | Broken without JS | Always provide HTML fallback |

---

## 9. RECOMMENDED STRUCTURE FOR ADMIN DASHBOARD

### File Organization
```
src/
├── pages/
│   └── admin/
│       ├── dashboard.astro          (main layout)
│       ├── files/
│       │   └── index.astro          (file management)
│       ├── analytics/
│       │   └── index.astro          (analytics page)
│       └── settings/
│           └── index.astro          (settings)
├── components/
│   ├── Layout/
│   │   └── AdminLayout.astro        (shared layout)
│   ├── Islands/                     (React interactive)
│   │   ├── FileUploadIsland.jsx
│   │   ├── ChartIsland.jsx
│   │   └── FormIsland.jsx
│   ├── Static/                      (Pure Astro components)
│   │   ├── FileList.astro
│   │   ├── DataTable.astro
│   │   └── Header.astro
│   └── Shared/                      (Both Astro & React)
│       ├── Button.astro
│       ├── Badge.astro
│       └── Modal.astro
├── api/                             (API routes)
│   ├── upload.ts
│   ├── files.ts
│   └── analytics.ts
└── styles/
    └── global.css
```

### Component Naming Convention
- **Islands:** `*Island.jsx` or `*Island.tsx`
- **Static:** `*.astro`
- **Shared:** `*.astro` (works in both contexts)

---

## 10. PERFORMANCE TARGETS

### Metrics to Monitor
- **Core Web Vitals:**
  - LCP (Largest Contentful Paint): < 2.5s
  - FID (First Input Delay): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1

- **Bundle Metrics:**
  - Total JS: < 200KB gzipped
  - Each island: < 50KB gzipped
  - No island should defer hydration > 5s

### Optimization Checklist
- [ ] Only React islands for truly interactive features
- [ ] All static content as Astro components
- [ ] Use `client:visible` by default (not `client:load`)
- [ ] No functions passed as props
- [ ] Data fetching on server (Astro or API routes)
- [ ] CSS-in-JS minimized (use CSS files)
- [ ] Images optimized (use Astro Image)
- [ ] Test lighthouse score > 85

---

## SUMMARY RECOMMENDATIONS

### For Your Admin Dashboard

1. **Layout:** Static Astro (Header, Sidebar, Footer)
2. **File Upload:** React island with `client:visible` (25KB)
3. **File List:** Static Astro table with `client:idle` sorting enhancement
4. **Analytics:** Static charts OR React island if real-time needed
5. **Forms:** Static HTML with `client:visible` validation island only if complex
6. **State:** Use URL params for view/filter state, Context for single container
7. **Total JS:** Aim for 120-150KB gzipped

### Expected Results
- Initial page load: < 1.5s
- Time to interactive: < 2.5s
- Lighthouse score: > 90
- Bundle smaller than typical SPA by 60-70%

---

## UNRESOLVED QUESTIONS

1. Will you need real-time analytics updates? (Affects chart island vs. static choice)
2. What's the file size limit for uploads? (Affects validation logic)
3. Do forms need client-side validation preview? (Affects island usage)
4. Any third-party integrations requiring specific hydration? (Affects client directive choice)
5. Will you need offline support? (Affects data strategy)
