import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/authSlice";
import {
  Gamepad2,
  ShoppingCart,
  Users,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  User,
} from "lucide-react";
import InventoryTable from "../../components/admin/InventoryTable";
import OrdersTable from "../../components/admin/OrdersTable";
import UsersPanel from "../../components/admin/UsersPanel";
import ProfilePanel from "../../components/admin/ProfilePanel";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("inventory");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dispatch = useDispatch();
  const { username, role } = useSelector((state) => state.auth);

  useEffect(() => {
    document.title = "لوحة التحكم";
  }, []);

  const handleLogout = () => {
    dispatch(logout());
  };

  const menuItems = [
    { id: "inventory", label: "الحسابات", icon: Gamepad2 },
    { id: "orders", label: "إدارة الطلبات", icon: ShoppingCart },
    { id: "profile", label: "الملف الشخصي", icon: User },
    ...(role === "superadmin"
      ? [{ id: "users", label: "إدارة الموظفين", icon: Users }]
      : []),
  ];

  return (
    <div className="h-screen bg-gray-950 flex dir-rtl overflow-hidden selection:bg-cyan-500 selection:text-white">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar (Desktop & Mobile) */}
      <aside
        className={`fixed lg:static top-0 right-0 h-full w-72 bg-gray-900 border-l border-gray-800 z-50 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0`}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="bg-gray-950 p-2 rounded-lg border border-gray-800 shadow-[0_0_15px_rgba(0,243,255,0.15)]">
                <ShieldAlert className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                لوحة <span className="text-cyan-400">التحكم</span>
              </h2>
            </div>
            <button
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[inset_0_0_20px_rgba(0,243,255,0.05)]"
                    : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border border-transparent"
                    }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? "drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]" : ""}`}
                  />
                  <span className="font-semibold">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Admin Profile & Logout */}
          <div className="pt-6 border-t border-gray-800 mt-auto">
            <div className="flex items-center justify-between px-2 mb-4">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">
                  تم تسجيل الدخول كـ
                </span>
                <span className="text-sm font-bold text-white truncate max-w-[150px]">
                  @{username}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl py-3 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-semibold">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Mobile Header */}
        <header className="lg:hidden bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-cyan-400" />
            <h1 className="text-lg font-bold text-white">لوحة التحكم</h1>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 bg-gray-800 text-gray-300 rounded-lg border border-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Dynamic Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
          {/* Subtle Background Glows */}
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-cyan-900/10 to-transparent pointer-events-none"></div>

          <div className="max-w-7xl mx-auto relative z-10">
            {activeTab === "inventory" && <InventoryTable />}
            {activeTab === "orders" && <OrdersTable />}
            {activeTab === "profile" && <ProfilePanel />}
            {activeTab === "users" && <UsersPanel />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
