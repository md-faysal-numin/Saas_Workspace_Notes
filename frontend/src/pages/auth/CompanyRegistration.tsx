import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Building2, User, Mail, Lock, AlertCircle } from "lucide-react";
import { companyService } from "../../services/companyService";
import { useMutation } from "@tanstack/react-query";

type FieldErrors = {
  companyName?: string;
  companySlug?: string;
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

type FieldName = keyof FieldErrors;

export default function CompanyRegistration() {
  const [formData, setFormData] = useState({
    companyName: "",
    companySlug: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const navigate = useNavigate();

  const isValidDomain = (name: string) => {
    const domainRegex =
      /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;
    console.log(domainRegex.test("name.com"));
    return domainRegex.test(name);
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => companyService.registerCompanyWithAdmin(data),
    onSuccess: (data) => {
      localStorage.setItem("user", JSON.stringify(data.user));

      // Success - redirect to dashboard
      alert(
        `Welcome! Company "${data.company.name}" has been created successfully!`
      );
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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    if (formData.password.length < 6) {
      setFieldErrors({ password: "Password must be at least 6 characters" });
      return;
    }

    if (!isValidDomain(formData.companySlug)) {
      setFieldErrors({ companySlug: "Invalid domain" });
      return;
    }

    createMutation.mutate({ ...formData });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
            <Building2 size={40} className="text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Create Your Company
          </h2>
          <p className="text-gray-600">
            Set up your organization and admin account
          </p>
        </div>

        {createMutation.isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-start gap-3">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <span className="text-sm">Company Registration Failed</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information Section */}
          <div className="bg-blue-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 size={20} className="text-blue-600" />
              Company Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      companyName: e.target.value,
                    });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="e.g., Acme Corporation"
                  required
                />
              </div>
              {fieldErrors.companyName && (
                <p className="text-sm text-red-600 mt-1">
                  {fieldErrors.companyName}
                </p>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Domain *
                </label>
                <input
                  type="text"
                  value={formData.companySlug}
                  onChange={(e) =>
                    setFormData({ ...formData, companySlug: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono text-sm"
                  placeholder="e.g., acme-corporation"
                  pattern="[a-z0-9-]+"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  This will be your company's unique identifier. Only lowercase
                  letters, numbers, and hyphens.
                </p>
              </div>
              {fieldErrors.companySlug && (
                <p className="text-sm text-red-600 mt-1">
                  {fieldErrors.companySlug}
                </p>
              )}
            </div>
          </div>

          {/* Admin Account Section */}
          <div className="bg-green-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} className="text-green-600" />
              Admin Account
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  placeholder="John Doe"
                  required
                />
              </div>
              {fieldErrors.fullName && (
                <p className="text-sm text-red-600 mt-1">
                  {fieldErrors.fullName}
                </p>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail
                    size={20}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
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
                  <Lock
                    size={20}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                    placeholder="••••••••"
                    minLength={6}
                    required
                  />
                </div>
              </div>
              {fieldErrors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {fieldErrors.password}
                </p>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock
                    size={20}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">
                  {" "}
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 font-semibold text-lg transition shadow-lg hover:shadow-xl"
          >
            {createMutation.isPending
              ? "Creating Company..."
              : "Create Company & Admin Account"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
