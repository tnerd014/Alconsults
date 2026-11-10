import React, { useState } from 'react';
import { BusinessProvider, useBusiness } from './context/BusinessContext';
import { ToolbarProvider } from './components/common/SearchAndFilterBar';
import { Sidebar } from './components/desktop/Sidebar';
import { MobileTopBar, MobileBottomNav } from './components/mobile/MobileNavigation';
import { DashboardView } from './components/desktop/DashboardView';
import { LeadsView } from './components/desktop/LeadsView';
import { ClientsView } from './components/desktop/ClientsView';
import { QuotationsView } from './components/desktop/QuotationsView';
import { ProjectsView } from './components/desktop/ProjectsView';
import { InvoicesView } from './components/desktop/InvoicesView';
import { PaymentsView } from './components/desktop/PaymentsView';
import { ExpensesView } from './components/desktop/ExpensesView';
import { DocumentsView } from './components/desktop/DocumentsView';
import { TasksView } from './components/desktop/TasksView';
import { ReportsView } from './components/desktop/ReportsView';
import { AutomationsView } from './components/desktop/AutomationsView';
import { InboxWhatsAppView } from './components/desktop/InboxWhatsAppView';
import { AIAssistantView } from './components/desktop/AIAssistantView';
import { FormsView } from './components/desktop/FormsView';
import { SettingsView } from './components/desktop/SettingsView';
import { ServicesView } from './components/desktop/ServicesView';
import { ClientPortalView } from './components/portal/ClientPortalView';
import { NewLeadModal } from './components/modals/NewLeadModal';
import { NewClientModal } from './components/modals/NewClientModal';
import { NewQuotationModal } from './components/modals/NewQuotationModal';
import { NewInvoiceModal } from './components/modals/NewInvoiceModal';
import { RecordPaymentModal } from './components/modals/RecordPaymentModal';
import { AddExpenseModal } from './components/modals/AddExpenseModal';
import { Invoice } from './types';
import { ArrowLeft, Globe } from 'lucide-react';
import { CalendarFlyoutDrawer } from './components/calendar/CalendarFlyoutDrawer';

const MainLayout: React.FC = () => {
  const { platformView, setPlatformView, activeTab } = useBusiness();

  // Global creation modals state
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [targetInvoiceForPayment, setTargetInvoiceForPayment] = useState<Invoice | null>(null);

  const handleOpenQuickAction = (action: string) => {
    if (action === 'lead') setIsLeadModalOpen(true);
    else if (action === 'client') setIsClientModalOpen(true);
    else if (action === 'quotation') setIsQuotationModalOpen(true);
    else if (action === 'invoice') setIsInvoiceModalOpen(true);
    else if (action === 'payment') {
      setTargetInvoiceForPayment(null);
      setIsPaymentModalOpen(true);
    } else if (action === 'expense') setIsExpenseModalOpen(true);
  };

  // Contextual Client Portal View (Launched directly from Client Profiles)
  if (platformView === 'portal') {
    return (
      <div className="h-screen bg-[#F5F8FC] text-[#0B192C] flex flex-col font-sans overflow-hidden">
        {/* Contextual Return Banner (Fixed in place at top) */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 z-40">
          <div className="flex items-center gap-2 text-xs text-[#0B192C]">
            <Globe className="w-3.5 h-3.5 text-[#0D5EF4]" />
            <span className="font-bold">Client Portal Preview</span>
          </div>
          <button
            onClick={() => setPlatformView('desktop')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#0D5EF4] hover:bg-blue-700 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Workspace</span>
          </button>
        </div>

        <main className="flex-1 overflow-y-auto bg-[#F5F8FC]">
          <ClientPortalView />
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F5F8FC] text-[#0B192C] flex overflow-hidden font-sans">
      {/* Desktop 2-Level Minimalist Sidebar (Hidden on Mobile < lg) */}
      <Sidebar onOpenCalendar={() => setIsCalendarOpen(true)} />

      {/* Main Responsive Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile Compact Header (< lg) */}
        <MobileTopBar
          onOpenQuickAction={handleOpenQuickAction}
          onOpenCalendar={() => setIsCalendarOpen(true)}
        />

        {/* Single Active Module Viewport */}
        <main className="flex-1 bg-[#F5F8FC] overflow-y-auto min-h-0 pb-20 lg:pb-6 focus:outline-none">
          {activeTab === 'dashboard' && (
            <DashboardView onOpenQuickAction={handleOpenQuickAction} />
          )}
          {activeTab === 'inbox' && <InboxWhatsAppView />}
          {activeTab === 'leads' && (
            <LeadsView onNewLead={() => setIsLeadModalOpen(true)} />
          )}
          {activeTab === 'clients' && (
            <ClientsView onNewClient={() => setIsClientModalOpen(true)} />
          )}
          {activeTab === 'quotations' && (
            <QuotationsView onNewQuotation={() => setIsQuotationModalOpen(true)} />
          )}
          {activeTab === 'projects' && <ProjectsView />}
          {activeTab === 'invoices' && (
            <InvoicesView
              onNewInvoice={() => setIsInvoiceModalOpen(true)}
              onRecordPayment={(inv) => {
                setTargetInvoiceForPayment(inv || null);
                setIsPaymentModalOpen(true);
              }}
            />
          )}
          {activeTab === 'payments' && (
            <PaymentsView
              onRecordPayment={() => {
                setTargetInvoiceForPayment(null);
                setIsPaymentModalOpen(true);
              }}
            />
          )}
          {activeTab === 'expenses' && (
            <ExpensesView onAddExpense={() => setIsExpenseModalOpen(true)} />
          )}
          {activeTab === 'documents' && <DocumentsView />}
          {activeTab === 'tasks' && <TasksView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'automations' && <AutomationsView />}
          {activeTab === 'services' && <ServicesView />}
          {activeTab === 'ai-assistant' && <AIAssistantView />}
          {activeTab === 'forms' && <FormsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>

        {/* Mobile 5-Tab Bottom Navigation + More Hub (< lg) */}
        <MobileBottomNav />
      </div>

      {/* Global Creation Modals */}
      <NewLeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
      />
      <NewClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
      />
      <NewQuotationModal
        isOpen={isQuotationModalOpen}
        onClose={() => setIsQuotationModalOpen(false)}
      />
      <NewInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
      />
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        targetInvoice={targetInvoiceForPayment}
      />
      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />

      {/* Floating Side Button & Slide-Out Calendar Drawer */}
      <CalendarFlyoutDrawer
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onOpen={() => setIsCalendarOpen(true)}
      />
    </div>
  );
};

export default function App() {
  return (
    <BusinessProvider>
      <ToolbarProvider>
        <MainLayout />
      </ToolbarProvider>
    </BusinessProvider>
  );
}
