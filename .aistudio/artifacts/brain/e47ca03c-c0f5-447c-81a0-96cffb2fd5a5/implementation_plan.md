# AlConsults — UI/UX Pro Max & Carbon-Inspired Dark Redesign (Revised)

A ground-up UI/UX overhaul of **AlConsults** built around **UI/UX Pro Max** principles and a **Carbon-inspired dark design token language**: removing the artificial top device switcher, introducing a **Contextual Command Bar**, separating Desktop and Mobile navigation architectures cleanly, and rendering a single active module workspace with internal master-detail split views where they genuinely boost productivity.

### User Review & Critical Decisions (Refined)

> [!IMPORTANT]
> This revised plan incorporates all four of your architectural refinements (**A, B, C, and D**) while preserving your core rules (2-level minimal desktop sidebar, zero page subtitle descriptions, and `₦` currency symbol).

- **Refinement A — Single Active Module Viewport with Selective Master-Detail Split**:
  - Only **one module view** is rendered in the main workspace at a time based on navigation selection.
  - **Desktop Master-Detail Split Views** are used *inside* modules where inspecting records alongside a list improves productivity:
    - **Clients & Leads**: List on the left, selected profile / pipeline actions on the right.
    - **Quotations & Invoices**: Document list on the left, live proposal / invoice preview sheet on the right.
    - **Projects**: Project list on the left, execution workspace (milestones, tasks, scope, change requests) on the right.
    - **Payments, Expenses & Documents**: Ledger list on the left, formal receipt / voucher / vault preview on the right.
  - **Single-Canvas Views**: Modules like **Dashboard**, **Reports**, **Automations**, **Services**, **Forms**, and **Settings** use a unified full-width workspace layout rather than forcing a split pane.
- **Refinement B — Context-Aware Command Bar**:
  - Instead of showing every possible button on every screen, the top **Command Bar** combines **Global Functions** (`⌘K` Global Search, Currency `₦`, Voice AI) with **Contextual Actions & Filters** tailored to the active module:
    - **Dashboard**: `Search (⌘K)` · `+ Quick Create` (Bottom Sheet / Menu) · `Financial Summary Pill (Contracted / Collected)`
    - **Clients**: `Search Clients` · `+ New Client` · `Status Filter`
    - **Quotations**: `Search Quotations` · `+ New Quotation` · `Stage Filter (All / Draft / Sent / Accepted)`
    - **Invoices**: `Search Invoices` · `+ New Invoice` · `Status Filter (All / Paid / Unpaid / Overdue)`
    - **Projects**: `Search Projects` · `Stage Filter` · `Active Progress Summary`
    - **Payments / Expenses**: `Search Ledger` · `+ Record Payment` / `+ Add Expense` · `Category / Method Filter`
- **Refinement C — Dedicated Mobile Layout Architecture (`< 1024px`)**:
  - Rather than squeezing the 2-level desktop sidebar onto mobile screens, mobile viewports use a dedicated native-style layout:
    - **5-Tab Bottom Navigation Bar**: Direct thumb access to the five most critical destinations (`Dashboard`, `Clients`, `Projects`, `Invoices`, and `More`).
    - **`More` Hub & Bottom Sheets**: Secondary modules (`Quotations`, `Payments`, `Expenses`, `Documents`, `Inbox`, `Leads`, `Tasks`, `Reports`, `Settings`) live in a clean **More** hub screen, while quick creation actions (`+ New`) open in a tactile **Bottom Sheet**.
    - **Compact Mobile Command Bar & Full-Screen Forms**: A slim top search/action header and full-screen modal forms on mobile viewports, plus tap-to-open slide-up sheets for inspecting Quotations, Invoices, and Receipts.
- **Refinement D — Shared Carbon-Inspired Design Token Language**:
  - Rather than importing IBM's web-only `@carbon/react` library, we implement a **Carbon-inspired enterprise design language** (`8px` spatial grid, crisp `1px` structural borders, high-contrast dark layer tokens, and productive data density) via **shared semantic design tokens** mapped to clean components—ensuring 100% portability to Kotlin & Compose Multiplatform (`ColorScheme`, `Typography`, `Spacing` tokens).

---

### 1. Overview & Core Concept

- **What It Does**: Delivers a unified B2B consulting and project operations platform covering Leads, Clients, Quotations, Projects, Invoices, Payments, Expenses, Documents, Tasks, Reports, Automations, and Google Workspace integrations.
- **Target Audience / Persona**: Managing partners, independent consultants, and operations leads working across desktop workstations and mobile devices.
- **Key Value**: Eliminates the artificial top device switcher, adapts the command bar to the user's current task, provides dedicated desktop vs. mobile navigation ergonomics, and establishes a portable Carbon-inspired dark token system.

---

### 2. User Experience & Visual Design

- **Carbon-Inspired Shared Token Hierarchy (Dark Layer Model)**:
  Following the Carbon layer progression model (`Background -> Layer 01 -> Layer 02 -> Interactive`) so surfaces remain distinct without heavy drop shadows:
  - `token.bg.canvas` (`#090D16`): Root application background.
  - `token.layer.01` (`#0F1624`): Primary cards, table containers, and sidebar surface.
  - `token.layer.02` (`#162032`): Selected master-detail rows, active tabs, and hover states.
  - `token.border.subtle` (`#1E293B`): Crisp `1px` structural hairline borders dividing panes and table rows.
  - `token.text.primary` (`#F8FAFC`): High-contrast primary headings and figures.
  - `token.text.secondary` (`#94A3B8`): Muted metadata and column headers.
  - `token.interactive.primary` (`#2563EB` / `#3B82F6`): Primary action buttons, active indicators, and focus rings.
  - `token.status.*`: Semantic Emerald (`#10B981`), Amber (`#F59E0B`), and Rose (`#F43F5E`).

- **Typography & Tabular Discipline**:
  - **UI & Headings**: `Plus Jakarta Sans` (`600`/`700` display headings, `400`/`500` body and controls, zero subtitle filler text beneath page titles).
  - **Financial & Numerical Data**: `JetBrains Mono` with `tabular-nums` for all `₦` currency amounts, invoice/quotation IDs, dates, and percentages.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Contextual Command Bar vs. Static Global Toolbar**
  - *Chosen Approach*: The Command Bar reads `activeTab` from `BusinessContext` and renders module-specific search placeholders, quick-filter pills, and the primary creation CTA for that module, while keeping `⌘K` global search and `₦` currency accessible on the right.
  - *Why*: Reduces cognitive load and eliminates redundant double search bars on individual pages.
- **Decision 2: Separate Desktop (`lg+`) and Mobile (`< lg`) Navigation Shells**
  - *Chosen Approach*: Desktop renders the 2-level collapsible Sidebar (`Dashboard` + `Workspace >`, `Business >`, `Management >`, `System >`). Mobile hides the desktop sidebar completely and renders a 5-destination Bottom Navigation Bar (`Dashboard`, `Clients`, `Projects`, `Invoices`, `More`), a slide-up Quick Action Bottom Sheet, and tap-to-preview detail sheets for master-detail modules.
  - *Why*: Respects platform ergonomics and mirrors how a Kotlin/Compose Multiplatform app separates `NavigationRail`/`PermanentNavigationDrawer` on desktop from `NavigationBar` + `ModalBottomSheet` on Android.
- **Decision 3: Contextual Client Portal Preview**
  - *Chosen Approach*: Launched directly from any Client Profile in **ClientsView**, rendering that client's live portal with a floating **Return to Workspace** bar.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Layout Routing Diagram**:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     BusinessContext (Shared State & ₦ Math)                  │
│   activeTab · searchQuery · moduleFilter · clients · invoices · projects     │
└───────────────────┬──────────────────────────────────────┬───────────────────┘
                    │                                      │
      (Desktop Viewport ≥ 1024px)             (Mobile Viewport < 1024px)
                    ▼                                      ▼
┌────────────────────────────────────────┐ ┌───────────────────────────────────┐
│ Desktop Workspace Shell                │ │ Mobile Native-Style Shell         │
│ ┌──────────────┬─────────────────────┐ │ │ ┌───────────────────────────────┐ │
│ │ 2-Level      │ Contextual          │ │ │ │ Compact Mobile Command Header │ │
│ │ Sidebar      │ Command Bar         │ │ │ ├───────────────────────────────┤ │
│ │              ├─────────────────────┤ │ │ │ Single Active Module View     │ │
│ │ - Dashboard  │ Single Active View  │ │ │ │ (List -> Tap opens Full/Sheet │ │
│ │ - Sections > │ - Full Canvas OR    │ │ │ │  Detail Preview)              │ │
│ │   ← All      │ - Left List +       │ │ │ ├───────────────────────────────┤ │
│ │   • Items    │   Right Detail Pane │ │ │ │ 5-Tab Bottom Nav + More Hub   │ │
│ └──────────────┴─────────────────────┘ │ │ │ + Quick Action Bottom Sheet   │ │
└────────────────────────────────────────┘ └─┴───────────────────────────────┴─┘
```

- **Contextual Command Bar Mapping**:
  - `dashboard`: Global Search (`⌘K`), `+ Quick Create` (opens creation selector), Financial Summary (`Contracted` / `Collected` in `₦`), Voice AI trigger.
  - `clients`: Client search input, `Status` filter, `+ New Client` CTA.
  - `quotations`: Proposal search input, `All | Draft | Sent | Accepted` filter, `+ New Quotation` CTA.
  - `invoices`: Invoice search input, `All | Paid | Unpaid | Overdue` filter, `+ New Invoice` CTA, `+ Record Payment` secondary button.
  - `projects`: Project search input, `Stage` filter, active completion summary.
  - `payments` / `expenses`: Ledger search input, category/method filter, `+ Record Payment` / `+ Add Expense` CTA.
  - `documents`: Vault search input, document type filter (`All | Quotation | Invoice | Agreement`).
