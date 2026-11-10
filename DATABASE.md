# Database Specification & Entity Models

## Primary Entities
1. `businesses`: `{ id, name, currency, tax_rate, bank_details, created_at }`
2. `leads`: `{ id, business_id, name, company, email, phone, service_id, status, estimated_value, timeline, budget, source, follow_up_date, notes, created_at }`
3. `clients`: `{ id, business_id, lead_id, name, company, email, phone, portal_token, address, created_at }`
4. `services`: `{ id, business_id, name, description, default_rate, billing_type }`
5. `forms` & `form_submissions`: Dynamic onboarding questionnaires with custom typed fields.
6. `quotations` & `quotation_items` & `quotation_revisions`: Multi-line quotes with version tracking.
7. `agreements` & `change_requests`: Scopes of work, deliverables, and client-requested change impacts.
8. `projects`: `{ id, client_id, quotation_id, name, stage, progress, start_date, due_date, budget }`
9. `milestones`: `{ id, project_id, title, due_date, weight, status, is_client_visible, invoice_id }`
10. `tasks`: `{ id, project_id, milestone_id, title, priority, status, due_date }`
11. `invoices` & `invoice_items`: Invoicing with itemized lines, discounts, tax, and balance calculation.
12. `payments`: `{ id, invoice_id, client_id, amount, method, transaction_ref, payment_date, notes }`
13. `expenses`: `{ id, project_id, category, description, amount, date, vendor }`
14. `documents`: Central file vault with client visibility flags.
15. `support_tickets`: Client portal submitted requests `{ id, client_id, project_id, title, description, priority, status }`
16. `automation_rules` & `automation_logs`: Event-driven automation definitions and audit records.
17. `conversations` & `messages`: WhatsApp/Email interaction log with AI/human takeover state.
