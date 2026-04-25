import { ArrowRight, ShoppingCart, Activity, ShieldAlert, ShieldCheck, PlusCircle, AlertTriangle, Eye } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../../features/ordersSlice";
import { topUpOrder, revokeOrder } from "../../services/api";
import toast from "react-hot-toast";
import { useState } from "react";
import { createPortal } from "react-dom";

const OrderDetails = ({ order, onBack }) => {
  const dispatch = useDispatch();
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState("مخالفة سياسة الاستخدام");

  const liveOrder = useSelector(state =>
    state.orders.orders.find(o => o.referenceId === order.referenceId && o.sku === order.sku)
  ) || order;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const handleTopUp = async () => {
    try {
      await topUpOrder(liveOrder.referenceId, liveOrder.sku);
      toast.success("تمت إضافة محاولة Steam Guard إضافية!", { icon: '🔋' });
      dispatch(fetchOrders());
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("حدث خطأ أثناء إضافة المحاولة");
    }
  };

  const handleRevokeToggle = async () => {
    // If we are about to REVOKE (status is false), open custom modal
    if (!liveOrder.isRevoked) {
      setIsRevokeModalOpen(true);
      return;
    }

    // If restoring access, just do it
    try {
      await revokeOrder(liveOrder.referenceId, liveOrder.sku, "");
      toast.success("تمت استعادة وصول العميل", { icon: '✅' });
      dispatch(fetchOrders());
    } catch (err) {
      toast.error("حدث خطأ أثناء تغيير الصلاحية");
    }
  };

  const confirmRevoke = async () => {
    try {
      const res = await revokeOrder(liveOrder.referenceId, liveOrder.sku, revokeReason);
      if (res.data.message.includes("Revoked")) {
        toast.error("تم حظر وصول العميل للحساب", { icon: '🚫' });
      }
      setIsRevokeModalOpen(false);
      dispatch(fetchOrders());
    } catch (err) {
      toast.error("حدث خطأ أثناء تغيير الصلاحية");
    }
  };

  const warningLimit = liveOrder.settings?.warningViewCount || 5;
  const isWarning = liveOrder.accountViews >= warningLimit;

  return (
    <>
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-gray-900 hover:bg-cyan-500 hover:text-black text-cyan-400 rounded-lg border border-gray-800 transition-all">
            <ArrowRight className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-white">تفاصيل الطلب</h2>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button onClick={handleTopUp} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 hover:bg-cyan-900/30 text-cyan-400 rounded-lg border border-gray-800 transition-colors">
            <PlusCircle className="w-4 h-4" /> <span className="text-sm font-bold">زيادة المحاولات (+1)</span>
          </button>
          <button onClick={handleRevokeToggle} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 rounded-lg border border-gray-800 transition-colors ${liveOrder.isRevoked ? 'text-green-400 hover:bg-green-900/30' : 'text-red-400 hover:bg-red-900/30'}`}>
            <ShieldAlert className="w-4 h-4" /> <span className="text-sm font-bold">{liveOrder.isRevoked ? 'استعادة الوصول' : 'حظر العميل'}</span>
          </button>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-gray-800">
          <div>
            <p className="text-gray-400 text-sm mb-1">رقم الطلب (سلة)</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-white text-left dir-ltr w-max">#{liveOrder.referenceId}</h3>
          </div>
          <div className="flex flex-col items-start md:items-end">
            <span className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border ${liveOrder.isRevoked ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
              {liveOrder.isRevoked ? <><ShieldAlert className="w-5 h-5" /> وصول العميل محظور</> : <><ShieldCheck className="w-5 h-5" /> وصول العميل نشط</>}
            </span>
            <p className="text-gray-500 text-xs mt-2">تاريخ الاستلام: {formatDate(liveOrder.assignedAt)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 mb-4">
              <ShoppingCart className="w-5 h-5" />
              <h4 className="font-bold text-lg text-white">المنتج المرتبط</h4>
            </div>
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
              <p className="text-gray-500 text-xs mb-1">اسم اللعبة</p>
              <p className="text-white font-semibold mb-3">{liveOrder.gameName}</p>

              <p className="text-gray-500 text-xs mb-1">SKU</p>
              <p className="text-gray-300 font-mono text-sm">{liveOrder.sku}</p>
              
              {liveOrder.isRevoked && liveOrder.revocationReason && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                   <p className="text-red-400 text-[10px] font-bold mb-1">سبب الحظر الحالي:</p>
                   <p className="text-gray-400 text-xs italic">"{liveOrder.revocationReason}"</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className={`flex items-center gap-2 mb-4 ${isWarning ? 'text-yellow-500' : 'text-fuchsia-400'}`}>
              <Activity className="w-5 h-5" />
              <h4 className="font-bold text-lg text-white">سجل النشاط (Log)</h4>
            </div>

            <div className={`p-6 rounded-2xl border transition-all ${isWarning ? 'bg-yellow-500/5 border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.05)]' : 'bg-gray-950 border-gray-800 shadow-xl'}`}>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isWarning ? 'bg-yellow-500/20 text-yellow-500' : 'bg-cyan-500/10 text-cyan-400'}`}>
                      <Eye className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">مرات المشاهدة</p>
                      <p className="text-gray-500 text-[10px]">إجمالي مرات دخول العميل لبيانات الحساب</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-2xl font-black tabular-nums ${isWarning ? 'text-yellow-500' : 'text-white'}`}>{liveOrder.accountViews}</span>
                    {isWarning && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-500 animate-pulse px-2 py-0.5 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                         <AlertTriangle className="w-3 h-3" />
                         <span>تحذير أمني!</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="h-px bg-gray-800/50 w-full"></div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-fuchsia-500/10 text-fuchsia-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">أكواد Steam المستهلكة</p>
                      <p className="text-gray-500 text-[10px]">إجمالي عدد الأكواد التي طلبها العميل</p>
                    </div>
                  </div>
                  <span className="text-2xl font-black tabular-nums text-fuchsia-400">{liveOrder.steamGuardRequests}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-green-500/10 text-green-400">
                      <PlusCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">محاولات إضافية</p>
                      <p className="text-gray-500 text-[10px]">عدد الأكواد الإضافية المسموح بها للعميل</p>
                    </div>
                  </div>
                  <span className="text-2xl font-black tabular-nums text-green-400">+{liveOrder.extraGuardAttempts}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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

export default OrderDetails;