import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAccounts } from "../../features/inventorySlice";
import { toggleAccount, getAdminCode } from "../../services/api";
import { Plus, Power, Key, Search, X, Eye } from "lucide-react";
import AccountForm from "./AccountForm";
import toast from "react-hot-toast";
import AccountDetails from "./AccountDetails";

const InventoryTable = () => {
  const dispatch = useDispatch();
  const { accounts } = useSelector((state) => state.inventory);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // NEW: State for the search query
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, deactivated, maxSales

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  // Updated filtering logic
  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.sku.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === "active") return acc.isActive;
    if (filterStatus === "deactivated") return !acc.isActive;
    if (filterStatus === "maxSales") return acc.currentSales >= acc.maxSales;

    return true; // all
  });

  const handleToggle = async (id) => {
    const acc = accounts.find(a => a._id === id);
    if (acc && !acc.isActive && acc.currentSales >= acc.maxSales) {
      toast.error("لقد وصل هذا الحساب لأقصى حد للمبيعات. يرجى تعديل حد المبيعات قبل تفعيله.", { duration: 5000 });
      return;
    }

    try {
      await toggleAccount(id);
      dispatch(fetchAccounts());
      toast.success("تم تحديث الحالة");
    } catch (err) {
      console.error(err);
      toast.error("خطأ في التحديث");
    }
  };

  const handleGetCode = async (id) => {
    try {
      const res = await getAdminCode(id);
      navigator.clipboard.writeText(res.data.code);
      toast(`تم نسخ كود التحقق: ${res.data.code}`, {
        icon: "🔑",
        duration: 6000,
      });
    } catch (err) {
      console.error(err);
      toast.error("فشل جلب الكود");
    }
  };

  if (selectedAccount) {
    return (
      <AccountDetails
        account={selectedAccount}
        onBack={() => setSelectedAccount(null)}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold text-white">الحسابات</h2>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* NEW: Search Bar Container */}
          <div className="relative flex-1 md:w-64">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن لعبة أو SKU..."
              className="w-full bg-gray-900 border border-gray-800 text-white text-sm rounded-lg pr-10 pl-10 py-2 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
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

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all whitespace-nowrap"
          >
            <Plus size={20} /> إضافة حساب
          </button>
        </div>
      </div>

      {/* NEW: Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
            filterStatus === "all"
              ? "bg-cyan-500 text-black border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
              : "bg-gray-950 text-gray-400 border-gray-800 hover:border-gray-700"
          }`}
        >
          الكل ({accounts.length})
        </button>
        <button
          onClick={() => setFilterStatus("active")}
          className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
            filterStatus === "active"
              ? "bg-green-500 text-black border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
              : "bg-gray-950 text-gray-400 border-gray-800 hover:border-gray-700"
          }`}
        >
          نشط ({accounts.filter(a => a.isActive).length})
        </button>
        <button
          onClick={() => setFilterStatus("deactivated")}
          className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
            filterStatus === "deactivated"
              ? "bg-red-500 text-black border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
              : "bg-gray-950 text-gray-400 border-gray-800 hover:border-gray-700"
          }`}
        >
          معطل ({accounts.filter(a => !a.isActive).length})
        </button>
        <button
          onClick={() => setFilterStatus("maxSales")}
          className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
            filterStatus === "maxSales"
              ? "bg-orange-500 text-black border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]"
              : "bg-gray-950 text-gray-400 border-gray-800 hover:border-gray-700"
          }`}
        >
          وصل للحد الأقصى ({accounts.filter(a => a.currentSales >= a.maxSales).length})
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-gray-950 text-gray-400 text-sm border-b border-gray-800 whitespace-nowrap">
            <tr>
              <th className="p-4">اللعبة / SKU</th>
              <th className="p-4">المبيعات</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredAccounts.length > 0 ? (
              filteredAccounts.map((acc) => (
                <tr
                  key={acc._id}
                  className={`transition-colors border-b border-gray-800/50 ${acc.currentSales >= acc.maxSales ? "bg-red-500/10 hover:bg-red-500/20" : "hover:bg-gray-800/30"}`}
                >
                  <td className="p-4 whitespace-nowrap">
                    <div className="text-white font-bold">{acc.gameName}</div>
                    <div className="text-xs text-gray-500 font-mono">
                      {acc.sku}
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-gray-950 rounded-full overflow-hidden border border-gray-800">
                        <div
                          className={`h-full ${acc.currentSales >= acc.maxSales ? "bg-red-500" : "bg-cyan-500"}`}
                          style={{
                            width: `${(acc.currentSales / acc.maxSales) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-300">
                        {acc.currentSales}/{acc.maxSales}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-bold ${acc.isActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
                    >
                      {acc.isActive ? "نشط" : (acc.currentSales >= acc.maxSales ? "تم الوصول لأقصى حد مبيعات" : "معطل")}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedAccount(acc)}
                      className="p-2 bg-gray-950 hover:bg-cyan-900/30 text-cyan-400 rounded-lg border border-gray-800 transition-colors"
                      title="عرض التفاصيل الكاملة"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      onClick={() => handleGetCode(acc._id)}
                      className="p-2 bg-gray-950 hover:bg-gray-800 text-fuchsia-400 rounded-lg border border-gray-800"
                      title="جلب كود الأدمن"
                    >
                      <Key size={18} />
                    </button>
                    <button
                      onClick={() => handleToggle(acc._id)}
                      className={`p-2 bg-gray-950 hover:bg-gray-800 rounded-lg border border-gray-800 transition-colors ${acc.isActive ? "text-red-400" : "text-green-400"}`}
                      title={acc.isActive ? "تعطيل" : "تفعيل"}
                    >
                      <Power size={18} />
                    </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="p-10 text-center text-gray-500 italic"
                >
                  لا توجد نتائج بحث مطابقة...
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      <AccountForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        refreshData={() => dispatch(fetchAccounts())}
      />
    </div>
  );
};

export default InventoryTable;
