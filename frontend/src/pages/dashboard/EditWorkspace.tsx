import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Folder } from "lucide-react";
import { workspaceService } from "../../services/workspaceService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

type FieldErrors = {
  name?: string;
  slug?: string;
  description?: string;
};

type FieldName = keyof FieldErrors;

export default function EditWorkspace() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  /** Fetch workspace */
  const { data: workspace, isLoading } = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => workspaceService.getWorkspace(Number(workspaceId)),
  });
  // const workspace = workspaceAndNotes?.workspace;
  /** Populate form */

  // console.log(workspace);
  useEffect(() => {
    if (workspace) {
      setFormData({
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description ?? "",
      });
    }
  }, [workspace]);

  /** Update mutation */
  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      workspaceService.updateWorkspace(Number(workspaceId), data),

    onSuccess: (updatedWorkspace) => {
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });

      navigate(`/dashboard/workspace/${updatedWorkspace.id}/public`);
    },

    onError: (error: any) => {
      if (error.response?.status === 422) {
        const errors: FieldErrors = {};

        error.response.data.errors.forEach(
          (err: { field: FieldName; message: string }) => {
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
    <div className="p-6 max-w-3xl mx-auto">
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
            <Folder size={28} className="text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Edit Workspace</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workspace Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            {fieldErrors.name && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.name}</p>
            )}
          </div>

          {/* Slug */}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            {fieldErrors.slug && (
              <p className="text-sm text-red-600 mt-1">{fieldErrors.slug}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {fieldErrors.description && (
              <p className="text-sm text-red-600 mt-1">
                {fieldErrors.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
