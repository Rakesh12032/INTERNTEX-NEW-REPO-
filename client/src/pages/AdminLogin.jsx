import React, { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const schema = yup.object({
  email: yup.string().email("Enter a valid admin email").required("Admin email is required"),
  password: yup.string().required("Admin password is required")
});

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      const response = await api.post("/auth/login", values);

      if (response.data.user.role !== "admin") {
        toast.error("This login is only for admin access");
        return;
      }

      login(response.data.token, response.data.user);
      toast.success("Admin login successful");
      navigate(location.state?.from?.pathname || "/admin", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid admin credentials");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-md overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="bg-slate-950 px-8 py-7 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan">interntex</p>
              <h1 className="text-2xl font-black">Admin Login</h1>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-300">
            Secure access for managing students, courses, certificates, internships, and verification data.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-8">
          <div>
            <label className="mb-2 block text-sm font-semibold" htmlFor="admin-email">
              Admin Email
            </label>
            <input
              id="admin-email"
              {...register("email")}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue dark:border-slate-700 dark:bg-slate-950"
            />
            {errors.email ? <p className="mt-2 text-sm text-danger">{errors.email.message}</p> : null}
          </div>

          <div className="relative">
            <label className="mb-2 block text-sm font-semibold" htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 pr-12 outline-none focus:border-blue dark:border-slate-700 dark:bg-slate-950"
            />
            <button
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              className="absolute right-4 top-[46px] text-slate-400"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            {errors.password ? <p className="mt-2 text-sm text-danger">{errors.password.message}</p> : null}
          </div>

          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue px-4 py-4 text-sm font-semibold text-white transition hover:bg-navy disabled:opacity-70"
          >
            <LockKeyhole className="h-5 w-5" />
            {submitting ? "Checking Access..." : "Open Admin Panel"}
          </button>
        </form>
      </div>
    </div>
  );
}
