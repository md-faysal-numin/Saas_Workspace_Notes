import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, FileText } from "lucide-react";
import { noteService } from "../../services/noteService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
type FieldErrors = {
  title?: string;
  content?: string;
  type?: string;
  status?: string;
};

type typeValue = "public" | "private";
type statusValue = "draft" | "published";

type fieldType = {
  title: string;
  content: string;
  type: typeValue;
  status: statusValue;
};

type FieldName = keyof FieldErrors;
export default function EditNote() {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<fieldType>({
    title: "",
    content: "",
    type: "private" as typeValue,
    status: "draft" as statusValue,
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const { data: note, isLoading } = useQuery({
    queryKey: ["note", noteId],
    queryFn: () => noteService.getNote(Number(noteId)),
  });

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title,
        content: note.content,
        type: note.type,
        status: note.status,
      });
    }
  }, [note]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => noteService.updateNote(Number(noteId), data),
    onSuccess: (updatedNote) => {
      queryClient.invalidateQueries({ queryKey: ["note", noteId] });
      queryClient.invalidateQueries({ queryKey: ["public-notes"] });
      queryClient.invalidateQueries({ queryKey: ["private-notes"] });
      navigate(`/dashboard/note/${updatedNote.id}`);
    },

    onError: (error: any) => {
      if (error.response?.status === 422) {
        const errors: FieldErrors = {};

        error.response.data.errors.forEach(
          (err: { field: FieldName; message: string; rule: string }) => {
            errors[err.field] = err.message;
          }
        );

        setFieldErrors(errors);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <FileText size={28} className="text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Edit Note</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Note title..."
              className="w-full text-3xl font-bold border-none outline-none focus:ring-0"
              required
            />
          </div>
          {fieldErrors.title && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.title}</p>
          )}

          <div>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="Note content..."
              rows={16}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
          </div>
          {fieldErrors.content && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.content}</p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as "public" | "private",
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
            </div>
            {fieldErrors.type && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.type}</p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "draft" | "published",
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            {fieldErrors.status && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.status}</p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-8 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-medium transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
