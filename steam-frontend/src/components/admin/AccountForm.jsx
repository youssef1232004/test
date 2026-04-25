import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { addAccount, updateAccountData } from "../../services/api";
import toast from "react-hot-toast";

import { createPortal } from "react-dom";

const accountSchema = z.object({
  gameName: z.string().min(1, "اسم اللعبة مطلوب"),
  sku: z.string().min(1, "رمز المنتج (SKU) مطلوب"),
  username: z.string().optional(),
  password: z.string().optional(),
  sharedSecret: z.string().optional(),
  maxSales: z.coerce
    .number({ invalid_type_error: "مطلوب" })
    .min(1, "الحد الأدنى 1"),
  settings: z.object({
    maxSteamGuardRequests: z.coerce
      .number({ invalid_type_error: "مطلوب" })
      .min(1, "الحد الأدنى 1"),
    warningViewCount: z.coerce
      .number({ invalid_type_error: "مطلوب" })
      .min(1, "الحد الأدنى 1"),
    resetPeriodDays: z.coerce
      .number({ invalid_type_error: "مطلوب" })
      .min(0, "لا يمكن أن يكون بالسالب"),
  }),
});

const AccountForm = ({ isOpen, onClose, refreshData, editData = null }) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      maxSales: 1,
      settings: {
        maxSteamGuardRequests: 3,
        warningViewCount: 5,
        resetPeriodDays: 0,
      },
    },
  });

  useEffect(() => {
    if (editData && isOpen) {
      setValue("gameName", editData.gameName);
      setValue("sku", editData.sku);
      setValue("maxSales", editData.maxSales);
      setValue(
        "settings.maxSteamGuardRequests",
        editData.settings?.maxSteamGuardRequests || 3,
      );
      setValue(
        "settings.warningViewCount",
        editData.settings?.warningViewCount || 5,
      );
      setValue(
        "settings.resetPeriodDays",
        editData.settings?.resetPeriodDays || 0,
      );
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowPassword(false);
    } else if (!isOpen) {
      reset();
      setShowPassword(false);
    }
  }, [editData, isOpen, setValue, reset]);

  const onSubmit = async (data) => {
    // Strict manual validation for New Accounts
    if (!editData) {
      if (!data.username)
        return toast.error("يرجى إدخال اسم مستخدم ستيم", { icon: "⚠️" });
      if (!data.password)
        return toast.error("يرجى إدخال كلمة مرور ستيم", { icon: "⚠️" });
      if (!data.sharedSecret)
        return toast.error("يرجى إدخال الـ Shared Secret", { icon: "⚠️" });
    }

    if (editData) {
      const isConfirmed = window.confirm("هل أنت متأكد من حفظ التعديلات؟");
      if (!isConfirmed) return;
    }

    try {
      if (editData) {
        await updateAccountData(editData._id, data);
        toast.success("تم تحديث بيانات الحساب بنجاح");
      } else {
        await addAccount(data);
        toast.success("تم إضافة الحساب بنجاح");
      }
      refreshData();
      onClose();
    } catch (err) {
      console.error("API Error Details:", err.response?.data);

      // استخراج رسالة الخطأ المباشرة إن وجدت
      let errorMessage = err.response?.data?.message;

      // التحقق مما إذا كان الخطأ قادماً من express-validator (مصفوفة أخطاء)
      const validationErrors = err.response?.data?.errors;
      if (validationErrors && validationErrors.length > 0) {
        // أخذ أول رسالة خطأ من المصفوفة (مثل رسالة الـ Base64)
        errorMessage = validationErrors[0].msg;
      }

      // عرض الرسالة المستخرجة، أو رسالة عامة كحل أخير
      toast.error(errorMessage || "بيانات غير صالحة. يرجى مراجعة الحقول.");
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in dir-rtl">
      <div className="bg-gray-900 border border-gray-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">
            {editData ? "تعديل إعدادات الحساب" : "إضافة حساب جديد"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  اسم اللعبة
                </label>
                <input
                  {...register("gameName")}
                  readOnly={!!editData}
                  className={`w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white outline-none focus:border-cyan-500 ${editData ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                {errors.gameName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.gameName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  رمز المنتج (SKU)
                </label>
                <input
                  {...register("sku")}
                  readOnly={!!editData}
                  className={`w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white outline-none focus:border-cyan-500 ${editData ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                {errors.sku && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.sku.message}
                  </p>
                )}
              </div>
            </div>

            {!editData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">
                      اسم مستخدم ستيم
                    </label>
                    <input
                      {...register("username")}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white text-left dir-ltr outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-1">
                      كلمة مرور ستيم
                    </label>
                    <div className="relative">
                      <input
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white text-left dir-ltr outline-none focus:border-cyan-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-cyan-400 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Shared Secret (Base64)
                  </label>
                  <input
                    {...register("sharedSecret")}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white text-left dir-ltr outline-none focus:border-cyan-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-gray-400 text-sm mb-1">
                الحد الأقصى للمبيعات (عدد العملاء المسموح لهم)
              </label>
              <input
                {...register("maxSales")}
                type="number"
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white outline-none focus:border-cyan-500"
              />
              {errors.maxSales && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.maxSales.message}
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-950/50 p-4 rounded-xl border border-gray-800">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-2">
              <ShieldAlert className="w-5 h-5 text-fuchsia-400" />
              <h4 className="text-white font-bold">إعدادات الحماية المتقدمة</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col h-full">
                <div className="mb-2">
                  <label className="block text-gray-400 text-sm mb-1">
                    أقصى أكواد تحقق
                  </label>
                </div>
                <input
                  {...register("settings.maxSteamGuardRequests")}
                  type="number"
                  className="mt-auto w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-fuchsia-500"
                />
                {errors.settings?.maxSteamGuardRequests && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.settings.maxSteamGuardRequests.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col h-full">
                <div className="mb-2">
                  <label className="block text-gray-400 text-sm mb-1">
                    التصفير التلقائي (بالأيام)
                  </label>
                  <p className="text-[10px] text-gray-500">
                    ضع 0 لمدى الحياة (بدون تصفير)
                  </p>
                </div>
                <input
                  {...register("settings.resetPeriodDays")}
                  type="number"
                  className="mt-auto w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-fuchsia-500"
                />
                {errors.settings?.resetPeriodDays && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.settings.resetPeriodDays.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col h-full">
                <div className="mb-2">
                  <label className="block text-gray-400 text-sm mb-1">
                    حد تحذير المشاهدات
                  </label>
                </div>
                <input
                  {...register("settings.warningViewCount")}
                  type="number"
                  className="mt-auto w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-fuchsia-500"
                />
                {errors.settings?.warningViewCount && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.settings.warningViewCount.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            disabled={isSubmitting}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-3 rounded-lg transition-all flex justify-center items-center shadow-[0_0_15px_rgba(0,243,255,0.2)]"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin w-6 h-6" />
            ) : editData ? (
              "تأكيد التعديلات"
            ) : (
              "إضافة الحساب"
            )}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AccountForm;