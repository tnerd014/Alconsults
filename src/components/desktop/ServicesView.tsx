import React, { useState, useMemo } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { ServiceItem } from '../../types';
import {
  Plus,
  Eye,
  FileText,
  Pencil,
  Trash2,
  X,
  Check,
  Calculator,
  Tag,
  DollarSign,
  Layers,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { SearchAndFilterBar } from '../common/SearchAndFilterBar';
import { DetailViewHeader } from '../common/DetailViewHeader';
import {
  useTableSort,
  SortableTh,
  RowActionsMenu,
  TableSummaryFooter,
} from '../common/TableMechanics';

const PRESET_CATEGORIES = [
  'Software Development',
  'Consulting & Strategy',
  'UI/UX & Product Design',
  'Cloud Infrastructure',
  'Maintenance & Support',
  'Digital Marketing',
];

export const ServicesView: React.FC = () => {
  const {
    services,
    profile,
    formatCurrency,
    setActiveTab,
    createService,
    updateService,
    deleteService,
    searchQuery: searchTerm,
    setSearchQuery: setSearchTerm,
    selectedRecordIds,
    setSelectedRecordForTab,
  } = useBusiness();

  const selectedServiceId = selectedRecordIds['services'] || null;
  const setSelectedServiceId = (id: string | null) => setSelectedRecordForTab('services', id);

  const [rateTypeFilter, setRateTypeFilter] = useState<string>('all');

  // Modal State for Add & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formRate, setFormRate] = useState<number | string>(150000);
  const [formRateType, setFormRateType] = useState<'fixed' | 'hourly' | 'monthly'>('fixed');
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);

  // Detail View Interactive Calculator State
  const [calcQuantity, setCalcQuantity] = useState<number>(1);

  const currencySymbol = profile.currencySymbol || (profile.currency === 'NGN' ? '₦' : '$');

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRateType = rateTypeFilter === 'all' || s.rateType === rateTypeFilter;
      return matchesSearch && matchesRateType;
    });
  }, [services, searchTerm, rateTypeFilter]);

  const { sortedItems: sortedServices, sortConfig, handleSort } = useTableSort<ServiceItem>(
    filteredServices,
    'name',
    'asc'
  );

  const selectedService = selectedServiceId
    ? services.find((s) => s.id === selectedServiceId) || null
    : null;

  // Open modal in create mode
  const handleOpenAddModal = () => {
    setEditingService(null);
    setFormName('');
    setFormCategory('Software Development');
    setFormDescription('');
    setFormRate(250000);
    setFormRateType('fixed');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal in edit mode
  const handleOpenEditModal = (service: ServiceItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingService(service);
    setFormName(service.name);
    setFormCategory(service.category);
    setFormDescription(service.description);
    setFormRate(service.defaultRate);
    setFormRateType(service.rateType);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Save handler (Add or Update)
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Please enter a service offering title.');
      return;
    }
    const numRate = Number(formRate);
    if (isNaN(numRate) || numRate < 0) {
      setFormError('Please enter a valid baseline rate (0 or higher).');
      return;
    }

    if (editingService) {
      updateService(editingService.id, {
        name: formName.trim(),
        category: formCategory.trim() || 'General Consulting',
        description: formDescription.trim(),
        defaultRate: numRate,
        rateType: formRateType,
      });
    } else {
      createService({
        name: formName.trim(),
        category: formCategory.trim() || 'General Consulting',
        description: formDescription.trim(),
        defaultRate: numRate,
        rateType: formRateType,
      });
    }

    setIsModalOpen(false);
  };

  // Delete handler
  const handleConfirmDelete = () => {
    if (!serviceToDelete) return;
    deleteService(serviceToDelete.id);
    if (selectedServiceId === serviceToDelete.id) {
      setSelectedServiceId(null);
    }
    setServiceToDelete(null);
  };

  /* ====================================================================== */
  /* PAGE 2: DEDICATED SERVICE DETAIL PAGE                                  */
  /* ====================================================================== */
  if (selectedService) {
    const currentIndex = sortedServices.findIndex((s) => s.id === selectedService.id);
    const estimatedTotal = (Number(calcQuantity) || 0) * selectedService.defaultRate;

    return (
      <div className="p-3.5 sm:p-5 space-y-4 max-w-4xl mx-auto min-h-full flex flex-col">
        <DetailViewHeader
          moduleLabel="Services"
          recordTitle={selectedService.name}
          onBack={() => setSelectedServiceId(null)}
          currentIndex={currentIndex >= 0 ? currentIndex : 0}
          totalCount={sortedServices.length}
          onPrev={
            currentIndex > 0
              ? () => setSelectedServiceId(sortedServices[currentIndex - 1].id)
              : undefined
          }
          onNext={
            currentIndex >= 0 && currentIndex < sortedServices.length - 1
              ? () => setSelectedServiceId(sortedServices[currentIndex + 1].id)
              : undefined
          }
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => handleOpenEditModal(selectedService)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:border-[#0D5EF4] hover:text-[#0D5EF4] rounded-xl shadow-2xs transition-colors shrink-0"
              title="Edit Service Details & Rate"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </button>

            <button
              onClick={() => setServiceToDelete(selectedService)}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-bold text-red-600 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-300 rounded-xl shadow-2xs transition-colors shrink-0"
              title="Delete Service"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveTab('quotations')}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-[#0D5EF4] rounded-xl hover:bg-blue-700 shadow-2xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Quote</span>
            </button>
          </div>
        </DetailViewHeader>

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs p-4 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="min-w-0 flex-1">
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#0D5EF4] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md mb-1.5">
                {selectedService.category}
              </span>
              <h1 className="text-lg sm:text-xl font-extrabold text-[#0B192C] leading-snug">
                {selectedService.name}
              </h1>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Baseline Rate
              </div>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#0D5EF4] tabular-nums">
                {formatCurrency(selectedService.defaultRate)}
                <span className="text-xs font-medium text-slate-500 ml-1">
                  {selectedService.rateType === 'hourly'
                    ? '/hr'
                    : selectedService.rateType === 'monthly'
                    ? '/mo'
                    : ' fixed'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Scope &amp; Commercial Deliverables</span>
            </div>
            <div className="p-4 bg-[#F5F8FC] rounded-xl border border-slate-200/90 text-xs sm:text-sm text-[#0B192C] leading-relaxed whitespace-pre-line">
              {selectedService.description || 'No detailed scope description provided yet.'}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-[#F5F8FC] rounded-xl border border-slate-200/80">
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                Service Category
              </div>
              <div className="font-bold text-[#0B192C] mt-1">{selectedService.category}</div>
            </div>
            <div className="p-3.5 bg-[#F5F8FC] rounded-xl border border-slate-200/80">
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                Billing Model
              </div>
              <div className="font-bold text-[#0B192C] capitalize mt-1 flex items-center gap-1">
                <span>{selectedService.rateType}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({selectedService.rateType === 'hourly' ? 'Per Logged Hour' : selectedService.rateType === 'monthly' ? 'Monthly Retainer' : 'Lump-Sum Deliverable'})
                </span>
              </div>
            </div>
            <div className="p-3.5 bg-[#F5F8FC] rounded-xl border border-slate-200/80">
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                Catalog Status
              </div>
              <div className="font-bold text-[#16A34A] mt-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                <span>Active &amp; Quotable</span>
              </div>
            </div>
          </div>

          {/* Interactive Live Quote Estimator */}
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0D5EF4]">
                <Calculator className="w-4 h-4" />
                <span>Live Scope Cost Estimator</span>
              </div>
              <div className="text-[11px] text-slate-600">
                Quickly project estimated quote total based on baseline rate.
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500">
                  {selectedService.rateType === 'hourly'
                    ? 'Hours:'
                    : selectedService.rateType === 'monthly'
                    ? 'Months:'
                    : 'Units:'}
                </span>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={calcQuantity}
                  onChange={(e) => setCalcQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 text-center text-xs font-mono font-bold text-[#0B192C] focus:outline-none"
                />
              </div>

              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Estimated Total
                </div>
                <div className="text-sm sm:text-base font-extrabold font-mono text-[#0D5EF4] tabular-nums">
                  {formatCurrency(estimatedTotal)}
                </div>
              </div>

              <button
                onClick={() => setActiveTab('quotations')}
                className="px-3 py-1.5 text-xs font-bold text-white bg-[#0D5EF4] hover:bg-blue-700 rounded-xl shadow-2xs transition-colors shrink-0"
              >
                Create Quote →
              </button>
            </div>
          </div>
        </div>

        {/* Modal & Confirmation Components */}
        {renderModals()}
      </div>
    );
  }

  /* ====================================================================== */
  /* PAGE 1: MAIN FULL-WIDTH SERVICES TABLE & MOBILE CARDS                  */
  /* ====================================================================== */
  function renderModals() {
    return (
      <>
        {/* Add / Edit Service Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#0D5EF4] flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-[#0B192C]">
                      {editingService ? 'Edit Service & Rate' : 'Add New Service Offering'}
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Configure service deliverables and commercial baseline pricing
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSaveService} className="p-5 overflow-y-auto space-y-4 text-xs">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Service Name */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Service Offering Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Custom Web Application Development"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F8FC] border border-slate-200 rounded-xl font-semibold text-[#0B192C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5EF4]/20 focus:border-[#0D5EF4] transition-all"
                  />
                </div>

                {/* Category Preset Selector */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_CATEGORIES.map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setFormCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                          formCategory === cat
                            ? 'bg-[#0D5EF4] text-white border-[#0D5EF4]'
                            : 'bg-[#F5F8FC] text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Or type custom category..."
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full mt-1.5 px-3 py-1.5 bg-[#F5F8FC] border border-slate-200 rounded-xl font-medium text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                  />
                </div>

                {/* Baseline Rate & Billing Model */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Baseline Rate <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 font-mono font-bold text-slate-400">
                        {currencySymbol}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        required
                        value={formRate}
                        onChange={(e) => setFormRate(e.target.value)}
                        placeholder="150000"
                        className="w-full pl-8 pr-3 py-2 bg-[#F5F8FC] border border-slate-200 rounded-xl font-mono font-bold text-[#0B192C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5EF4]/20 focus:border-[#0D5EF4] transition-all"
                      />
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Preview: {formatCurrency(Number(formRate) || 0)}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Billing Model
                    </label>
                    <div className="grid grid-cols-3 gap-1 bg-[#F5F8FC] p-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setFormRateType('fixed')}
                        className={`py-1.5 text-center font-bold text-[11px] rounded-lg transition-all ${
                          formRateType === 'fixed'
                            ? 'bg-white text-[#0D5EF4] shadow-2xs font-extrabold'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Fixed
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormRateType('hourly')}
                        className={`py-1.5 text-center font-bold text-[11px] rounded-lg transition-all ${
                          formRateType === 'hourly'
                            ? 'bg-white text-[#0D5EF4] shadow-2xs font-extrabold'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Hourly
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormRateType('monthly')}
                        className={`py-1.5 text-center font-bold text-[11px] rounded-lg transition-all ${
                          formRateType === 'monthly'
                            ? 'bg-white text-[#0D5EF4] shadow-2xs font-extrabold'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Monthly
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {formRateType === 'fixed' && 'One-off project milestone billing'}
                      {formRateType === 'hourly' && 'Billed per logged timesheet hour'}
                      {formRateType === 'monthly' && 'Recurring retainer each month'}
                    </div>
                  </div>
                </div>

                {/* Description & Deliverables */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Scope &amp; Deliverables Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe what is included: architecture design, sprints, code delivery, warranty, revision cycles..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F8FC] border border-slate-200 rounded-xl font-normal text-[#0B192C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D5EF4]/20 focus:border-[#0D5EF4] transition-all resize-none"
                  />
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#0D5EF4] hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{editingService ? 'Save Changes' : 'Create Service'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {serviceToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 w-full max-w-sm p-5 space-y-4">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-extrabold text-sm text-[#0B192C]">
                  Delete Service Offering?
                </h3>
                <p className="text-xs text-slate-500">
                  Are you sure you want to remove <span className="font-bold text-[#0B192C]">"{serviceToDelete.name}"</span> from your catalog? Existing quotations and invoices will remain intact.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setServiceToDelete(null)}
                  className="flex-1 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs border border-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-2xs transition-colors"
                >
                  Delete Service
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="p-3 sm:p-5 flex-1 flex flex-col min-h-0">
      {/* Top Bar with Search/Filter and "+ Add Service" Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
        <div className="flex-1 min-w-0">
          <SearchAndFilterBar
            placeholder="Search services by name, category, or description..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            modalTitle="Filter Services"
            filterGroups={[
              {
                label: 'Billing Model',
                value: rateTypeFilter,
                onChange: setRateTypeFilter,
                options: [
                  { label: 'All Billing Models', value: 'all' },
                  { label: 'Fixed Project', value: 'fixed' },
                  { label: 'Hourly Rate', value: 'hourly' },
                  { label: 'Monthly Retainer', value: 'monthly' },
                ],
              },
            ]}
          />
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0D5EF4] hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Service</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs flex-1 flex flex-col overflow-hidden">
        {/* DESKTOP TABLE VIEW (Visible sm and up) */}
        <div className="hidden sm:block flex-1 overflow-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr>
                <SortableTh
                  label="Service Offering"
                  sortKey="name"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Category"
                  sortKey="category"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Billing Model"
                  sortKey="rateType"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Baseline Rate"
                  sortKey="defaultRate"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  align="right"
                />
                <th className="px-4 py-2.5 w-12 sticky top-0 z-10 bg-[#F5F8FC] border-b border-slate-200/90 text-right font-bold text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedServices.map((srv) => (
                <tr
                  key={srv.id}
                  onClick={() => setSelectedServiceId(srv.id)}
                  className="cursor-pointer transition-colors hover:bg-blue-50/40 group"
                >
                  <td className="py-3 px-4">
                    <div className="font-bold text-xs sm:text-sm text-[#0B192C] group-hover:text-[#0D5EF4] transition-colors">
                      {srv.name}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 max-w-md">
                      {srv.description}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                      {srv.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0D5EF4] border border-blue-200 capitalize">
                      {srv.rateType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#0B192C] tabular-nums">
                    {formatCurrency(srv.defaultRate)}
                    <span className="text-[10px] font-normal text-slate-400 ml-1">
                      {srv.rateType === 'hourly' ? '/hr' : srv.rateType === 'monthly' ? '/mo' : ' fixed'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <RowActionsMenu
                      actions={[
                        {
                          label: 'Open Service Details',
                          icon: <Eye className="w-3.5 h-3.5" />,
                          onClick: () => setSelectedServiceId(srv.id),
                          variant: 'primary',
                        },
                        {
                          label: 'Edit Service & Rate',
                          icon: <Pencil className="w-3.5 h-3.5" />,
                          onClick: () => handleOpenEditModal(srv),
                        },
                        {
                          label: 'Create Quote',
                          icon: <FileText className="w-3.5 h-3.5" />,
                          onClick: () => setActiveTab('quotations'),
                        },
                        {
                          label: 'Delete Service',
                          icon: <Trash2 className="w-3.5 h-3.5" />,
                          onClick: () => setServiceToDelete(srv),
                          variant: 'danger',
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
              {sortedServices.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-14 text-center">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0D5EF4] flex items-center justify-center mx-auto">
                        <Tag className="w-5 h-5" />
                      </div>
                      <div className="font-extrabold text-xs text-[#0B192C]">No services found</div>
                      <p className="text-[11px] text-slate-400">
                        {searchTerm ? 'No results matched your search query.' : 'Add your first service offering and baseline rate.'}
                      </p>
                      <button
                        onClick={handleOpenAddModal}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#0D5EF4] rounded-xl hover:bg-blue-700 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Service</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD VIEW (Visible on < sm) */}
        <div className="sm:hidden flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-2">
          {sortedServices.map((srv) => (
            <div
              key={srv.id}
              onClick={() => setSelectedServiceId(srv.id)}
              className="p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-blue-200 active:bg-blue-50/30 transition-all space-y-2.5 cursor-pointer shadow-2xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#0D5EF4] bg-blue-50 px-1.5 py-0.5 rounded">
                    {srv.category}
                  </span>
                  <div className="font-extrabold text-xs text-[#0B192C] mt-1 leading-snug">
                    {srv.name}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-extrabold text-xs text-[#0D5EF4] tabular-nums">
                    {formatCurrency(srv.defaultRate)}
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                    {srv.rateType}
                  </span>
                </div>
              </div>

              {srv.description && (
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {srv.description}
                </p>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={(e) => handleOpenEditModal(srv, e)}
                  className="flex items-center gap-1 px-2.5 py-1 text-slate-600 font-bold hover:text-[#0D5EF4] bg-slate-50 rounded-lg"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Edit Rate</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setServiceToDelete(srv);
                    }}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab('quotations');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#0D5EF4] text-white font-bold rounded-lg shadow-2xs hover:bg-blue-700"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Quote</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {sortedServices.length === 0 && (
            <div className="py-12 text-center space-y-2">
              <div className="font-bold text-xs text-slate-600">No services found</div>
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#0D5EF4] rounded-xl hover:bg-blue-700 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Service</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Summary */}
        <TableSummaryFooter
          recordCount={sortedServices.length}
          totalCount={services.length}
          recordLabel="Services"
          metrics={[
            {
              label: 'Fixed Packages',
              value: sortedServices.filter((s) => s.rateType === 'fixed').length,
              tone: 'primary',
            },
            {
              label: 'Hourly Services',
              value: sortedServices.filter((s) => s.rateType === 'hourly').length,
            },
            {
              label: 'Monthly Retainers',
              value: sortedServices.filter((s) => s.rateType === 'monthly').length,
            },
          ]}
        />
      </div>

      {renderModals()}
    </div>
  );
};
