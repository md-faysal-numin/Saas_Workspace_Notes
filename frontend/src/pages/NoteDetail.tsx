import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Edit, Clock, User, Calendar } from "lucide-react";
import { noteService } from "../services/noteService";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
export default function NoteDetail() {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const { data: currentUser } = useAuth();
  const { data: note, isLoading } = useQuery({
    queryKey: ["note", noteId],
    queryFn: () => noteService.getNote(Number(noteId)),
  });
  const { data: histories } = useQuery({
    queryKey: ["note-histories", noteId],
    queryFn: () => noteService.getHistories(Number(noteId)),
    enabled:
      !!note &&
      (note.createdBy === currentUser?.id || currentUser?.role === "admin"),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!note) return <div>Note not found</div>;
  // console.log(note);

  const isCreator = note.createdBy === currentUser?.id;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button
        onClick={() =>
          navigate(`/dashboard/workspace/${note.workspaceId}/${note.type}`)
        }
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{note.title}</h1>
            {(isCreator || currentUser?.role === "admin") && (
              <Link
                to={`/dashboard/note/${note.id}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Edit size={18} />
                Edit
              </Link>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{note.creator?.fullName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{new Date(note.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>
                Updated {new Date(note.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                note.type === "public"
                  ? "bg-green-100 text-green-800"
                  : "bg-purple-100 text-purple-800"
              }`}
            >
              {note.type}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                note.status === "published"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {note.status}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {note.content}
            </p>
          </div>
        </div>

        {histories && histories.length > 0 && (
          <div className="border-t border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Version History
            </h3>
            <div className="space-y-2">
              {histories.map((history) => (
                <div
                  key={history.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-xl font-medium text-gray-900">
                      {history.title}
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {history.content}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(history.createdAt).toLocaleString()} by{" "}
                      {history.user?.fullName}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (confirm("Restore this version?")) {
                        await noteService.restoreFromHistory(
                          note.id,
                          history.id
                        );
                        window.location.reload();
                      }
                    }}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
