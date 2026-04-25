import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Shield,
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { login, clearAuthError } from "../../features/authSlice";

// 1. Define the Zod Schema (Strict Frontend Validation)
const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Pull state from Redux
  const { isLoading, error, isAuthenticated } = useSelector(
    (state) => state.auth,
  );

  // 2. Initialize React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // Clear any leftover Redux errors when the component mounts
  useEffect(() => {
    dispatch(clearAuthError());
    document.title = "لوحة التحكم - تسجيل الدخول";
  }, [dispatch]);

  // If they somehow land here while logged in, push them to the dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 3. Handle Form Submission
  const onSubmit = async (data) => {
    const resultAction = await dispatch(login(data));
    if (login.fulfilled.match(resultAction)) {
      navigate("/admin/dashboard", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 selection:bg-cyan-500 selection:text-white relative overflow-hidden dir-rtl">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[150px]"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[150px]"></div>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-900 border border-gray-800 shadow-[0_0_30px_rgba(0,243,255,0.2)] mb-6">
            <Shield className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_10px_rgba(0,243,255,0.8)]" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wide">
            لوحة <span className="text-cyan-400">التحكم</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            قم بتسجيل الدخول للوصول إلى إدارة النظام
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-gray-900/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-800 shadow-2xl relative"
        >
          {/* Top border glowing line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 rounded-t-2xl"></div>

          {/* Redux Backend Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm flex items-start text-right">
              <AlertCircle className="w-5 h-5 ml-2 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Username Input */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              اسم المستخدم
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <input
                {...register("username")}
                type="text"
                className={`w-full bg-gray-950 border ${errors.username ? "border-red-500" : "border-gray-700"
                  } text-white rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-left dir-ltr placeholder:text-right placeholder:dir-rtl`}
                placeholder="أدخل اسم المستخدم"
                dir="ltr"
              />
            </div>
            {errors.username && (
              <p className="text-red-400 text-xs mt-2">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-8">
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Lock className="w-5 h-5 text-gray-500" />
              </div>
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className={`w-full bg-gray-950 border ${errors.password ? "border-red-500" : "border-gray-700"
                  } text-white rounded-lg pl-10 pr-10 py-3 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-left dir-ltr placeholder:text-right placeholder:dir-rtl`}
                placeholder="أدخل كلمة المرور"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 hover:text-cyan-400 transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-2">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-3 px-4 rounded-lg transition-all duration-300 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:shadow-[0_0_25px_rgba(0,243,255,0.5)]"
          >
            {isLoading ? (
              <Loader2 className="animate-spin w-6 h-6" />
            ) : (
              "تسجيل الدخول"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
