import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDeliveryData,
  fetchSteamGuard,
  resetDelivery,
  clearSteamGuard,
  recordView,
} from "../../features/deliverySlice";
import CopyButton from "../../components/ui/CopyButton";
import {
  ShieldAlert,
  KeyRound,
  User,
  Loader2,
  AlertTriangle,
  ShoppingBag,
  Search,
  Gamepad2,
  RefreshCw,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Mail,
} from "lucide-react";

import logo from "../../assets/logo.png";

const CustomerDelivery = () => {
  const [inputOrderId, setInputOrderId] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [selectedAccountIndex, setSelectedAccountIndex] = useState(0);
  const [isSelectingGame, setIsSelectingGame] = useState(false); // NEW: Track selection step

  const dispatch = useDispatch();
  const {
    accountData,
    isLoading,
    error,
    isGuardLoading,
    steamGuardCode,
    steamGuardMessage,
    guardError,
    orderId,
    warning,
  } = useSelector((state) => state.delivery);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Handle multi-game order detection
  useEffect(() => {
    if (accountData && Array.isArray(accountData) && accountData.length > 1) {
      setIsSelectingGame(true);
    }
  }, [accountData]);

  useEffect(() => {
    document.title = "استلام الطلب - متجر بازّن";
  }, []);

  const handleFetchOrder = (e) => {
    e.preventDefault();
    if (!inputOrderId.trim()) return;
    setSelectedAccountIndex(0);
    setIsSelectingGame(false); // Reset
    dispatch(fetchDeliveryData(inputOrderId.trim()));
  };

  const handleGetSteamGuard = () => {
    if (cooldown > 0) return;
    const currentAccount = Array.isArray(accountData) ? accountData[selectedAccountIndex] : accountData;
    dispatch(fetchSteamGuard({ orderId, accountId: currentAccount.accountId }));
    setCooldown(30);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 selection:bg-cyan-500 selection:text-white relative overflow-hidden font-sans">
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-lg z-10 animate-fade-in flex flex-col min-h-[90vh]">

        {/* --- HORIZONTAL BRANDING HEADER --- */}
        <div className="w-full mb-12 pt-8 relative z-10 flex flex-col items-center">

          <div className="flex flex-row items-center justify-center gap-3 sm:gap-5">

            {/* 1. STORE NAME (Right Side) - TEXT SIZE REDUCED */}
            <div className="flex flex-col items-end text-right mt-1">
              <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 tracking-wider">
                متجر بازّن
              </h1>

            </div>

            {/* Vertical Divider - HEIGHT REDUCED */}
            <div className="h-8 sm:h-12 w-px bg-gray-800/80 rounded-full"></div>

            {/* 2. LOGO (Left Side) - LOGO SIZE REDUCED */}
            <div className="drop-shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:scale-105 transition-transform duration-500 shrink-0">
              <div
                className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-cyan-400 to-fuchsia-400"
                style={{
                  WebkitMaskImage: `url(${logo})`,
                  WebkitMaskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskImage: `url(${logo})`,
                  maskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                }}
                aria-label="Buzzin Store Logo"
              />
            </div>

          </div>
        </div>
        {/* ---------------------------------------- */}

        <div className="flex-grow flex flex-col justify-center">
          {!accountData && (
            <form
              onSubmit={handleFetchOrder}
              className="bg-gray-900/60 backdrop-blur-2xl p-8 md:p-10 rounded-3xl border border-gray-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden group animate-fade-in-up"
            >
              <div className="absolute inset-0 rounded-3xl border border-cyan-500/10 group-hover:border-cyan-500/30 transition-colors duration-500 pointer-events-none"></div>

              <div className="mb-8 relative z-10">
                <label className="block text-gray-300 text-sm font-bold mb-3 tracking-wide text-right">
                  أدخل رقم طلبك على سلة لاستلام الحساب
                </label>

                <div className="relative flex items-center group/input">
                  <div className="absolute left-4 text-gray-500 pointer-events-none transition-colors duration-300">
                    <Search className="w-5 h-5 group-focus-within/input:text-cyan-400" />
                  </div>
                  <input
                    type="text"
                    value={inputOrderId}
                    onChange={(e) => setInputOrderId(e.target.value)}
                    placeholder="مثال: 123456789"
                    className="w-full bg-gray-950/80 backdrop-blur-md border border-gray-700/60 text-white rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all text-left dir-ltr text-lg font-mono tracking-wider shadow-inner"
                    dir="ltr"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-4 rounded-2xl mb-8 text-sm flex items-center gap-3 animate-fade-in text-right">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !inputOrderId}
                className="w-full relative z-10 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-black text-lg py-4 px-6 rounded-2xl transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_30px_rgba(0,243,255,0.5)] transform hover:-translate-y-1 overflow-hidden"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin w-6 h-6 text-gray-950" />
                ) : (
                  <>
                    استلام الحساب
                    <ArrowLeft className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: GAME SELECTION (Only for multi-game orders) */}
          {accountData && isSelectingGame && Array.isArray(accountData) && (
            <div className="bg-gray-900/70 backdrop-blur-3xl p-8 md:p-10 rounded-3xl border border-cyan-500/20 shadow-[0_10px_40px_rgba(0,243,255,0.15)] animate-fade-in-up relative overflow-hidden">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-white mb-2">اختر اللعبة</h2>
                <p className="text-gray-400 text-sm">لقد قمت بشراء عدة منتجات، اختر اللعبة التي تريد استلامها الآن:</p>
              </div>

              <div className="flex flex-col gap-3 relative z-10">
                {accountData.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedAccountIndex(idx);
                      setIsSelectingGame(false);
                      dispatch(clearSteamGuard());
                      // Only record view if NOT revoked
                      if (!item.isRevoked) {
                        dispatch(recordView({ orderId, accountId: item.accountId }));
                      }
                    }}
                    className={`group flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 text-right ${item.isRevoked
                        ? "bg-red-500/5 border-red-500/20 hover:border-red-500/40 opacity-80"
                        : "bg-gray-950/50 border-gray-800 hover:border-cyan-500/50 hover:bg-cyan-500/5"
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-colors ${item.isRevoked
                        ? "bg-gray-900 text-red-500 group-hover:bg-red-500 group-hover:text-white"
                        : "bg-gray-900 text-gray-400 group-hover:bg-cyan-500 group-hover:text-gray-950"
                      }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-grow">
                      <span className={`font-bold block mb-1 transition-colors ${item.isRevoked ? "text-red-400" : "text-white group-hover:text-cyan-400"
                        }`}>
                        {item.gameName}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {item.isRevoked ? "هذا الحساب تم حظره من قبل المسؤول لمخالفة سياسة النظام" : "اضغط للعرض"}
                      </span>
                    </div>
                    {item.isRevoked ? (
                      <ShieldAlert className="w-5 h-5 text-red-500/50" />
                    ) : (
                      <ArrowLeft className="w-5 h-5 text-gray-700 group-hover:text-cyan-500 transition-colors" />
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => dispatch(resetDelivery())}
                className="w-full mt-8 text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors"
              >
                العودة للبحث برقم طلب آخر
              </button>
            </div>
          )}

          {/* STEP 3: DELIVERY DETAILS */}
          {accountData && !isSelectingGame && (() => {
            const currentAccount = Array.isArray(accountData) ? accountData[selectedAccountIndex] : accountData;
            
            // Calculate security warning based on account settings
            const isExceedingLimit = currentAccount.views >= (currentAccount.warningLimit || 5);
            const securityWarning = isExceedingLimit 
              ? `تنبيه أمني: تم رصد عدد محاولات دخول متكررة لبيانات هذا الحساب (${currentAccount.views} مرات).يرجى عدم مشاركة البيانات مع الآخرين لعدم تعرضك للحظر.`
              : null;

            return (
              <div className="bg-gray-900/70 backdrop-blur-3xl p-8 md:p-10 rounded-3xl border border-cyan-500/20 shadow-[0_10px_40px_rgba(0,243,255,0.15)] animate-fade-in-up relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 -translate-x-1/3"></div>

                {(securityWarning || warning) && !currentAccount.isRevoked && (
                  <div className="bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 p-4 rounded-2xl mb-8 text-sm flex items-start gap-3 text-right relative z-10">
                    <AlertTriangle className="w-6 h-6 shrink-0 text-yellow-400/80" />
                    <p className="leading-relaxed font-medium">{securityWarning || warning}</p>
                  </div>
                )}

                {/* Back to selection button if multi-game */}
                {Array.isArray(accountData) && accountData.length > 1 && (
                  <button
                    onClick={() => setIsSelectingGame(true)}
                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-bold mb-6 transition-all group"
                  >
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    العودة لقائمة الألعاب
                  </button>
                )}

                {/* Premium Game Display Card */}
                <div className="relative mb-10 group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-gray-950/40 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-gray-800/50 flex flex-col items-center text-center overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Gamepad2 className="w-24 h-24 text-cyan-400 -rotate-12" />
                    </div>



                    <h2 className="text-gray-400 text-xs font-bold mb-3 uppercase tracking-tighter">اللعبة المستلمة:</h2>
                    <p className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-lg">
                      {currentAccount.gameName}
                    </p>

                  </div>
                </div>

                {currentAccount.isRevoked ? (
                  /* REVOKED STATE UI */
                  <div className="relative z-10 animate-fade-in">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-8 text-center border-dashed">
                      <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                        <ShieldAlert className="w-10 h-10 text-red-500 animate-pulse" />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-4">تم إلغاء صلاحية الوصول</h3>
                      <p className="text-gray-400 leading-relaxed mb-8 max-w-sm mx-auto">
                        {currentAccount.revocationReason || "عذراً، لقد تم حظر وصولك لبيانات هذا الحساب لأسباب أمنية أو لمخالفة سياسة الاستخدام. يرجى التواصل مع الدعم الفني لحل المشكلة."}
                      </p>

                      <div className="flex flex-col gap-3">
                        <a
                          href="https://wa.me/966597327332"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] flex justify-center items-center gap-2"
                        >
                          تواصل مع الدعم عبر واتساب
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* NORMAL STATE UI */
                  <>
                    <div className="space-y-4 mb-10 relative z-10">
                      <div className="bg-gray-950/80 border border-gray-800/80 rounded-2xl p-4 flex justify-between items-center group hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_0_15_rgba(0,243,255,0.1)]">
                        <div className="flex items-center gap-3 sm:gap-4 text-gray-400">
                          <div className="bg-gray-900 p-2 rounded-xl group-hover:bg-cyan-500/10 transition-colors hidden sm:flex">
                            <User className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          <span className="font-mono text-white text-lg sm:text-xl tracking-wider text-left dir-ltr" dir="ltr">
                            {currentAccount.username}
                          </span>
                        </div>
                        <CopyButton textToCopy={currentAccount.username} label="اسم المستخدم" />
                      </div>

                      <div className="bg-gray-950/80 border border-gray-800/80 rounded-2xl p-4 flex justify-between items-center group hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_0_15_rgba(0,243,255,0.1)]">
                        <div className="flex items-center gap-3 sm:gap-4 text-gray-400">
                          <div className="bg-gray-900 p-2 rounded-xl group-hover:bg-cyan-500/10 transition-colors hidden sm:flex">
                            <KeyRound className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          <span className="font-mono text-white text-lg sm:text-xl tracking-wider text-left dir-ltr" dir="ltr">
                            {currentAccount.password}
                          </span>
                        </div>
                        <CopyButton textToCopy={currentAccount.password} label="كلمة المرور" />
                      </div>
                    </div>

                    {/* Steam Guard Section */}
                    <div className="bg-gradient-to-b from-gray-950 to-gray-900/80 border border-fuchsia-500/20 rounded-3xl p-6 sm:p-8 text-center relative z-10 shadow-lg group hover:border-fuchsia-500/40 transition-colors duration-500">
                      <div className="flex justify-center items-center gap-2 mb-6">
                        <ShieldCheck className="w-6 h-6 text-fuchsia-400/80" />
                        <h3 className="text-gray-300 font-bold text-lg">رمز تحقق ستيم </h3>
                      </div>

                      {steamGuardCode ? (
                        <div className="animate-fade-in">
                          <div className="mb-4  items-center justify-center gap-4 bg-gray-950/80 inline-flex p-4 rounded-2xl border border-fuchsia-500/30">
                            <span className="text-4xl sm:text-5xl font-mono text-fuchsia-400 font-black tracking-widest drop-shadow-[0_0_12px_rgba(188,19,254,0.6)] dir-ltr" dir="ltr">
                              {steamGuardCode}
                            </span>
                            <div className="h-8 sm:h-10 w-px bg-gray-800 mx-1 sm:mx-2"></div>
                            <CopyButton textToCopy={steamGuardCode} label="رمز التحقق" />
                          </div>
                          {steamGuardMessage && (
                            <p className="text-sm text-fuchsia-300/80 font-medium bg-fuchsia-500/10 py-2 px-4 rounded-xl inline-block mt-2">
                              {steamGuardMessage}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 mb-6 bg-gray-900/50 py-3 px-4 rounded-xl border border-gray-800/50 inline-block">
                          عند طلب ستيم لرمز التحقق، اضغط على الزر أدناه
                        </p>
                      )}

                      {guardError && (
                        <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center justify-center gap-2 font-medium">
                          <ShieldAlert className="w-5 h-5 shrink-0" />
                          {guardError}
                        </div>
                      )}

                      {!guardError && (
                        <button
                          onClick={handleGetSteamGuard}
                          disabled={isGuardLoading || cooldown > 0}
                          className={`w-full font-bold py-4 px-6 rounded-xl transition-all duration-300 flex justify-center items-center text-base sm:text-lg gap-2 mt-2
                            ${cooldown > 0
                              ? "bg-gray-900 border border-gray-800 text-gray-500 cursor-not-allowed"
                              : "bg-fuchsia-500/10 border border-fuchsia-500/50 text-fuchsia-400 hover:bg-fuchsia-500/20 shadow-[0_0_15px_rgba(188,19,254,0.15)] hover:shadow-[0_0_25px_rgba(188,19,254,0.3)] hover:-translate-y-0.5"
                            }`}
                        >
                          {isGuardLoading ? (
                            <Loader2 className="animate-spin w-6 h-6" />
                          ) : cooldown > 0 ? (
                            <>
                              <RefreshCw className="w-5 h-5 animate-spin-reverse" />
                              الرجاء الانتظار ({cooldown}) ثانية
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-5 h-5 " />
                              توليد رمز جديد
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </>
                )}

                {/* ACTION BUTTONS */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 relative z-10">
                  <button
                    onClick={() => dispatch(resetDelivery())}
                    className="w-full sm:w-auto flex-1 px-6 py-4 bg-transparent hover:bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400 rounded-2xl font-bold transition-all text-base flex justify-center items-center gap-2 group"
                  >
                    <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                    استلام طلب آخر
                  </button>

                  <a
                    href="https://buzzinstore.com"
                    className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-800 hover:bg-gray-700 text-white text-base font-bold rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    العودة للمتجر
                  </a>
                </div>
              </div>
            );
          })()}
        </div>

        {/* CONTACT & SUPPORT */}
        <div className="mt-12 relative z-10 flex flex-col items-center gap-4 w-full">
          <div className="flex items-center gap-2 mb-2 w-full justify-center opacity-80">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gray-600"></div>
            <p className="text-gray-400 text-sm font-medium px-4">للتواصل والدعم الفني</p>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gray-600"></div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center w-full px-4">
            <a
              href="https://wa.me/966597327332"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex justify-center items-center gap-3 text-emerald-400 hover:text-emerald-300 transition-all bg-emerald-500/10 hover:bg-emerald-500/20 px-6 py-3 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 shadow-sm hover:shadow-[0_0_15px_rgba(52,211,153,0.15)] group"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 group-hover:scale-110 transition-transform fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="font-mono text-xs sm:text-base tracking-wider" dir="ltr">+966 59 732 7332</span>
            </a>

            <a
              href="mailto:ibuzzin.store@gmail.com"
              className="flex-1 sm:flex-none flex justify-center items-center gap-3 text-cyan-400 hover:text-cyan-300 transition-all bg-cyan-500/10 hover:bg-cyan-500/20 px-6 py-3 rounded-2xl border border-cyan-500/20 hover:border-cyan-500/40 shadow-sm hover:shadow-[0_0_15px_rgba(0,243,255,0.15)] group"
            >
              <Mail className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="font-mono text-xs sm:text-base tracking-wider truncate" dir="ltr">ibuzzin.store@gmail.com</span>
            </a>
          </div>
        </div>

        {/* BUZZIN STORE FOOTER */}
        <div className="mt-8 pt-8 pb-4 text-center flex flex-col items-center">
          <div
            className="w-32 h-28 bg-gray-500 opacity-30  grayscale transition-all duration-300 hover:grayscale-0 hover:opacity-100 hover:bg-cyan-500"
            style={{
              WebkitMaskImage: `url(${logo})`,
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskImage: `url(${logo})`,
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
            }}
            aria-label="Buzzin Store Footer Logo"
          />
          <p className="text-xs text-gray-500 font-medium tracking-wide">
            © {new Date().getFullYear()} متجر بازّن. جميع الحقوق محفوظة.
          </p>
        </div>

      </div>
    </div>
  );
};

export default CustomerDelivery;