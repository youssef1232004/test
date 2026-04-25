import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../../features/ordersSlice";
import { topUpOrder, revokeOrder } from "../../services/api";
import {
  Search,
  X,
  ShieldAlert,
  ShieldCheck,
  PlusCircle,
  Eye,
  AlertTriangle,
} from "lucide-react";
import OrderDetails from "./OrderDetails";
import toast from "react-hot-toast";

const OrdersTable = () => {
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.orders);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState("مخالفة سياسة الاستخدام");
  const [revokeRefId, setRevokeRefId] = useState(null);
  const [revokeSku, setRevokeSku] = useState(null);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const filteredOrders = orders.filter((order) =>
    order.referenceId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleTopUp = async (referenceId, sku) => {
    try {
      await topUpOrder(referenceId, sku);
      toast.success("تمت إضافة محاولة Steam Guard إضافية!", { icon: "🔋" });
      dispatch(fetchOrders());
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("حدث خطأ أثناء إضافة المحاولة");
    }
  };

  const handleRevokeToggle = async (referenceId, currentStatus, sku) => {
    // If we are about to REVOKE (status is false), open custom modal
    if (!currentStatus) {
      setRevokeRefId(referenceId);
      setRevokeSku(sku);
      setIsRevokeModalOpen(true);
      return;
    }

    // If restoring access, just do it
    try {
      await revokeOrder(referenceId, sku, "");
      toast.success("تمت استعادة وصول العميل", { icon: "✅" });
      dispatch(fetchOrders());
    } catch (err) {
      toast.error("حدث خطأ أثناء تغيير الصلاحية");
    }
  };

  const confirmRevoke = async () => {
    try {
      const res = await revokeOrder(revokeRefId, revokeSku, revokeReason);
      if (res.data.message.includes("Revoked")) {
        toast.error("تم حظر وصول العميل للحساب", { icon: "🚫" });
      }
      setIsRevokeModalOpen(false);
      dispatch(fetchOrders());
    } catch (err) {
      toast.error("حدث خطأ أثناء تغيير الصلاحية");
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("ar-EG", options);
  };

  if (selectedOrder) {
    return (
      <OrderDetails
        order={selectedOrder}
        onBack={() => setSelectedOrder(null)}
      />
    );
  }

  return (
    <>
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold text-white">إدارة الطلبات</h2>

        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث برقم طلب سلة..."
            className="w-full bg-gray-900 border border-gray-800 text-white text-sm rounded-lg pr-10 pl-10 py-2 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all dir-ltr text-left placeholder:text-right placeholder:dir-rtl"
            dir="ltr"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-950 text-gray-400 text-sm border-b border-gray-800 whitespace-nowrap">
              <tr>
                <th className="p-4">رقم الطلب</th>
                <th className="p-4">اللعبة / الحساب</th>
                <th className="p-4">سجل النشاط</th>
                <th className="p-4">حالة الوصول</th>
                <th className="p-4">إجراءات الدعم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const warningLimit =
                    order.settings?.warningViewCount || 5;
                  const isWarning = order.accountViews >= warningLimit;

                  return (
                    <tr
                      key={order._id}
                      className={`transition-colors ${isWarning ? "bg-yellow-500/10 hover:bg-yellow-500/20" : "hover:bg-gray-800/30"}`}
                    >
                      <td className="p-4">
                        <div className="text-white font-bold tracking-wider text-left dir-ltr w-max">
                          #{order.referenceId}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(order.assignedAt)}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="text-cyan-50 text-sm font-semibold">
                          {order.gameName}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-1">
                          SKU: {order.sku}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${isWarning ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 'bg-gray-950 border-gray-800 text-gray-300'}`} title="مرات المشاهدة">
                              {isWarning ? <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> : <Eye className="w-3.5 h-3.5 text-cyan-400" />}
                              <span className="text-xs font-bold tabular-nums">{order.accountViews}</span>
                            </div>
                            
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-950 border border-gray-800 text-gray-300" title="أكواد ستيم المستهلكة">
                              <ShieldCheck className="w-3.5 h-3.5 text-fuchsia-400" />
                              <span className="text-xs font-bold tabular-nums">{order.steamGuardRequests}</span>
                            </div>
                          </div>
                          
                          {order.extraGuardAttempts > 0 && (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/5 border border-green-500/10 text-green-400 text-[10px] font-bold w-max">
                              <PlusCircle className="w-3 h-3" />
                              <span>+{order.extraGuardAttempts} محاولات إضافية</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        {order.isRevoked ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                            <ShieldAlert className="w-3 h-3 ml-1" /> محظور
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                            <ShieldCheck className="w-3 h-3 ml-1" /> مسموح
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 bg-gray-950 hover:bg-cyan-900/30 text-cyan-400 rounded-lg border border-gray-800 transition-colors"
                            title="عرض تفاصيل الطلب"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleTopUp(order.referenceId, order.sku)}
                            className="p-2 bg-gray-950 hover:bg-cyan-900/30 text-cyan-400 rounded-lg border border-gray-800 transition-colors"
                            title="إضافة محاولة Steam Guard"
                          >
                            <PlusCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleRevokeToggle(order.referenceId, order.isRevoked, order.sku)}
                            className={`p-2 bg-gray-950 rounded-lg border border-gray-800 transition-colors ${order.isRevoked
                                ? "text-green-400 hover:bg-green-900/30"
                                : "text-red-400 hover:bg-red-900/30"
                              }`}
                            title={
                              order.isRevoked
                                ? "استعادة الوصول"
                                : "إيقاف الوصول (Kill Switch)"
                            }
                          >
                            <ShieldAlert size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-500 italic">
                    لا توجد طلبات مطابقة...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>

    {/* Revoke Modal - Using Portal to break out of layout constraints */}
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

export default OrdersTable;
