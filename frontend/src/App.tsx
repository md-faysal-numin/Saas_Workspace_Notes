import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Auth Pages
import CompanyRegistration from "./pages/auth/CompanyRegistration";
import UserRegistration from "./pages/auth/UserRegistration";
import Login from "./pages/auth/Login";

// Dashboard Layout
import DashboardLayout from "./components/layout/DashboardLayout";

// Dashboard Pages
import PublicNotes from "./pages/dashboard/PublicNotes";
import PrivateNotes from "./pages/dashboard/PrivateNotes";
import CreateWorkspace from "./pages/dashboard/CreateWorkspace";
import CreateNote from "./pages/dashboard/CreateNote";
import EditNote from "./pages/dashboard/EditNote";
import NoteDetail from "./pages/NoteDetail";
import ErrorBoundary from "./pages/ErrorBoundary";
import EditWorkspace from "./pages/dashboard/EditWorkspace";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register-company" element={<CompanyRegistration />} />
          <Route path="/register" element={<UserRegistration />} />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            {/* Default redirect to first workspace */}
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Workspace Routes */}
            <Route
              path="create-workspace"
              element={<CreateWorkspace />}
              errorElement={<ErrorBoundary />}
            />
            <Route
              path="workspace/:workspaceId/public"
              element={<PublicNotes />}
            />
            <Route
              path="workspace/:workspaceId/private"
              element={<PrivateNotes />}
            />
            <Route
              path="workspace/:workspaceId/create-note"
              element={<CreateNote />}
            />
            <Route
              path="workspace/:workspaceId/edit"
              element={<EditWorkspace />}
            />

            {/* Note Routes */}
            <Route path="note/:noteId" element={<NoteDetail />} />
            <Route path="note/:noteId/edit" element={<EditNote />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
export default App;
