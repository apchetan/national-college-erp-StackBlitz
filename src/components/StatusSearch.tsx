import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useStatusData } from '../hooks/useStatusData';
import { StatusSearchBar } from './status/StatusSearchBar';
import { ContactCard } from './status/ContactCard';
import { ContactReportSections } from './status/ContactReportSections';
import { DeleteConfirmDialog } from './status/DeleteConfirmDialog';
import { LoadingSpinner } from './LoadingSpinner';
import { RefreshButton } from './RefreshButton';
import { Pagination } from './Pagination';

export function StatusSearch() {
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    showFilters,
    setShowFilters,
    loading,
    refreshing,
    handleRefresh,
    selectedEnquiries,
    selectedAppointments,
    selectedAdmissions,
    selectedStudentStatuses,
    deleteConfirm,
    setDeleteConfirm,
    deleting,
    getCreatorName,
    toggleSelection,
    selectAllForContact,
    confirmDelete,
    handleDelete,
    generateReports
  } = useStatusData();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const allReports = generateReports();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const totalPages = Math.ceil(allReports.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const reports = allReports.slice(startIndex, endIndex);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-purple-100 text-purple-800';
      case 'converted': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingSpinner variant="page" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Search Student Records</h1>
        <RefreshButton onRefresh={handleRefresh} isRefreshing={refreshing} />
      </div>
      <StatusSearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        resultCount={allReports.length}
      />

      {allReports.length > 0 ? (
        <>
          <div className="space-y-6">
            {reports.map((report) => (
              <div key={report.contact.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <ContactCard
                  contact={report.contact}
                  getCreatorName={getCreatorName}
                  getStatusBadgeColor={getStatusBadgeColor}
                />
                <ContactReportSections
                  report={report}
                  getCreatorName={getCreatorName}
                  toggleSelection={toggleSelection}
                  selectedEnquiries={selectedEnquiries}
                  selectedAppointments={selectedAppointments}
                  selectedAdmissions={selectedAdmissions}
                  selectedStudentStatuses={selectedStudentStatuses}
                  selectAllForContact={selectAllForContact}
                  confirmDelete={confirmDelete}
                  getStatusBadgeColor={getStatusBadgeColor}
                />
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                totalCount={allReports.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                loading={false}
              />
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}

      <DeleteConfirmDialog
        deleteConfirm={deleteConfirm}
        deleting={deleting}
        handleDelete={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
