import { Search } from 'lucide-react';
import { useStatusData } from '../hooks/useStatusData';
import { StatusSearchBar } from './status/StatusSearchBar';
import { ContactCard } from './status/ContactCard';
import { ContactReportSections } from './status/ContactReportSections';
import { DeleteConfirmDialog } from './status/DeleteConfirmDialog';

export function StatusSearch() {
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    showFilters,
    setShowFilters,
    loading,
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

  const reports = generateReports();

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
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatusSearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        resultCount={reports.length}
      />

      {reports.length > 0 ? (
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
