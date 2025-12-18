import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Folder, Plus, Loader, Trash2, Edit } from "lucide-react";
import { workspaceService } from "../../services/workspaceService";

import { useAuth } from "../../hooks/useAuth";

export default function Sidebar() {
  const { workspaceId } = useParams();
  //   const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["workspaces"],
    queryFn: () => workspaceService.getWorkspaces(),
  });

  //   const workspaces = data?.data ?? [];

  //   if (workspaces.length > 0 && !workspaceId) {
  //     navigate(`/dashboard/workspace/${data?.data[0].id}/public`);
  //   }

  const deleteMutation = useMutation({
    mutationFn: workspaceService.deleteWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this workspace?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const { data: user } = useAuth();

  return (
    <div className="min-w-80 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Workspaces</h2>
        {user?.role === "admin" && (
          <Link
            to="/dashboard/create-workspace"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm font-medium transition"
          >
            <Plus size={18} />
            Add Workspace
          </Link>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader className="animate-spin text-gray-400" size={24} />
          </div>
        ) : (
          <div className="p-2">
            {data?.data.map((workspace) => (
              <div
                key={workspace.id}
                className="flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition"
              >
                <Link
                  to={`/dashboard/workspace/${workspace.id}/public`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${
                    Number(workspaceId) === workspace.id
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Folder size={20} />
                  <span className="text-sm font-medium truncate">
                    {workspace.name}
                  </span>
                </Link>
                {user?.role === "admin" && (
                  <>
                    <Link
                      to={`/dashboard/workspace/${workspace.id}/edit`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(workspace.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
