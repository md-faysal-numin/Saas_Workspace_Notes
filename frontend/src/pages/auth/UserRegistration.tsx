import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  AlertCircle,
  // Building2,
} from "lucide-react";
import { authService } from "../../services/authService";
type FieldErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

type FieldName = keyof FieldErrors;
export default function UserRegistration() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const navigate = useNavigate();

  const createMutation = useMutation({
    mutationFn: (data: any) => authService.register(data),
    onSuccess: () => {
      navigate("/dashboard");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    if (formData.password.length < 6) {
      setFieldErrors({ password: "Passwords must be at least 6 characters" });
      return;
    }
    createMutation.mutate({
      ...formData,
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-green-500 to-teal-600 rounded-full mb-4 shadow-lg">
            <UserPlus size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Join a Company
          </h2>
          <p className="text-gray-600">Create your user account</p>
        </div>

        {createMutation.isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-start gap-3">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <span className="text-sm">Registration Failed</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="John Doe"
                required
              />
            </div>
          </div>
          {fieldErrors.fullName && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.fullName}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="john@example.com"
                required
              />
            </div>
          </div>
          {fieldErrors.email && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>
          </div>
          {fieldErrors.password && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.password}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          {fieldErrors.confirmPassword && (
            <p className="text-sm text-red-600 mt-1">
              {fieldErrors.confirmPassword}
            </p>
          )}

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full bg-linear-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-teal-700 disabled:opacity-50 font-semibold transition shadow-lg hover:shadow-xl"
          >
            {createMutation.isPending
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Don't have a company?{" "}
            <Link
              to="/register-company"
              className="text-blue-600 hover:underline font-medium"
            >
              Create Company
            </Link>
          </p>
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-green-600 hover:underline font-medium"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
