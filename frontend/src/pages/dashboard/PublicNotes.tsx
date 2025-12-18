import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Plus, ArrowUp, ArrowDown, FileText, Edit, Trash2 } from "lucide-react";
import { noteService } from "../../services/noteService";
import SearchBar from "../../components/common/SearchBar";
import NoteFilters from "../../components/notes/NoteFilters";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Pagination from "../../components/common/Pagination";
import { PaginationInfo } from "../../components/common/PaginationInfo";
import { useAuth } from "../../hooks/useAuth";

export default function PublicNotes() {
  const { workspaceId } = useParams();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1); // Add page state
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["public-notes", workspaceId, search, status, currentPage], // Add currentPage to key
    queryFn: () =>
      noteService.getPublicNotes(
        currentPage,
        search,
        status,
        Number(workspaceId)
      ),
  });

  const voteMutation = useMutation({
    mutationFn: ({
      noteId,
      voteType,
    }: {
      noteId: number;
      voteType: "upvote" | "downvote";
    }) => noteService.vote(noteId, voteType),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["public-notes", workspaceId],
      });
    },
  });

  const handleVote = (noteId: number, voteType: "upvote" | "downvote") => {
    voteMutation.mutate({ noteId, voteType });
  };

  const deleteMutation = useMutation({
    mutationFn: noteService.deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["public-notes", workspaceId],
      });
    },
  });

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this note?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top on page change
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

  const { data: user } = useAuth();

  // Get pagination metadata
  const totalPages = data?.meta?.lastPage || 1;
  const total = data?.meta?.total || 0;
  const perPage = data?.meta?.perPage || 20;

  // console.log(data);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Public Notes</h2>
          <p className="text-gray-600 text-sm mt-1">
            Shared notes from your team
          </p>
        </div>
        <Link
          to={`/dashboard/workspace/${workspaceId}/create-note?type=public`}
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
            placeholder="Search public notes by title..."
          />
        </div>
        <NoteFilters status={status} onStatusChange={handleStatusChange} />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : data?.data.length === 0 ? (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No public notes found</p>
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
            {data?.data.map((note) => {
              const hasUpvoted = note.userVote === "upvote";
              const hasDownvoted = note.userVote === "downvote";

              return (
                <div
                  key={note.id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                >
                  <div className="flex gap-4 justify-between items-start">
                    {/* Vote Buttons */}
                    <div className="flex flex-col items-center gap-2 min-w-15">
                      <button
                        onClick={() => handleVote(note.id, "upvote")}
                        className={`p-2 rounded-full transition ${
                          hasUpvoted
                            ? "bg-green-100 text-green-600"
                            : "text-gray-600 hover:bg-green-50 hover:text-green-600"
                        }`}
                        title={hasUpvoted ? "Remove upvote" : "Upvote"}
                      >
                        <ArrowUp size={20} />
                      </button>
                      <div className="text-lg font-semibold text-gray-900">
                        {note.upvotesCount - note.downvotesCount}
                      </div>
                      <button
                        onClick={() => handleVote(note.id, "downvote")}
                        className={`p-2 rounded-full transition ${
                          hasDownvoted
                            ? "bg-red-100 text-red-600"
                            : "text-gray-600 hover:bg-red-50 hover:text-red-600"
                        }`}
                        title={hasDownvoted ? "Remove downvote" : "Downvote"}
                      >
                        <ArrowDown size={20} />
                      </button>
                    </div>

                    {/* Note Content */}
                    <div className="flex-1">
                      <Link
                        to={`/dashboard/note/${note.id}`}
                        className="text-xl font-semibold text-gray-900 hover:text-blue-600 block mb-2"
                      >
                        {note.title}
                      </Link>
                      {note.status === "draft" && (
                        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mr-2">
                          Draft
                        </span>
                      )}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {note.tags?.map((tag) => (
                          <span
                            key={tag.id}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">
                          {note.creator?.fullName}
                        </span>
                        <span className="mx-2">•</span>
                        <span>
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Edit/Delete Buttons */}
                    {(user?.role === "admin" ||
                      note.createdBy === user?.id) && (
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
                    )}
                  </div>
                </div>
              );
            })}
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
