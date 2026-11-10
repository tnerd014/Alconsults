# FREELANCE BUSINESS MANAGEMENT SYSTEM
## Product Requirements and Development Specification

**Document Purpose**: Complete functional, technical, architectural, and UI/UX requirements for building and maintaining the application.

---

### 1. PRODUCT OVERVIEW

#### 1.1 Product Vision
Build a comprehensive business management system for an independent software developer, technical consultant, and technology service provider.

The system manages the complete business lifecycle—from initial enquiry and lead capture to onboarding, project delivery, payment collection, operational scheduling, maintenance, and ongoing client support.

It reduces administrative overhead, automates repetitive client communications, organizes client relationships, manages project delivery milestones, and provides a clear, mathematically sound picture of the financial health of the business.

The system initially supports one business owner while architecturally prepared for multi-tenant and multi-user workspace expansion in subsequent releases.

#### 1.2 Business Scope & Services Catalog
The system is not hardcoded around software development alone. It features an interactive, configurable **Services Catalog** where the business owner can define service offerings, deliverables, and custom baseline rates across diverse domains:
- Custom software & web application development.
- Mobile application development (iOS / Android).
- Desktop application development.
- IT consultancy & architecture reviews.
- Cloud infrastructure & DevOps automation.
- Database management & optimization.
- UI/UX & digital product design.
- Technical support, software maintenance, and SLA retainers.
- Other professional services.

Every service in the catalog supports customizable baseline rates across multiple billing models (**Fixed Project**, **Hourly Rate**, and **Monthly Retainer**).

#### 1.3 Supported Platforms & Client Access
The product comprises three tightly integrated environments:

| Platform | Primary Purpose | Key Characteristics |
| :--- | :--- | :--- |
| **Desktop Application** | Full business administration, finance, and operations | High information density, multi-column comparison tables, detail split views, reports, and settings. |
| **Android Application** | Mobile business management and on-the-go operations | Compact navigation, mobile-native cards, bottom sheets, quick voice logging, and offline synchronization. |
| **Client Web Portal** | Client onboarding, project tracking, approvals, and receipts | Zero-installation, responsive web portal accessed via cryptographically secure, predictable-id-free access links. |

Clients are never required to install an application; they interact via responsive web links and automated WhatsApp notifications.

---

### 2. PRODUCT DESIGN PRINCIPLES

#### 2.1 Minimalist Interface
The application must present as a refined, human-crafted commercial tool. Avoid decorative clutter, unnecessary explanations, redundant subtitles, and visual noise:
- Do not add explanatory paragraphs under module titles.
- Do not attach obvious tooltips to self-explanatory controls.
- Use concise, active labels: *"New Client"* instead of *"Click this button to create a new client"*; *"Overview"* instead of *"Here is an overview of all your business activities"*.
- Assume the user understands standard enterprise application conventions.

#### 2.2 Anti-AI-Slop & Design Discipline
Do not apply synthetic or AI-generated design clichés:
- No oversized decorative cards or gratuitous gradient blobs.
- No random decorative icons or emojis as UI symbols.
- No fake charts or vanity metrics communicating zero business value.
- Maintain a disciplined, crisp light-mode aesthetic: Canvas `#F5F8FC`, Surface `#FFFFFF`, Primary Interactive `#0D5EF4`, Dark Slate Typography `#0B192C`, and Subdued Borders `#E2E8F0`.

#### 2.3 Information Density & Desktop Efficiency
The desktop workspace must optimize widescreen real estate using:
- Sortable, searchable multi-column tables with fixed headers.
- Contextual three-dot row action menus.
- Split panels and master-detail layouts.
- Summary footers displaying instant counts and segment totals.
- Fast-action keyboard shortcuts and quick navigation command bars.

#### 2.4 Responsive Viewport Discipline & Anti-Collision Architecture
The UI must be deliberately designed for each screen size rather than mechanically compressed:
- **Zero-Collision Sticky Headers**: Every detail page header (`DetailViewHeader`) is built with a solid, 100% opaque `#F5F8FC` backdrop, negative margin gutter coverage (`-mt-3.5 pt-3.5 -mx-3.5 px-3.5 sm:-mt-5 sm:pt-5 sm:-mx-5 sm:px-5`), elevated `z-30` hierarchy, and a clean dividing border. Content scrolling underneath must never bleed, ghost, or collide with header titles or action buttons on any mobile or desktop screen.
- **Mobile Card Transformation**: On small viewports (`< sm`), wide multi-column tables automatically transform into touch-friendly native cards with clear action bars, preventing horizontal overflow and awkward text truncation.
- **Chrome-Grade Scrollbars**: Modern, ultra-slim scrollbars (`scrollbar-width: thin`, subtle 5px tracks, rounded translucent thumbs, and high-contrast active feedback).

---

### 3. ANDROID AND DESKTOP UI/UX DISTINCTIONS

#### 3.1 Desktop Application
The primary administrative cockpit providing complete operational control:
- **Persistent Sidebar Navigation**: Organized logically into distinct functional tiers:
  - *Workspace*: Dashboard, Inbox (WhatsApp), Leads, Clients.
  - *Business*: Quotations, Projects, Invoices, Payments, Expenses, Documents.
  - *Operations & Delivery*: Tasks, Calendar & Schedule, Reports, Automations, Services Catalog.
  - *System*: Voice AI Assistant, Settings.
- **Desktop Data Mechanics**: Sortable table headers, column alignment (numeric right-aligned with monospace font), tabular currency rendering, and bulk operations.
- **Primary vs Secondary Buttons**: Primary actions feature icon and text combinations (e.g. `+ Add Service`, `+ New Invoice`); icon-only buttons are reserved for standardized secondary actions (Edit, Delete, Search, Refresh, Back).

#### 3.2 Android Application
Optimized for rapid mobility, one-handed triage, and on-site client interactions:
- **5-Tab Mobile Navigation**:
  1. *Home* (Dashboard highlights & quick actions)
  2. *Clients* (Client directory & contact cards)
  3. *Projects* (Active delivery progress & milestones)
  4. *Finance* (Invoices, quick payment recording, receipts)
  5. *More* (Inbox, Services, Calendar, Documents, Expenses, Settings)
- **Mobile Interaction Patterns**: Bottom sheets for fast record capture, touch-friendly card lists, native date pickers, swipeable contextual actions, and pull-to-refresh.

#### 3.3 Shared Design System
Both platforms enforce consistent:
- Typography: `Plus Jakarta Sans` for clean interface copy, `JetBrains Mono` for currency figures, invoice numbers, and timestamps.
- Palette: `#F5F8FC` canvas, `#FFFFFF` cards, `#0D5EF4` active blue, `#16A34A` financial green, `#EF4444` alerts.
- Currency representation: Symbol-first formatting (`₦` standard Naira prefix with thousand separators; `$` USD, `€` EUR, `£` GBP supported via settings).

---

### 4. CORE BUSINESS WORKFLOW

The application governs the seamless, end-to-end service provider lifecycle:

```
Lead Capture → WhatsApp/Form Enquiry → Requirements Discovery → Scope & Baseline Rate Selection →
Quotation Proposal → Client Review & Revision → Acceptance & Agreement →
Milestone Deposit Invoice → Payment Recording & Receipt → Operational Scheduling & Calendar Sync →
Project Execution & Task Delivery → Client Review & Change Requests →
Final Balance Invoice → Handover & Sign-off → Ongoing Maintenance & Support Retainers
```

Information entered at any step automatically cascades forward without manual re-entry:
- Accepting a quotation converts the lead into a verified client.
- The approved scope automatically generates project milestones and linked task templates.
- Deposit invoices are drafted matching the quotation payment terms.
- A unique client portal access token is provisioned.
- Milestones and due dates populate the unified operational calendar.

---

### 5. DASHBOARD & BUSINESS INTELLIGENCE

#### 5.1 Strictly Segregated Financial Summary
Financial metrics must never be conflated or treated as interchangeable:
1. **Quoted Amount**: Sum of all active sent and accepted quotations.
2. **Contracted Amount**: Legally agreed contract values of all active projects.
3. **Invoiced Amount**: Total issued billings (excluding drafts and cancelled invoices).
4. **Collected Revenue**: Actual verified payments received and reconciled.
5. **Outstanding Balance**: Remaining unpaid balance due on issued invoices.
6. **Overdue Amount**: Outstanding balance on invoices past their due date.

Summary cards on mobile utilize compact notation (e.g., `₦24.3K`, `₦1.2M`) for immediate readability.

#### 5.2 Operational Indicators & Quick Actions
- Real-time activity timeline tracking new leads, milestone sign-offs, payments, and client portal visits.
- Direct quick-action shortcuts: `New Lead`, `New Client`, `New Quote`, `New Invoice`, `Record Payment`, `Add Expense`, `Voice Record`.

---

### 6. CRM: LEADS AND CLIENTS

#### 6.1 Lead Capture & Pipeline Tracking
- **Captured Attributes**: Name, company, email, phone, lead source, service requested, initial enquiry brief, estimated deal value, expected timeline, stated budget, follow-up date, and internal notes.
- **Pipeline Statuses**: *New Enquiry*, *Contacted*, *Discussion*, *Requirements Gathering*, *Preparing Quotation*, *Quotation Sent*, *Negotiation*, *Converted*, *Lost*.

#### 6.2 Lead-to-Client Conversion
- 1-click conversion creates a confirmed Client record while archiving the complete lead interaction history.
- Pre-existing conversations, submitted onboarding forms, and draft quotes remain permanently linked.

#### 6.3 Comprehensive Client Records
A unified client dossier housing:
- Contact information, business address, and preferred channel (WhatsApp, Email, Phone).
- Active and completed projects count.
- Executive financial ledger: Total billed, total paid, collection rate progress bar, and balance due.
- Linked quotations, signed agreements, invoices, receipts, project documents, support tickets, and activity timeline.
- Client Portal credentials (token management and instant preview link).

---

### 7. SERVICES CATALOG & BASELINE RATES MANAGEMENT

#### 7.1 Configurable Service Repository
The business owner has full administrative control to create, modify, and delete services in the catalog:
- **Service Name**: Clear commercial title (e.g., *"Custom SaaS Architecture"*, *"Mobile Application MVP"*, *"Monthly Cloud Maintenance"*).
- **Service Category**: Preset industry classifications (*Software Development*, *Consulting & Strategy*, *UI/UX Design*, *Cloud Infrastructure*, *Maintenance & Support*, *Digital Marketing*) with support for custom categories.
- **Baseline Rate**: Default commercial unit rate in the active business currency.
- **Billing Model**:
  - `fixed`: Lump-sum deliverable or milestone-based project billing.
  - `hourly`: Billed per logged timesheet hour (`/hr`).
  - `monthly`: Recurring retainer billing per calendar month (`/mo`).
- **Commercial Deliverable Description**: Detailed scope of work, technical specifications, revision limits, and handover inclusions.

#### 7.2 Interactive Live Scope Cost Estimator
Every service detail page features an embedded calculation tool:
- Dynamically calculates projected totals based on quantity (hours, months, or project scope units).
- Includes a 1-click `Create Quote →` button that ports service scope and pricing directly into a new quotation draft.

#### 7.3 Data Protection & Mobile Delivery
- Deletions require explicit confirmation dialogs to prevent accidental catalog removal.
- Dedicated mobile card presentation provides swift touch access to edit rates, duplicate, or quote without table horizontal scroll.

---

### 8. CALENDAR, SCHEDULE & GOOGLE WORKSPACE INTEGRATION

#### 8.1 Google Calendar Operational Engine
A unified scheduling suite built to match Google Calendar's intuitive clarity:
- **Multi-Stream Operational Synchronization**:
  - Project milestone deadlines and handover dates.
  - Invoice due dates and overdue payment alerts.
  - Lead follow-up appointments and client meetings.
  - Daily operational log entries and contractor work journals.
  - Public holidays and official business off-days.
- **Multi-Category Color Coding**: Standardized visual indicators (*Completed*, *Overdue*, *Ongoing*, *To Start*, *Reminders*, *Daily Journal*, *Public Holiday*).
- **1-Click Month-to-Day Navigation**: Clicking any date cell in the Month grid instantly pivots to the detailed Day timeline (08:00 – 18:00 hourly view).
- **Glass Sheet Event Inspector**: Clicking any calendar entry opens a sleek iOS-inspired inspection sheet displaying related record links (jump directly to invoice, client, or project).

#### 8.2 Swift-Inspired Minimalist Floating Trigger
- An unobtrusive, icon-only calendar button anchored to the bottom-right corner of the workspace.
- Features an Apple/SwiftUI-inspired dynamic calendar date icon (`TUE 10`) with a subtle unread/active notification dot.
- Floats seamlessly above content across desktop and mobile viewports, providing 1-click access to the full schedule drawer from any module.

#### 8.3 Google Workspace Calendar Bi-Directional Sync
- Built with client-side Google OAuth 2.0 integration (`https://www.googleapis.com/auth/calendar.events`, `https://www.googleapis.com/auth/calendar.readonly`).
- Enables syncing scheduled milestones, client calls, and project deliverables with external Google Calendar accounts.

---

### 9. WHATSAPP BUSINESS & INBOX WORKSPACE

#### 9.1 Official Cloud API Architecture
- Leverages the official WhatsApp Business Cloud Platform.
- Dual-channel message synchronization: Real-time webhook ingestion and outgoing message delivery.

#### 9.2 Dual-Pane Inbox UX
- **Responsive Conversation Directory**: Displays active contacts, client association, latest message snippet, unread message badges, and delivery status.
- **Interactive Chat Drawer**: Supports full chat history, template messages, document sharing, and quote transmission.

#### 9.3 AI Enquiry Assistant & Guardrails
- **Automated Capture**: Greets new contacts, identifies requested service category, and extracts preliminary requirements.
- **Strict Boundary Enforcements**: AI is strictly prohibited from agreeing to binding prices, signing contracts, promising unverified completion dates, or confirming payments without financial verification.
- **Instant Human Handover**: The business owner can toggle the Human Handover switch at any time. When active, bot automation is paused immediately, ensuring the owner and bot never reply simultaneously.

---

### 10. CLIENT ONBOARDING & FORM BUILDER

#### 10.1 Self-Contained Form Engine
Independent of third-party dependencies (no mandatory Google Forms):
- Supports text, email, phone, number, dropdown, multi-select, date, file upload, and long-form textarea fields.
- Field-level validation, custom order, mandatory flags, and branded submission screens.
- Generates public, secure web links for client completion.

#### 10.2 Service-Specific Templates
Pre-configured templates for Software MVPs, Mobile Applications, Website Redesigns, Database Audits, and Maintenance Requests.

#### 10.3 Ingestion Workflow
Submitting an onboarding form validates entries, creates or updates the corresponding lead, archives attachments, and notifies the owner on their activity timeline.

---

### 11. QUOTATION & AGREEMENT MANAGEMENT

#### 11.1 Quotation Builder
- Multi-line item configuration with unit rates sourced from the Services Catalog.
- Line-item quantity, tax percentage, fixed discounts, payment milestones, validity expiry dates, and delivery estimates.
- Downloadable, branded PDF generation.

#### 11.2 Immutable Revision History
- Every quotation modification produces an incremented version number (`v1`, `v2`, `v3`).
- Previous revisions, changed line items, and revision reasons are permanently preserved. Approved quotations can never be overwritten.

#### 11.3 Client Review & Sign-Off
- Clients access quotations via their secure portal link.
- Capabilities: Accept proposal, reject with feedback, or submit line-item revision requests.

#### 11.4 Scope of Work & Change Requests
- Accepted quotations automatically establish the project's baseline Scope of Work.
- Post-approval additions must be submitted as formal **Change Requests** detailing cost impact and schedule impact before being absorbed into the project agreement.

---

### 12. INVOICE & PAYMENT MANAGEMENT

#### 12.1 Invoice Structure & Types
- Types: Deposit Invoices, Milestone Invoices, Balance Invoices, Recurring Retainers, and Additional Scope Invoices.
- Automatic sequential numbering (`INV-001`, `INV-002`) with custom prefix support.
- Line items, applied VAT tax rate, discount deduction, balance due calculation, and bank transfer instructions.
- Statuses: *Draft*, *Sent*, *Partially Paid*, *Paid*, *Overdue*, *Cancelled*.

#### 12.2 Payment Reconciliation & Receipts
- Independent payment ledger tracking transaction date, payment method, bank reference, and allocation against invoices.
- Supports partial payments, multiple payments against a single invoice, and overpayments.
- Recording a payment instantly recalculates outstanding invoice balance, marks settled invoices as *Paid*, generates an official PDF Receipt, and cancels outstanding payment reminders.

#### 12.3 Automated Reminder Safeguards
- Automated reminders (before due date, on due date, and overdue escalations) check invoice balance prior to sending.
- Reminders automatically suppress if the invoice is settled, and partial payments dynamically adjust the reminder message to reflect the exact remaining balance.

---

### 13. PROJECT & TASK MANAGEMENT

#### 13.1 Project Lifecycle & Stages
Software delivery stages:
1. *Requirements* → 2. *Planning* → 3. *Design* → 4. *Development* → 5. *Internal Testing* →
6. *Client Review* → 7. *Revisions* → 8. *Deployment* → 9. *Handover* → 10. *Completed*.

#### 13.2 Weighted Milestones & Objective Progress
- Project progress is calculated deterministically from completed milestones or weighted deliverables.
- AI is never permitted to fabricate or estimate project completion percentages.
- Milestones feature client visibility flags, target due dates, and linked billing triggers.

#### 13.3 Project Tasks & Templates
- Granular task lists with priorities (*Low*, *Medium*, *High*, *Urgent*), target deadlines, and status flags.
- Reusable project templates instantly generate standard milestone and task hierarchies upon contract signing.

---

### 14. CLIENT WEB PORTAL

#### 14.1 Zero-Install, Tokenized Security
- Each client accesses their dedicated portal through a unique, cryptographically random token (`portalToken`).
- No predictable sequential record IDs are exposed in URLs.
- Tokens can be expired or re-issued instantly by the business owner.

#### 14.2 Client Self-Service Capabilities
- Track active project progress and completed milestone deliverables.
- Review and approve draft quotations.
- Download invoices and official payment receipts.
- View bank transfer instructions and upload payment confirmation slips.
- Submit support tickets, maintenance requests, and project change requests.

#### 14.3 Absolute Information Privacy Barrier
The client portal strictly filters all backend data:
- Internal notes, private task comments, contractor rates, business expenses, profit margins, AI prompts, and other clients' records are completely excluded from client portal payloads.

---

### 15. EXPENSE MANAGEMENT & TRUE PROJECT PROFITABILITY

#### 15.1 Operating & Direct Project Expenses
Track hosting fees, software licenses, API subscriptions, hardware purchases, contractor disbursements, and transport costs.

#### 15.2 Recognized Profit Calculation
```
Project Profit = Cash Collected (Recognized Revenue) - Direct Project Expenses
```
Financial reports explicitly distinguish between *Contracted Profit Margin* (estimated) and *Realized Cash Profit* (actual cash collected minus expenses paid).

---

### 16. VOICE AI & BUSINESS PRODUCTIVITY ASSISTANT

#### 16.1 Voice Command Ingestion
- Hands-free audio recording and voice command interpretation on mobile and desktop:
  - *"Record a payment of fifty thousand naira for the Vertex Financial project."*
  - *"Mark the UI design milestone as completed for Kestrel Real Estate."*
  - *"Create a new lead for John Doe from Acme Corp interested in mobile app development."*

#### 16.2 Structured Review & Approval Guardrail
- Spoken voice commands are parsed into structured draft transactions.
- The business owner must review and confirm the parsed details before financial entries or client records are written to the database.

---

### 17. AUTOMATIONS & NOTIFICATIONS ENGINE

#### 17.1 Event-Driven Architecture
Automations follow a strict `Trigger → Condition → Action` pipeline:
- *Trigger*: Quotation Accepted → *Condition*: Valid signature recorded → *Actions*: Convert lead to client, generate project from template, issue deposit invoice, email welcome package with portal link.
- *Trigger*: Payment Recorded → *Condition*: Balance equals zero → *Actions*: Update invoice to Paid, issue receipt, notify client, cancel pending payment reminders.
- *Trigger*: Invoice Overdue → *Condition*: Balance > 0 and days past due >= 3 → *Actions*: Send friendly WhatsApp/Email reminder, update reminder history log.

#### 17.2 Backend Reliability
All scheduled reminders and cron operations execute server-side, ensuring reliability even when the owner's desktop and mobile devices are closed or offline.

---

### 18. SETTINGS & MULTI-CURRENCY CONFIGURATION

#### 18.1 Business & Tax Variables
- Business legal name, owner name, address, contact email, phone, and banking details.
- Multi-currency support: Standard currency selection (`NGN`, `USD`, `EUR`, `GBP`) with symbol-first rendering (`₦`, `$`, `€`, `£`).
- Dynamic VAT tax rate configuration (e.g., 7.5% or custom rate) with automatic recalculation across quotations and invoices.
- Invoice and Quotation numbering prefixes (`INV-`, `QT-`) and default payment terms (e.g., 14 days).

#### 18.2 Integration Credentials
- Secure configuration for Google Workspace OAuth (Calendar, Drive).
- WhatsApp Business Cloud API credentials (Phone Number ID, Access Token, Webhook Secret).
- AI model provider configurations and token expenditure caps.

---

### 19. TECHNICAL ARCHITECTURE & STACK

| Component | Target / Implemented Stack | Architectural Role |
| :--- | :--- | :--- |
| **Frontend Runtime** | React 19 + TypeScript + Vite | Modular, hook-based SPA with fast client routing and rich interaction mechanics. |
| **Styling & Theme** | Tailwind CSS v4 | Strict design system enforcement, custom Chrome-grade scrollbars, zero-pill discipline. |
| **State & Local Cache** | React Context (`BusinessContext`) + LocalStorage Cache | Resilient local-first state synchronization, instant UI updates, offline-ready operations. |
| **Database & Auth** | Supabase / PostgreSQL + Row Level Security | Relational schemas, strict foreign keys, atomic financial transactions, and RBAC policies. |
| **Mobile Runtime** | Android Native (Kotlin) / Responsive PWA | High-performance mobile client with bottom navigation, camera/document upload, and push alerts. |
| **External APIs** | Google Calendar API + WhatsApp Cloud API + Gemini AI | Bi-directional scheduling, client messaging, and natural language voice/text processing. |
| **Document Engine** | In-Browser & Server-side PDF Synthesis | Clean, branded invoices, quotations, and payment receipts. |

---

### 20. DATABASE SCHEMA SPECIFICATIONS

Key relational entities governing the system:
- `businesses`: Workspace identities and multi-tenant scoping.
- `services`: Catalog offerings, categories, baseline rates, and billing models (`fixed`, `hourly`, `monthly`).
- `leads`: Pre-conversion prospective client pipeline.
- `clients`: Confirmed customer records and communication preferences.
- `quotations` & `quotation_items`: Multi-item proposals with tax and milestone breakdowns.
- `quotation_versions`: Historical snapshots of modified proposals.
- `agreements`: Executed scopes of work and approved change requests.
- `projects`, `milestones`, `tasks`: Project delivery hierarchy and progress tracking.
- `calendar_events` & `schedule_logs`: Unified operational dates, daily journals, and deadline entries.
- `invoices` & `invoice_items`: Financial billings and tax summaries.
- `payments`: Individual settlement transactions and receipt metadata.
- `expenses`: Direct project and general operational expenditure.
- `conversations` & `messages`: WhatsApp communication history and handover states.
- `portal_tokens`: Cryptographic access credentials for client self-service.
- `automation_rules` & `automation_logs`: Event-driven trigger configurations and run audits.

---

### 21. SECURITY, DATA INTEGRITY & AUDIT RULES

1. **Relational Integrity**: Deleting a client or project must never silently delete issued invoices or financial records. Soft deletion is enforced for auditable entities.
2. **Deterministic Financial Math**: All monetary totals use decimal arithmetic with two fixed fractional digits; financial values are never estimated or rounded arbitrarily.
3. **Immutability of Executed Agreements**: Approved quotations and signed agreements cannot be edited in place; amendments require versioned revisions or approved change requests.
4. **Verified Payment Crediting**: Invoices cannot be marked as *Paid* without a verified payment record or backend transaction confirmation.
5. **Strict Portal Boundary**: Client portal responses are sanitized at the database/API query level to prevent leakage of internal costs, notes, or third-party client details.
6. **AI Decision Boundary**: AI systems may summarize, draft, and assist, but are technically restricted from executing financial transactions, signing agreements, or issuing legally binding commitments.

---

### 22. DEFINITION OF DONE & RELEASE MILESTONES

#### Current Milestone Status: Foundation, Operations & Catalog Complete
- [x] Responsive desktop workspace with sidebar navigation and mobile 5-tab navigation.
- [x] Full CRM pipeline (Leads capture, status lifecycle, 1-click Client conversion).
- [x] Configurable Services Catalog with custom baseline rates (Fixed, Hourly, Monthly) and interactive quote estimator.
- [x] Zero-collision sticky detail headers (`DetailViewHeader`) with solid `#F5F8FC` backdrop and full edge coverage across all 10 modules.
- [x] Full-featured Google Calendar style operational schedule with 1-click Month-to-Day navigation and floating SwiftUI-inspired trigger.
- [x] Quotations, Invoices, Partial Payments, and PDF generation with symbol-first currency formatting (`₦`).
- [x] WhatsApp Business inbox with conversation cards and instant Human Handover toggle.
- [x] Voice AI assistant with voice command transcription and structured transaction drafting.
- [x] Zero-install Client Web Portal with token-based access control.
- [x] Local storage persistence layer for complete offline resilience.

#### Next Milestone: Cloud Multi-Tenant Deployment
- [ ] Connect production Supabase PostgreSQL instance with active Row Level Security.
- [ ] Webhook listener for verified payment gateways (Paystack / Flutterwave).
- [ ] Automated background cron jobs for scheduled WhatsApp payment reminders.
- [ ] Native Kotlin Android build packaging via Compose Multiplatform.
