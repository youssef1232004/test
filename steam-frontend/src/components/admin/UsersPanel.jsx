import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { fetchUsers } from "../../features/usersSlice";
import { createUser, deleteUser } from "../../services/api";
import { User, Shield, Trash2, Plus, KeyRound, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

const newUserSchema = z.object({
  username: z.string().min(3, "اسم المستخدم مطلوب (3 أحرف على الأقل)"),
  password: z.string().min(6, "كلمة المرور مطلوبة (6 أحرف على الأقل)"),
});

const UsersPanel = () => {
  const dispatch = useDispatch();
  const { users, error } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({ resolver: zodResolver(newUserSchema) });

  const onCreateUser = async (data) => {
    try {
      await createUser(data);
      toast.success("تم إضافة الموظف بنجاح");
      reset();
      dispatch(fetchUsers());
    } catch (err) {
      toast.error(err.response?.data?.message || "حدث خطأ أثناء الإضافة");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الموظف؟")) return;
    try {
      await deleteUser(id);
      toast.success("تم حذف الموظف");
      dispatch(fetchUsers());
    } catch (err) {
      toast.error(err.response?.data?.message || "لا يمكنك حذف هذا الحساب");
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-white mb-6">إدارة الموظفين</h2>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
          <Shield className="w-6 h-6 text-fuchsia-400" />
          <h3 className="text-xl font-bold text-white">صلاحيات المشرف العام (Super Admin)</h3>
        </div>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-8 rounded-xl flex flex-col items-center justify-center text-center">
            <AlertTriangle className="w-12 h-12 mb-4 text-red-500" />
            <p className="font-semibold text-lg">{error}</p>
            <p className="text-sm mt-2 opacity-80">لا تملك الصلاحيات الكافية لعرض هذه الصفحة.</p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit(onCreateUser)} className="flex flex-col md:flex-row gap-3 mb-8 bg-gray-950 p-4 rounded-xl border border-gray-800">
              <div className="flex-1">
                <input
                  {...register("username")}
                  placeholder="اسم المستخدم"
                  className="w-full bg-gray-900 border border-gray-800 text-white rounded-lg px-4 py-2 focus:border-fuchsia-500 focus:outline-none text-left dir-ltr placeholder:text-right placeholder:dir-rtl"
                  dir="ltr"
                />
                {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
              </div>

              <div className="flex-1">
                <input
                  {...register("password")}
                  type="password"
                  placeholder="كلمة المرور"
                  className="w-full bg-gray-900 border border-gray-800 text-white rounded-lg px-4 py-2 focus:border-fuchsia-500 focus:outline-none text-left dir-ltr placeholder:text-right placeholder:dir-rtl"
                  dir="ltr"
                />
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-fuchsia-500 hover:bg-fuchsia-400 text-white font-bold px-6 py-2 rounded-lg transition-all flex items-center justify-center whitespace-nowrap"
              >
                <Plus className="w-5 h-5 ml-2" /> إضافة
              </button>
            </form>

            <div className="space-y-3">
              {users.map((user) => (
                <div key={user._id} className="flex items-center justify-between bg-gray-950 border border-gray-800 p-4 rounded-xl hover:border-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${user.role === 'superadmin' ? 'bg-fuchsia-500/20 text-fuchsia-400' : 'bg-gray-800 text-gray-300'}`}>
                      {user.role === 'superadmin' ? <KeyRound className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="text-white font-bold text-left dir-ltr">@{user.username}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {user.role === 'superadmin' ? 'مشرف عام' : 'موظف خدمة عملاء'}
                      </div>
                    </div>
                  </div>

                  {user.role !== 'superadmin' && (
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="حذف الموظف"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UsersPanel;