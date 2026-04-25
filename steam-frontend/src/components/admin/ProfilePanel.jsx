import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateProfile } from "../../services/api";
import { User, Lock } from "lucide-react";
import toast from "react-hot-toast";

// Zod Schema for Validation
const profileSchema = z.object({
  username: z.string().min(3, "يجب أن يكون 3 أحرف على الأقل").optional().or(z.literal("")),
  password: z.string().min(6, "يجب أن تكون 6 أحرف على الأقل").optional().or(z.literal("")),
});

const ProfilePanel = () => {
  const { username: currentUsername } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({ resolver: zodResolver(profileSchema) });

  const onSubmit = async (data) => {
    try {
      const payload = {};
      if (data.username) payload.username = data.username;
      if (data.password) payload.password = data.password;

      if (Object.keys(payload).length === 0) {
        return toast.error("يرجى إدخال بيانات لتحديثها");
      }

      await updateProfile(payload);
      toast.success("تم تحديث الملف الشخصي بنجاح! يرجى تسجيل الدخول مجدداً لتطبيق التغييرات.");
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || "حدث خطأ أثناء التحديث");
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">إعدادات الحساب</h2>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
          <User className="w-6 h-6 text-cyan-400" />
          <h3 className="text-xl font-bold text-white">ملفي الشخصي</h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">تغيير اسم المستخدم (الحالي: @{currentUsername})</label>
            <div className="relative">
              <User className="absolute right-3 top-3 w-5 h-5 text-gray-500" />
              <input
                {...register("username")}
                placeholder="اسم المستخدم الجديد (اختياري)"
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-lg pr-10 pl-4 py-2 focus:border-cyan-500 focus:outline-none text-left dir-ltr placeholder:text-right placeholder:dir-rtl"
                dir="ltr"
              />
            </div>
            {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">تغيير كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 w-5 h-5 text-gray-500" />
              <input
                {...register("password")}
                type="password"
                placeholder="كلمة المرور الجديدة (اختياري)"
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-lg pr-10 pl-4 py-2 focus:border-cyan-500 focus:outline-none text-left dir-ltr placeholder:text-right placeholder:dir-rtl"
                dir="ltr"
              />
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gray-800 hover:bg-cyan-500 hover:text-black text-cyan-400 font-bold py-3 rounded-lg transition-all duration-300 border border-gray-700 hover:border-cyan-500 mt-4"
          >
            حفظ التعديلات
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePanel;