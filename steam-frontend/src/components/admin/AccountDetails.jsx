import { useState } from "react";
import {
  ArrowRight,
  Gamepad2,
  Hash,
  ShieldAlert,
  ListOrdered,
  Calendar,
  Edit,
  Power,
  Key,
  Trash2,
  PlusCircle,
  AlertTriangle,
  Copy,
  Eye,
  EyeOff,
  User,
  Lock,
  Search,
  X,
  ShieldCheck,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAccounts } from "../../features/inventorySlice";
import { toggleAccount, getAdminCode, deleteAccount, topUpOrder, revokeOrder } from "../../services/api";
import AccountForm from "./AccountForm";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";

const AccountDetails = ({ account, onBack }) => {
  const dispatch = useDispatch();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchQueryOrders, setSearchQueryOrders] = useState("");
  
  // Modal states for revocation
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState("مخالفة سياسة الاستخدام");
  const [targetOrderRef, setTargetOrderRef] = useState(null);

  const liveAccount =
    useSelector((state) =>
      state.inventory.accounts.find((a) => a._id === account._id),
    ) || account;

  const handleTopUpOrder = async (referenceId) => {
    try {
      await topUpOrder(referenceId, liveAccount.sku);
      toast.success("تمت إضافة محاولة Steam Guard إضافية!", { icon: "🔋" });
      dispatch(fetchAccounts());
    } catch (err) {
      toast.error("حدث خطأ أثناء إضافة المحاولة");
    }
  };

  const handleRevokeOrderToggle = async (order) => {
    // If we are about to REVOKE (status is false), open custom modal
    if (!order.isRevoked) {
      setTargetOrderRef(order.referenceId);
      setIsRevokeModalOpen(true);
      return;
    }

    // If restoring access, just do it
    try {
      await revokeOrder(order.referenceId, liveAccount.sku, "");
      toast.success("تمت استعادة وصول العميل", { icon: "✅" });
      dispatch(fetchAccounts());
    } catch (err) {
      toast.error("حدث خطأ أثناء تغيير الصلاحية");
    }
  };

  const confirmRevoke = async () => {
    try {
      const res = await revokeOrder(targetOrderRef, liveAccount.sku, revokeReason);
      if (res.data.message.includes("Revoked")) {
        toast.error("تم حظر وصول العميل للحساب", { icon: "🚫" });
      }
      setIsRevokeModalOpen(false);
      dispatch(fetchAccounts());
    } catch (err) {
      toast.error("حدث خطأ أثناء تغيير الصلاحية");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCopySKU = () => {
    navigator.clipboard.writeText(liveAccount.sku);
    toast.success("تم نسخ رمز المنتج (SKU) بنجاح لربطه في سلة", { icon: "📋" });
  };

  const handleCopyText = (text, label) => {
    if (!text) return toast.error(`لا توجد بيانات لنسخها`);
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label} بنجاح`, { icon: "📋" });
  };

  const handleToggle = async () => {
    if (!liveAccount.isActive && liveAccount.currentSales >= liveAccount.maxSales) {
      toast.error("لقد وصل هذا الحساب لأقصى حد للمبيعات. يرجى تعديل حد المبيعات قبل تفعيله.", { duration: 5000 });
      return;
    }

    const isConfirmed = window.confirm(
      `هل أنت متأكد من ${liveAccount.isActive ? "تعطيل" : "تفعيل"} هذا الحساب؟`,
    );
    if (!isConfirmed) return;
    try {
      await toggleAccount(liveAccount._id);
      dispatch(fetchAccounts());
      toast.success("تم تحديث حالة الحساب.");
    } catch (err) {
      toast.error("خطأ في التحديث");
    }
  };

  const handleGetCode = async () => {
    try {
      const res = await getAdminCode(liveAccount._id);
      navigator.clipboard.writeText(res.data.code);
      toast(`تم نسخ كود التحقق: ${res.data.code}`, {
        icon: "🔑",
        duration: 6000,
      });
    } catch (err) {
      toast.error("فشل جلب الكود");
    }
  };

  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      "هل أنت متأكد من حذف هذا الحساب نهائياً؟ لا يمكن التراجع عن هذا الإجراء.",
    );
    if (!isConfirmed) return;
    try {
      await deleteAccount(liveAccount._id);
      toast.success("تم حذف الحساب بنجاح");
      dispatch(fetchAccounts());
      onBack();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "لا يمكن حذف حساب يحتوي على طلبات",
      );
    }
  };

  return (
    <>
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-gray-900 hover:bg-cyan-500 hover:text-black text-cyan-400 rounded-lg border border-gray-800 transition-all"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-white">تفاصيل الحساب</h2>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 hover:bg-cyan-900/30 text-cyan-400 rounded-lg border border-gray-800 transition-colors"
          >
            <Edit className="w-4 h-4" />{" "}
            <span className="text-sm font-bold">تعديل القيود</span>
          </button>
          <button
            onClick={handleGetCode}
            className="p-2 bg-gray-900 hover:bg-gray-800 text-fuchsia-400 rounded-lg border border-gray-800"
            title="جلب كود التحقق"
          >
            <Key className="w-5 h-5" />
          </button>
          <button
            onClick={handleToggle}
            className={`p-2 bg-gray-900 hover:bg-gray-800 rounded-lg border border-gray-800 transition-colors ${liveAccount.isActive ? "text-red-400" : "text-green-400"}`}
            title="تفعيل/تعطيل"
          >
            <Power className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 bg-gray-900 hover:bg-red-900/30 text-gray-500 hover:text-red-400 rounded-lg border border-gray-800 transition-colors"
            title="حذف الحساب"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
            <Gamepad2 className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-bold text-white">معلومات اللعبة</h3>
            <span
              className={`mr-auto px-3 py-1 rounded-md text-xs font-bold ${liveAccount.isActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
            >
             {liveAccount.isActive ? "نشط" : (liveAccount.currentSales >= liveAccount.maxSales ? "تم الوصول لأقصى حد مبيعات" : "معطل")}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 text-sm mb-1">اسم اللعبة</p>
              <p className="text-white font-bold text-lg">
                {liveAccount.gameName}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">رمز المنتج (SKU)</p>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-400" />
                <p className="text-white font-mono">{liveAccount.sku}</p>
                <button
                  onClick={handleCopySKU}
                  className="p-1 hover:text-cyan-400 text-gray-500 transition-colors"
                  title="نسخ الـ SKU لربطه بسلة"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-sm mb-2">
                بيانات تسجيل الدخول (ستيم)
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-gray-950 border border-gray-800 rounded-lg p-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <User className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="text-white text-sm truncate dir-ltr">
                      {liveAccount.username || "غير متوفر"}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      handleCopyText(liveAccount.username, "اسم المستخدم")
                    }
                    className="p-1 hover:text-cyan-400 text-gray-500 transition-colors shrink-0"
                    title="نسخ اسم المستخدم"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between bg-gray-950 border border-gray-800 rounded-lg p-2">
                  <div className="flex items-center gap-2 overflow-hidden w-full">
                    <Lock className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="text-white text-sm truncate dir-ltr select-none">
                      {showPassword
                        ? liveAccount.password || "غير متوفر"
                        : "••••••••••••"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 hover:text-cyan-400 text-gray-500 transition-colors"
                      title={
                        showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() =>
                        handleCopyText(liveAccount.password, "كلمة المرور")
                      }
                      className="p-1 hover:text-cyan-400 text-gray-500 transition-colors"
                      title="نسخ كلمة المرور"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-sm mb-1">تاريخ الإضافة</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <p className="text-white text-sm">
                  {formatDate(liveAccount.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
            <ShieldAlert className="w-6 h-6 text-fuchsia-400" />
            <h3 className="text-xl font-bold text-white">الإحصائيات والقيود</h3>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">المبيعات الحالية</span>
                <span className="text-white font-bold">
                  {liveAccount.currentSales} / {liveAccount.maxSales}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-950 rounded-full overflow-hidden border border-gray-800">
                <div
                  className={`h-full ${liveAccount.currentSales >= liveAccount.maxSales ? "bg-red-500" : "bg-cyan-500"}`}
                  style={{
                    width: `${(liveAccount.currentSales / liveAccount.maxSales) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-3">
              <div className="flex justify-between items-center text-sm border-b border-gray-800/50 pb-2">
                <span className="text-gray-400">التصفير التلقائي:</span>
                <span className="text-cyan-400 font-bold">
                  {!liveAccount.settings.resetPeriodDays ||
                    liveAccount.settings.resetPeriodDays === 0
                    ? "لا يوجد (مدى الحياة)"
                    : `كل ${liveAccount.settings.resetPeriodDays} يوم`}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-gray-800/50 pb-2">
                <span className="text-gray-400">أقصى أكواد تحقق:</span>
                <span className="text-fuchsia-400 font-bold">
                  {liveAccount.settings.maxSteamGuardRequests}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">تحذير المشاهدات:</span>
                <span className="text-yellow-400 font-bold">
                  {liveAccount.settings.warningViewCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <ListOrdered className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-bold text-white">
              الطلبات المرتبطة بهذا الحساب
            </h3>
          </div>

          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="text"
              value={searchQueryOrders}
              onChange={(e) => setSearchQueryOrders(e.target.value)}
              placeholder="ابحث برقم الطلب..."
              className="w-full bg-gray-950 border border-gray-800 text-white text-xs rounded-lg pr-9 pl-9 py-2 focus:outline-none focus:border-cyan-500 transition-all dir-ltr text-left placeholder:text-right"
              dir="ltr"
            />
            {searchQueryOrders && (
              <button
                onClick={() => setSearchQueryOrders("")}
                className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {liveAccount.assignedOrders && liveAccount.assignedOrders.length > 0 ? (
          <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
            <table className="w-full text-right">
              <thead className="bg-gray-950 text-gray-400 text-xs border-b border-gray-800 whitespace-nowrap">
                <tr>
                  <th className="p-4">رقم الطلب (سلة)</th>
                  <th className="p-4">سجل النشاط</th>
                  <th className="p-4">حالة الوصول</th>
                  <th className="p-4">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {(liveAccount.assignedOrders || [])
                  .filter((order) =>
                    order.referenceId
                      .toLowerCase()
                      .includes(searchQueryOrders.toLowerCase()),
                  )
                  .map((order) => {
                    const isWarning =
                      order.accountViews >=
                      liveAccount.settings.warningViewCount;

                    return (
                      <tr
                        key={order._id}
                        className={`transition-colors ${isWarning ? "bg-yellow-500/10 hover:bg-yellow-500/20" : "hover:bg-gray-800/30"}`}
                      >
                        <td className="p-4">
                          <div className="text-white font-bold text-left dir-ltr w-max">
                            #{order.referenceId}
                          </div>
                          <div className="text-[10px] text-gray-500 mt-1">
                            {formatDate(order.assignedAt)}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${isWarning ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" : "bg-gray-950 border-gray-800 text-gray-300"}`}
                                title="مرات المشاهدة"
                              >
                                {isWarning ? (
                                  <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                                )}
                                <span className="text-xs font-bold tabular-nums">
                                  {order.accountViews}
                                </span>
                              </div>

                              <div
                                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-950 border border-gray-800 text-gray-300"
                                title="أكواد ستيم المستهلكة"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-fuchsia-400" />
                                <span className="text-xs font-bold tabular-nums">
                                  {order.steamGuardRequests}
                                </span>
                              </div>
                            </div>

                            {order.extraGuardAttempts > 0 && (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/5 border border-green-500/10 text-green-400 text-[10px] font-bold w-max">
                                <PlusCircle className="w-3 h-3" />
                                <span>+{order.extraGuardAttempts} محاولات</span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="p-4">
                          {order.isRevoked ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                              <ShieldAlert className="w-3 h-3 ml-1" /> محظور
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                              <ShieldCheck className="w-3 h-3 ml-1" /> مسموح
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          <div className="flex gap-2 whitespace-nowrap">
                            <button
                              onClick={() => handleTopUpOrder(order.referenceId)}
                              className="p-1.5 bg-gray-950 hover:bg-cyan-900/30 text-cyan-400 rounded-lg border border-gray-800 transition-colors"
                              title="إضافة محاولة Steam Guard"
                            >
                              <PlusCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleRevokeOrderToggle(order)}
                              className={`p-1.5 bg-gray-950 rounded-lg border border-gray-800 transition-colors ${
                                order.isRevoked
                                  ? "text-green-400 hover:bg-green-900/30"
                                  : "text-red-400 hover:bg-red-900/30"
                              }`}
                              title={
                                order.isRevoked
                                  ? "استعادة الوصول"
                                  : "إيقاف الوصول"
                              }
                            >
                              <ShieldAlert size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 italic bg-gray-950/30 rounded-xl border border-dashed border-gray-800">
            لم يتم بيع هذا الحساب لأي عميل حتى الآن.
          </div>
        )}
      </div>

      <AccountForm
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        refreshData={() => dispatch(fetchAccounts())}
        editData={liveAccount}
      />
    </div>

    {/* Revoke Modal */}
    {isRevokeModalOpen && createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-[calc(100vw-2rem)] sm:max-w-md overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-scale-in">
          <div className="p-6 sm:p-8">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mb-6 border border-red-500/30 mx-auto">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            
            <h3 className="text-xl font-bold text-white text-center mb-2">تأكيد حظر الوصول</h3>
            <p className="text-gray-400 text-sm text-center mb-8">
              أنت على وشك حظر وصول العميل لبيانات هذا الحساب. يرجى إدخال سبب الحظر ليتم عرضه للعميل.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 mr-1">سبب الحظر:</label>
                <textarea
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none text-right"
                  placeholder="مثال: مخالفة سياسة الاستخدام..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={confirmRevoke}
                  className="w-full sm:flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-500/20 order-1 sm:order-2"
                >
                  تأكيد الحظر
                </button>
                <button
                  onClick={() => setIsRevokeModalOpen(false)}
                  className="w-full sm:flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-all order-2 sm:order-1"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
};

export default AccountDetails;
