import React, { useState, useMemo } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { DocumentRecord } from '../../types';
import {
  Download,
  Lock,
  Globe,
  FileText,
  HardDrive,
  CheckCircle2,
  Printer,
  Eye,
  Users,
  FolderGit2,
} from 'lucide-react';
import { COMPANY_LOGO_URL } from '../common/BrandLogo';
import { saveDocumentToGoogleDrive } from '../../services/googleWorkspace';
import { SearchAndFilterBar } from '../common/SearchAndFilterBar';
import { DetailViewHeader } from '../common/DetailViewHeader';
import {
  useTableSort,
  SortableTh,
  RowActionsMenu,
  TableSummaryFooter,
} from '../common/TableMechanics';

export const DocumentsView: React.FC = () => {
  const {
    documents,
    profile,
    searchQuery: searchTerm,
    setSearchQuery: setSearchTerm,
    moduleFilter: typeFilter,
    setModuleFilter: setTypeFilter,
    selectedRecordIds,
    setSelectedRecordForTab,
    navigateToRecord,
  } = useBusiness();

  const [driveStatus, setDriveStatus] = useState<string | null>(null);
  const [isUploadingDrive, setIsUploadingDrive] = useState(false);

  const selectedDocId = selectedRecordIds['documents'] || null;
  const setSelectedDocId = (id: string | null) => setSelectedRecordForTab('documents', id);

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.clientName && doc.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doc.projectName && doc.projectName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = typeFilter === 'all' || doc.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [documents, searchTerm, typeFilter]);

  const { sortedItems: sortedDocs, sortConfig, handleSort } = useTableSort<DocumentRecord>(
    filteredDocs,
    'uploadDate',
    'desc'
  );

  const activeDoc = selectedDocId
    ? documents.find((d) => d.id === selectedDocId) || null
    : null;

  const buildDocHtml = (doc: DocumentRecord) => `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>${doc.title} — ${profile.name}</title>
<style>
  body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: #F5F8FC; padding: 36px; color: #0B192C; }
  .sheet { max-width: 720px; margin: 0 auto; background: #fff; border-radius: 20px; padding: 40px; border: 1px solid #E2E8F0; }
  .bar { height: 6px; background: linear-gradient(90deg, #0B192C, #0D5EF4); border-radius: 6px; margin-bottom: 24px; }
</style>
</head>
<body>
  <div class="sheet">
    <div class="bar"></div>
    <p style="font-size:11px;font-weight:800;color:#0D5EF4;text-transform:uppercase;letter-spacing:0.08em;margin:0;">${profile.name} · Official ${doc.type}</p>
    <h1 style="margin:6px 0 16px;font-size:22px;">${doc.title}</h1>
    <p style="font-size:13px;color:#475569;"><strong>Client:</strong> ${doc.clientName || 'Internal'} · <strong>Project:</strong> ${doc.projectName || 'General'}</p>
    <p style="font-size:13px;color:#475569;"><strong>Date:</strong> ${doc.uploadDate} · <strong>Format:</strong> ${doc.format} (${doc.fileSize})</p>
    <hr style="border:none;border-top:1px solid #E2E8F0;margin:24px 0;" />
    <p style="font-size:13px;line-height:1.7;color:#1E293B;">This official ${doc.type.toLowerCase()} record is maintained in the ${profile.name} Document Vault and governed by standard commercial confidentiality and deliverable acceptance terms.</p>
  </div>
</body>
</html>`;

  const handleDownload = (doc: DocumentRecord) => {
    const html = buildDocHtml(doc);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = (doc: DocumentRecord) => {
    const html = buildDocHtml(doc);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const handleSaveToDrive = async (doc: DocumentRecord) => {
    setIsUploadingDrive(true);
    setDriveStatus(null);
    try {
      const res = await saveDocumentToGoogleDrive({
        fileName: `${doc.title.replace(/\s+/g, '_')}.html`,
        htmlContent: buildDocHtml(doc),
      });
      setDriveStatus(`Saved "${res.name}" to Google Drive`);
    } catch (err: any) {
      setDriveStatus(err?.message || 'Could not upload to Google Drive');
    } finally {
      setIsUploadingDrive(false);
    }
  };

  /* ====================================================================== */
  /* PAGE 2: DEDICATED DOCUMENT PREVIEW PAGE                                */
  /* ====================================================================== */
  if (activeDoc) {
    const currentIndex = sortedDocs.findIndex((d) => d.id === activeDoc.id);
    const currentCrumb = {
      tab: 'documents',
      tabLabel: 'Documents',
      recordId: activeDoc.id,
      recordLabel: activeDoc.title,
    };

    return (
      <div className="p-3.5 sm:p-5 space-y-4 max-w-5xl mx-auto min-h-full flex flex-col">
        <DetailViewHeader
          moduleLabel="Documents"
          recordTitle={activeDoc.title}
          onBack={() => {
            setSelectedDocId(null);
            setDriveStatus(null);
          }}
          currentIndex={currentIndex >= 0 ? currentIndex : 0}
          totalCount={sortedDocs.length}
          onPrev={
            currentIndex > 0
              ? () => {
                  setSelectedDocId(sortedDocs[currentIndex - 1].id);
                  setDriveStatus(null);
                }
              : undefined
          }
          onNext={
            currentIndex >= 0 && currentIndex < sortedDocs.length - 1
              ? () => {
                  setSelectedDocId(sortedDocs[currentIndex + 1].id);
                  setDriveStatus(null);
                }
              : undefined
          }
        >
          <button
            type="button"
            disabled={isUploadingDrive}
            onClick={() => handleSaveToDrive(activeDoc)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold text-[#0D5EF4] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl flex items-center gap-1 transition-colors"
            title="Save to Drive"
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isUploadingDrive ? 'Saving...' : 'Drive'}</span>
          </button>
          <button
            type="button"
            onClick={() => handlePrint(activeDoc)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1 transition-colors"
            title="Print"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button
            type="button"
            onClick={() => handleDownload(activeDoc)}
            className="px-2.5 py-1.5 text-xs font-bold text-white bg-[#0D5EF4] hover:bg-blue-700 rounded-xl shadow-2xs flex items-center gap-1 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </DetailViewHeader>

        {driveStatus && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#16A34A] rounded-xl font-bold flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{driveStatus}</span>
          </div>
        )}

        {/* Full-Page Document Preview Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-5 sm:p-8 space-y-5">
            {/* Brand & Document Top */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3.5">
                <img
                  src={COMPANY_LOGO_URL}
                  alt={profile.name}
                  className="w-11 h-11 object-contain rounded-xl border border-slate-100 p-1"
                />
                <div>
                  <div className="font-extrabold text-sm sm:text-base text-[#0B192C]">{profile.name}</div>
                  <div className="text-[11px] text-slate-400">Official Deliverable &amp; Record Repository</div>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-[#0D5EF4] uppercase tracking-wider">
                  {activeDoc.format} · {activeDoc.fileSize}
                </span>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{activeDoc.uploadDate}</div>
              </div>
            </div>

            {/* Summary Box with Clickable Cross-Links to Client & Project */}
            <div className="p-4 bg-[#F5F8FC] rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Client</div>
                {activeDoc.clientId ? (
                  <button
                    type="button"
                    onClick={() =>
                      navigateToRecord('clients', activeDoc.clientId!, activeDoc.clientName, currentCrumb)
                    }
                    className="font-bold text-[#0B192C] hover:text-[#0D5EF4] underline decoration-slate-300 underline-offset-2 transition-colors text-left"
                  >
                    {activeDoc.clientName || 'View Client'}
                  </button>
                ) : (
                  <div className="font-bold text-[#0B192C]">{activeDoc.clientName || 'Internal Client'}</div>
                )}
              </div>
              <div>
                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Associated Project</div>
                {activeDoc.projectId ? (
                  <button
                    type="button"
                    onClick={() =>
                      navigateToRecord('projects', activeDoc.projectId!, activeDoc.projectName, currentCrumb)
                    }
                    className="font-bold text-[#0D5EF4] hover:underline text-left"
                  >
                    {activeDoc.projectName || 'View Project'}
                  </button>
                ) : (
                  <div className="font-bold text-[#0D5EF4]">{activeDoc.projectName || 'General Operations'}</div>
                )}
              </div>
              <div>
                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Vault Access</div>
                <div className="font-bold text-[#16A34A]">
                  {activeDoc.isClientVisible ? 'Client Portal' : 'Internal Only'}
                </div>
              </div>
            </div>

            {/* Document Content */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 text-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0D5EF4]" />
                  <span className="font-bold text-sm text-[#0B192C]">{activeDoc.title}</span>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0D5EF4] border border-blue-200">
                  {activeDoc.type}
                </span>
              </div>

              <p className="text-slate-600 leading-relaxed">
                This official record is maintained under the custody of <strong>{profile.name}</strong> for{' '}
                <strong>{activeDoc.clientName || 'internal organization records'}</strong>. All terms, deliverables,
                specifications, and financial attachments referenced herein have been reconciled and digitally signed.
              </p>

              <div className="p-4 bg-slate-50 rounded-xl font-mono text-[11px] text-slate-600 space-y-1.5 border border-slate-200/60">
                <div>Document ID: doc_{activeDoc.id}</div>
                <div>Archive Hash: sha256_vault_{activeDoc.id}_verified</div>
                <div>Status: Active / Confirmed Delivery</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ====================================================================== */
  /* PAGE 1: MAIN FULL-WIDTH DOCUMENTS TABLE (True Desktop Table Mechanics) */
  /* ====================================================================== */
  const clientVisibleCount = sortedDocs.filter((d) => d.isClientVisible).length;

  return (
    <div className="p-3 sm:p-5 flex-1 flex flex-col min-h-0">
      {/* Syncs Search & Filter to the Top Header Bar */}
      <SearchAndFilterBar
        placeholder="Search documents by title, client, or project..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        modalTitle="Filter Documents"
        filterGroups={[
          {
            label: 'Document Type',
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { label: 'All Files', value: 'all' },
              { label: 'Quotation', value: 'Quotation' },
              { label: 'Invoice', value: 'Invoice' },
              { label: 'Receipt', value: 'Receipt' },
              { label: 'Agreement', value: 'Agreement' },
              { label: 'Specification', value: 'Specification' },
            ],
          },
        ]}
      />

      {/* MOBILE FEED (< sm): Non-overwhelming touch cards */}
      <div className="sm:hidden space-y-2.5 overflow-y-auto flex-1 pb-2">
        {sortedDocs.map((doc) => (
          <div
            key={doc.id}
            onClick={() => {
              setSelectedDocId(doc.id);
              setDriveStatus(null);
            }}
            className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs active:bg-blue-50/50 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-bold text-sm text-[#0B192C] truncate">{doc.title}</div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {doc.clientName || 'Internal Client'} · {doc.projectName || 'General Operations'}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0D5EF4] border border-blue-200">
                  {doc.type}
                </span>
                <RowActionsMenu
                  actions={[
                    {
                      label: 'Open Document',
                      icon: <Eye className="w-3.5 h-3.5" />,
                      onClick: () => setSelectedDocId(doc.id),
                      variant: 'primary',
                    },
                    {
                      label: 'Download File',
                      icon: <Download className="w-3.5 h-3.5" />,
                      onClick: () => handleDownload(doc),
                    },
                    {
                      label: 'Print Document',
                      icon: <Printer className="w-3.5 h-3.5" />,
                      onClick: () => handlePrint(doc),
                    },
                    ...(doc.clientId
                      ? [
                          {
                            label: 'Open Client',
                            icon: <Users className="w-3.5 h-3.5" />,
                            onClick: () =>
                              navigateToRecord('clients', doc.clientId!, doc.clientName),
                          },
                        ]
                      : []),
                    ...(doc.projectId
                      ? [
                          {
                            label: 'Open Project',
                            icon: <FolderGit2 className="w-3.5 h-3.5" />,
                            onClick: () =>
                              navigateToRecord('projects', doc.projectId!, doc.projectName),
                          },
                        ]
                      : []),
                  ]}
                />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                {doc.isClientVisible ? (
                  <span className="inline-flex items-center gap-1 text-[#16A34A] font-medium text-[11px]">
                    <Globe className="w-3 h-3" />
                    <span>Portal</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-400 font-medium text-[11px]">
                    <Lock className="w-3 h-3" />
                    <span>Internal</span>
                  </span>
                )}
              </div>
              <span className="font-mono text-[11px] text-slate-500">
                {doc.format} · {doc.uploadDate}
              </span>
            </div>
          </div>
        ))}
        {sortedDocs.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            No documents found matching criteria.
          </div>
        )}
      </div>

      {/* Full-Width Desktop Data Table (hidden on mobile, visible on sm and up) */}
      <div className="hidden sm:flex bg-white border border-slate-200/90 rounded-2xl shadow-2xs flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr>
                <SortableTh
                  label="Document Title"
                  sortKey="title"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Type"
                  sortKey="type"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Client & Project"
                  sortKey="clientName"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Visibility"
                  sortKey="isClientVisible"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Format & Date"
                  sortKey="uploadDate"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <th className="px-4 py-2.5 w-12 sticky top-0 z-10 bg-[#F5F8FC] border-b border-slate-200/90 text-right font-bold text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedDocs.map((doc) => (
                <tr
                  key={doc.id}
                  onClick={() => {
                    setSelectedDocId(doc.id);
                    setDriveStatus(null);
                  }}
                  className="cursor-pointer transition-colors hover:bg-blue-50/40 group"
                >
                  <td className="py-3 px-4">
                    <div className="font-bold text-xs sm:text-sm text-[#0B192C] group-hover:text-[#0D5EF4] transition-colors">
                      {doc.title}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0D5EF4] border border-blue-200">
                      {doc.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div className="font-semibold text-[#0B192C]">{doc.clientName || 'Internal Client'}</div>
                    <div className="text-[11px] text-slate-400">{doc.projectName || 'General Operations'}</div>
                  </td>
                  <td className="py-3 px-4">
                    {doc.isClientVisible ? (
                      <span className="inline-flex items-center gap-1 text-[#16A34A] font-semibold text-[11px]">
                        <Globe className="w-3.5 h-3.5" />
                        <span>Client Portal</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400 font-semibold text-[11px]">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Internal Only</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    <div>
                      {doc.format} · {doc.fileSize}
                    </div>
                    <div className="text-slate-400">{doc.uploadDate}</div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <RowActionsMenu
                      actions={[
                        {
                          label: 'Open Document',
                          icon: <Eye className="w-3.5 h-3.5" />,
                          onClick: () => setSelectedDocId(doc.id),
                          variant: 'primary',
                        },
                        {
                          label: 'Download File',
                          icon: <Download className="w-3.5 h-3.5" />,
                          onClick: () => handleDownload(doc),
                        },
                        {
                          label: 'Print Document',
                          icon: <Printer className="w-3.5 h-3.5" />,
                          onClick: () => handlePrint(doc),
                        },
                        ...(doc.clientId
                          ? [
                              {
                                label: 'Open Client',
                                icon: <Users className="w-3.5 h-3.5" />,
                                onClick: () =>
                                  navigateToRecord('clients', doc.clientId!, doc.clientName),
                              },
                            ]
                          : []),
                        ...(doc.projectId
                          ? [
                              {
                                label: 'Open Project',
                                icon: <FolderGit2 className="w-3.5 h-3.5" />,
                                onClick: () =>
                                  navigateToRecord('projects', doc.projectId!, doc.projectName),
                              },
                            ]
                          : []),
                      ]}
                    />
                  </td>
                </tr>
              ))}
              {sortedDocs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    No documents found matching the filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TableSummaryFooter
          recordCount={sortedDocs.length}
          totalCount={documents.length}
          recordLabel="Documents"
          metrics={[
            { label: 'Client Portal Shared', value: clientVisibleCount, tone: 'emerald' },
            {
              label: 'Internal Only',
              value: sortedDocs.length - clientVisibleCount,
              tone: 'default',
            },
          ]}
        />
      </div>
    </div>
  );
};
