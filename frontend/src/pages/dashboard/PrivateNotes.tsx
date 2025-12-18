import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
import { noteService } from "../../services/noteService";
import SearchBar from "../../components/common/SearchBar";
import NoteFilters from "../../components/notes/NoteFilters";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Pagination from "../../components/common/Pagination";
import { PaginationInfo } from "../../components/common/PaginationInfo";

export default function PrivateNotes() {
  const { workspaceId } = useParams();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1); // Add page state
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["private-notes", workspaceId, search, status, currentPage], // Add currentPage to key
    queryFn: () =>
      noteService.getPrivateNotes(
        currentPage,
        search,
        status,
        Number(workspaceId)
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: noteService.deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["private-notes"] });
    },
  });

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this note?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top
  };

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setCurrentPage(1);
  };

  // Get pagination metadata
  const totalPages = data?.meta?.lastPage || 1;
  const total = data?.meta?.total || 0;
  const perPage = data?.meta?.perPage || 20;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Private Notes</h2>
          <p className="text-gray-600 text-sm mt-1">Your personal notes</p>
        </div>
        <Link
          to={`/dashboard/workspace/${workspaceId}/create-note?type=private`}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
        >
          <Plus size={20} />
          Create Note
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-4">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder="Search your private notes..."
          />
        </div>
        <NoteFilters status={status} onStatusChange={handleStatusChange} />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : data?.data.length === 0 ? (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No private notes found</p>
          {(search || status !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setStatus("all");
                setCurrentPage(1);
              }}
              className="mt-4 text-blue-600 hover:underline text-sm"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {data?.data.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText size={20} className="text-gray-400" />
                      <Link
                        to={`/dashboard/note/${note.id}`}
                        className="text-xl font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {note.title}
                      </Link>
                      {note.status === "draft" && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          Draft
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span>
                        Updated {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {note.tags?.map((tag) => (
                        <span
                          key={tag.id}
                          className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/dashboard/note/${note.id}/edit`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                showFirstLast={true}
                maxVisible={5}
              />
              <PaginationInfo
                currentPage={currentPage}
                perPage={perPage}
                total={total}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
