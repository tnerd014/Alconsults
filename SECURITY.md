# Security & Privacy Policy

## 1. Information Privacy Boundaries
- **Strict Client Portal Isolation**: Internal notes, private discussions, contractor expenses, profit margins, and AI raw logs are never sent to the Client Portal.
- **Client Document Visibility**: Documents require an explicit `isClientVisible: true` flag to be rendered in the client portal vault.

## 2. Authentication & Access Tokens
- **Portal Tokens**: Cryptographically random alphanumeric tokens (`portal-token-xxxxxxxx`) prevent sequential record scraping or IDOR vulnerabilities.
- **Token Invalidation**: Ability to revoke and reissue access tokens at any time.

## 3. Human Approval Safeguards
- **AI Boundaries**: AI is restricted to assistance, extraction, drafting, and query analysis. AI may never independently approve quotations, alter contractual scopes, or confirm unverified payments.

## 4. Financial Integrity Invariants
- **No Unbacked Paid Status**: Invoices are never marked Paid without a corresponding recorded payment transaction.
- **Audit Trails**: Every payment and quotation revision maintains an immutable timestamped log.
