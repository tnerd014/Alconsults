# Automation Engine Specification

## Event Triggers, Conditions & Actions

### 1. Quotation Accepted
- **Trigger**: Client clicks "Accept" on Quotation vX via portal or email link.
- **Conditions**: Quotation is in `Sent` or `Negotiation` state and not previously accepted.
- **Actions**:
  1. Update quotation status to `Accepted`.
  2. If client does not exist, convert Lead to Client.
  3. Create Project record with scope & budget initialized from Quotation.
  4. Generate milestones based on agreed service template.
  5. Generate initial Deposit Invoice (e.g. 50% deposit).
  6. Generate secure Client Portal token and send welcome notification.
  7. Log event in Business Owner activity feed.

### 2. Payment Received
- **Trigger**: New payment recorded against an Invoice.
- **Conditions**: Payment amount > 0.
- **Actions**:
  1. Recalculate invoice outstanding balance.
  2. If balance == 0, mark invoice as `Paid`, otherwise `Partially Paid`.
  3. Issue automated Payment Receipt.
  4. Cancel scheduled overdue payment reminders for settled invoices.
  5. Add to project financials.

### 3. Payment Reminder Schedule
- **Schedule**:
  - 5 days before due date (Upcoming reminder)
  - Due date (Due today alert)
  - 3 days overdue (Friendly follow-up)
  - 7 days overdue (Urgent notice)
  - 14 days overdue (Final notice)
- **Condition**: Invoice balance > 0 and invoice not cancelled.
