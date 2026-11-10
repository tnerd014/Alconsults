# Business Rules & Invariants

1. **Lead vs Client Separation**: A lead is a prospect and becomes a client only upon conversion or quotation acceptance.
2. **Quotation Immutability**: Once accepted by a client, a quotation cannot be modified; any adjustments require a new quotation version or change request.
3. **Financial Segregation**:
   - `Quoted Amount`: Total of draft/sent quotations.
   - `Contracted Amount`: Total of approved agreements / active project budgets.
   - `Invoiced Amount`: Total of issued invoices.
   - `Collected Amount`: Verified payments received.
   - `Outstanding Amount`: Invoiced minus Collected.
   *These five metrics are never treated interchangeably.*
4. **Payment Recording & Invoice Balances**:
   - Invoices are never marked Paid without a corresponding recorded payment transaction.
   - Partial payments decrement the outstanding invoice balance and mark status as `Partially Paid`.
   - Settled invoices (`Paid`) automatically halt pending automated payment reminders.
5. **Project Progress Integrity**: Progress % is derived strictly from weighted milestones or completed tasks—never hallucinated.
6. **Client Privacy Boundary**: Internal notes, business margins, contractor costs, and private task chats must never be visible to the Client Portal.
7. **Human-in-the-Loop Safeguards**: AI assistance may propose draft quotations, summarise conversations, or draft emails, but may never independently finalize prices, commit to project deadlines, or execute legal agreements without human approval.
