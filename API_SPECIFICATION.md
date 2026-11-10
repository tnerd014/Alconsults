# API Specification & Endpoint Contracts

## 1. CRM & Lead Management
- `POST /api/leads` - Ingest new lead from web forms, WhatsApp, or manual entry.
- `GET /api/leads` - List leads with filters (`status`, `service`, `search`).
- `PATCH /api/leads/:id/status` - Transition lead pipeline status.
- `POST /api/leads/:id/convert` - Atomic conversion of Lead to Client record.

## 2. Quotation Engine
- `POST /api/quotations` - Create new multi-line item quotation.
- `POST /api/quotations/:id/revisions` - Append immutable quotation revision version.
- `POST /api/quotations/:id/accept` - Client/Owner approval triggering the automation cascade.
- `POST /api/quotations/:id/reject` - Record client decline with reason.

## 3. Financials & Invoicing
- `POST /api/invoices` - Generate milestone, deposit, full, or recurring invoice.
- `GET /api/invoices` - Query invoices with status breakdown.
- `POST /api/payments` - Record verified payment transaction, decrement balance, issue receipt.
- `POST /api/invoices/:id/remind` - Dispatch payment reminder over WhatsApp/Email.

## 4. Project & Scope Governance
- `GET /api/projects/:id` - Full project record, milestones, tasks, and change requests.
- `PATCH /api/projects/:id/milestones/:mId/toggle` - Toggle milestone status & recalculate progress.
- `POST /api/projects/:id/change-requests` - Submit client scope change.
- `PATCH /api/projects/:id/change-requests/:crId/review` - Approve/Decline change request.

## 5. Client Portal & Support
- `GET /api/portal/auth/:token` - Authenticate client via secure random token.
- `GET /api/portal/deliverables` - Filtered client-visible files only.
- `POST /api/portal/tickets` - Submit post-delivery maintenance ticket.
