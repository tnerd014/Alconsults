# System Architecture

## Architectural Layers
```
┌────────────────────────────────────────────────────────┐
│                   Presentation Layer                   │
│   Desktop Admin Web  │  Android Mobile  │  Client Portal│
├────────────────────────────────────────────────────────┤
│                 Application & State Layer              │
│       Store / Context / Repositories / Dispatcher      │
├────────────────────────────────────────────────────────┤
│                   Domain / Business Rules              │
│    Calculations (Progress, Profit), Validation, Engine │
├────────────────────────────────────────────────────────┤
│                  Automation & Integrations             │
│    Event Bus, WhatsApp Connector, Gemini AI Agent      │
├────────────────────────────────────────────────────────┤
│                     Data Persistence                   │
│         Relational Stores (IndexedDB / Supabase)       │
└────────────────────────────────────────────────────────┘
```

## Key Principles
1. **Separation of Concerns**: Presentation views never directly mutate raw database state without running through domain validation.
2. **Deterministic Calculations**: Project progress, invoice balances, and profitability follow explicit decimal formulas without AI approximations.
3. **Multi-Platform Consistency**: Business logic, status enums, and data models remain uniform across Desktop, Android, and Client Portal.
4. **Backend-First Automation**: Automation events (reminders, status cascades) are processed deterministically with idempotency keys.
