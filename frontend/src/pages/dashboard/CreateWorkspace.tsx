import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Folder } from "lucide-react";
import { workspaceService } from "../../services/workspaceService";

type FieldErrors = {
  name?: string;
  slug?: string;
  description?: string;
};

type FieldName = keyof FieldErrors;
export default function CreateWorkspace() {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: workspaceService.createWorkspace,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      navigate(`/dashboard/workspace/${data.id}/public`);
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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-center gap-3 mb-6">
          <Folder size={32} className="text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Create Workspace</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workspace Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  name: e.target.value,
                  slug: generateSlug(e.target.value),
                });
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Engineering Team"
              required
            />
          </div>
          {fieldErrors.name && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.name}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workspace Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., engineering-team"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Used in URLs, must be unique
            </p>
          </div>
          {fieldErrors.slug && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.slug}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What is this workspace for?"
            />
          </div>
          {fieldErrors.description && (
            <p className="text-sm text-red-600 mt-1">
              {fieldErrors.description}
            </p>
          )}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition"
            >
              {createMutation.isPending ? "Creating..." : "Create Workspace"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-medium transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
