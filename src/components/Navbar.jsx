import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// import { toast } from "react-toastify";
import {
  FiUser,
  FiLogOut,
  FiGrid,
  FiHome,
  FiMail,
  FiPackage,
  FiRefreshCw,
  FiChevronDown
} from "react-icons/fi";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { FaShoppingCart, FaHeadset } from "react-icons/fa";
import { MdShoppingCart } from "react-icons/md";
import NotificationsDropdown from "./NotificationsDropdown";
import { logout } from "../redux/userSlice";
import { clearNotifications } from "../redux/notificationSlice";
import ContactModal from "./ContactModal";
import api from "../services/api";
import logo from "../assets/logo.png";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.cart);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  //   NEW: State لإشعارات الأدمن
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);
  const [userUnreadCount, setUserUnreadCount] = useState(0);

  const dropdownRef = useRef(null);
  const intervalRef = useRef(null);
  const checkedMessagesRef = useRef(new Set());

  //   NEW: دالة جلب إشعارات الأدمن من API
  const fetchAdminNotifications = async () => {
    if (!userInfo || userInfo.role !== "admin") return;
    try {
      const { data } = await api.get("/notifications/admin");
      setAdminUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching admin notifications:", error);
    }
  };

  //   دالة جلب إشعارات العميل
  const fetchUserNotifications = async () => {
    if (!userInfo || userInfo.role !== "user") return;
    try {
      const { data } = await api.get("/notifications/my");
      const unread = data.notifications.filter((n) => !n.isRead).length;
      setUserUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching user notifications:", error);
    }
  };

  // دالة فحص الردود الجديدة
  const checkNewReplies = async () => {
    if (!userInfo) return;
    try {
      const { data } = await api.get("/messages/my-messages");

      data.forEach((msg) => {
        if (msg.reply && !checkedMessagesRef.current.has(msg._id)) {
          checkedMessagesRef.current.add(msg._id);
          // Toast notification commented out
          // toast.info(` رد جديد على رسالتك: ${msg.subject.substring(0, 40)}`, {
          //   position: "top-right",
          //   autoClose: 6000,
          //   onClick: () => {
          //     window.location.href = "/my-messages";
          //   },
          // });
        }
      });
    } catch (error) {
      console.error("خطأ في فحص الردود:", error);
    }
  };

  //   NEW: useEffect لجلب إشعارات الأدمن بشكل دوري
  useEffect(() => {
    if (userInfo?.role === "admin") {
      fetchAdminNotifications();
      const interval = setInterval(fetchAdminNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [userInfo]);

  useEffect(() => {
    if (userInfo?.role === "user") {
      fetchUserNotifications();
      const interval = setInterval(fetchUserNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [userInfo]);

  useEffect(() => {
    if (userInfo) {
      checkNewReplies();
      intervalRef.current = setInterval(checkNewReplies, 10000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userInfo]);

  const logoutHandler = () => {
    dispatch(clearNotifications());
    dispatch(logout());
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // حساب إجمالي عدد المنتجات في السلة
  const totalCartItems = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  return (
    <nav className="backdrop-blur-lg bg-white/10 border-b border-white/20 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-2 space-x-2 text-2xl font-bold tracking-wide hover:scale-105 transition"
          >
            {/* <HiOutlineShoppingBag className="text-3xl text-blue-300" /> */}
            <img src={logo} alt="" className="w-10 h-10 rounded-full" />
            <span className="bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
              ZENTRO-STORE
            </span>
          </Link>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-white/10 transition"
          >
            ☰
          </button>

          {/* DESKTOP MENU */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-1 text-xl px-3 py-1 rounded-md hover:bg-white/10 transition"
            >
              <FiHome />
              <span className="pr-2">الرئيسية</span>
            </Link>

            <Link
              to="/cart"
              className="relative flex items-center space-x-1 text-xl px-3 py-1 rounded-md hover:bg-white/10 transition group"
            >
              <FaShoppingCart className="text-xl" />
              <span className="pr-2">السلة</span>
              {totalCartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {totalCartItems}
                </span>
              )}
            </Link>

            {userInfo &&
              (userInfo.role === "admin" || userInfo.role === "user") && (
                <div className="relative">
                  <NotificationsDropdown />
                  {(userInfo.role === "admin"
                    ? adminUnreadCount
                    : userUnreadCount) > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {(userInfo.role === "admin"
                        ? adminUnreadCount
                        : userUnreadCount) > 9
                        ? "9+"
                        : userInfo.role === "admin"
                          ? adminUnreadCount
                          : userUnreadCount}
                    </span>
                  )}
                </div>
              )}

            {userInfo && userInfo.role !== "admin" && (
              <>
                <button
                  onClick={() => setIsContactOpen(true)}
                  className="flex items-center gap-1 px-3 py-1 rounded-md hover:bg-white/10 transition"
                >
                  <FaHeadset className="text-xl" />
                  <span className="pr-2 text-xl">اتصل بنا</span>
                </button>

                <ContactModal
                  isOpen={isContactOpen}
                  onClose={() => setIsContactOpen(false)}
                />
              </>
            )}

            {userInfo ? (
              <div className="relative text-xl" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-1 rounded-md hover:bg-white/10 transition"
                >
                  <FiUser className="text-2xl" />
                  <span className="pr-2">{userInfo.name}</span>
                  <span
                    className={`transition ${isDropdownOpen && "rotate-180"}`}
                  >
                    <FiChevronDown className="text-2xl"/>
                  </span>
                </button>

                {/* DROPDOWN */}
                <div
                  className={`absolute right-0 mt-3 w-56 bg-white text-gray-800 rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 ${
                    isDropdownOpen
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  <div className="px-4 py-3 bg-gray-50 border-b">
                    <p className="text-sm text-gray-500">مرحباً</p>
                    <p className="font-semibold">{userInfo.name}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {userInfo.role === "admin" ? " مدير النظام" : " عميل"}
                    </p>
                  </div>

                  {userInfo.role === "admin" && (
                    <>
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FiGrid />
                        <span className="pr-2">لوحة التحكم</span>
                      </Link>
                      <Link
                        to="/admin/products"
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FiPackage />
                        <span className="pr-2">المنتجات</span>
                      </Link>
                      <Link
                        to="/admin/returns"
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FiRefreshCw />
                        <span className="pr-2">المرتجعات</span>
                      </Link>
                    </>
                  )}

                  {userInfo.role !== "admin" && (
                    <>
                      <Link
                        to="/my-orders"
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <MdShoppingCart />
                        <span className="pr-2">الطلبات</span>
                      </Link>
                      <Link
                        to="/my-returns"
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FiRefreshCw />
                        <span className="pr-2">المرتجعات</span>
                      </Link>
                    </>
                  )}

                  {userInfo.role !== "admin" && (
                    <Link
                      to="/my-messages"
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 transition"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FiMail />
                      <span className="pr-2">الرسائل</span>
                    </Link>
                  )}

                  <button
                    onClick={logoutHandler}
                    className="flex items-center space-x-2 w-full px-4 py-2 hover:bg-red-50 text-red-500 transition"
                  >
                    <FiLogOut />
                    <span className="pr-2">تسجيل خروج</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 text-xl px-3 py-1 rounded-md hover:bg-white/10 transition"
              >
                <FiUser className="text-2xl" />
                <span>دخول</span>
              </Link>
            )}
          </div>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`lg:hidden transition-all duration-300 ${
            isMobileMenuOpen
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="flex flex-col space-y-2 pb-4">
            <Link
              to="/"
              className="flex items-center gap-2 space-x-2 px-4 py-2 rounded-md hover:bg-white/10 transition"
            >
              <FiHome />
              <span>الرئيسية</span>
            </Link>

            <Link
              to="/cart"
              className="relative flex items-center gap-2 space-x-2 px-4 py-2 rounded-md hover:bg-white/10 transition"
            >
              <FaShoppingCart />
              <span>السلة</span>
              {totalCartItems > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {totalCartItems}
                </span>
              )}
            </Link>

            {userInfo &&
              (userInfo.role === "admin" || userInfo.role === "user") && (
                <div className="relative">
                  <NotificationsDropdown />
                  {(userInfo.role === "admin"
                    ? adminUnreadCount
                    : userUnreadCount) > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {(userInfo.role === "admin"
                        ? adminUnreadCount
                        : userUnreadCount) > 9
                        ? "9+"
                        : userInfo.role === "admin"
                          ? adminUnreadCount
                          : userUnreadCount}
                    </span>
                  )}
                </div>
              )}

            {userInfo && userInfo.role !== "admin" && (
              <>
                <button
                  onClick={() => setIsContactOpen(true)}
                  className="flex items-center gap-1 px-3 py-1 rounded-md hover:bg-white/10 transition"
                >
                  <FaHeadset className="text-xl" />
                  <span className="pr-2">اتصل بنا</span>
                </button>

                <ContactModal
                  isOpen={isContactOpen}
                  onClose={() => setIsContactOpen(false)}
                />
              </>
            )}

            {userInfo ? (
              <>
                {userInfo.role === "admin" && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center gap-2 space-x-2 px-4 py-2 rounded-md hover:bg-white/10 transition"
                    >
                      <FiGrid />
                      <span>لوحة التحكم</span>
                    </Link>
                    <Link
                      to="/admin/products"
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-white/10 transition"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FiPackage />
                      <span className="pr-2">المنتجات</span>
                    </Link>
                    <Link
                      to="/admin/returns"
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-white/10 transition"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FiRefreshCw />
                      <span className="pr-2">المرتجعات</span>
                    </Link>
                  </>
                )}

                {userInfo.role !== "admin" && (
                  <>
                    <Link
                      to="/my-orders"
                      className="flex items-center gap-2 space-x-2 px-4 py-2 rounded-md hover:bg-white/10 transition"
                    >
                      <MdShoppingCart />
                      <span>الطلبات</span>
                    </Link>
                    <Link
                      to="/my-messages"
                      className="flex items-center gap-2 space-x-2 px-4 py-2 rounded-md hover:bg-white/10 transition"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FiMail />
                      <span className="pr-2">الرسائل</span>
                    </Link>
                    <Link
                      to="/admin/returns"
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-white/10 transition"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FiRefreshCw />
                      <span className="pr-2">المرتجعات</span>
                    </Link>
                  </>
                )}

                <div className="border-t mt-2 flex">
                  <div className="flex items-center gap-2 space-x-2 px-3 py-2 rounded-md hover:bg-white/10 transition">
                    <FiUser />
                    <span className="pr-2">{userInfo.name}</span>
                  </div>
                  <button
                    onClick={logoutHandler}
                    className="flex items-center gap-2 space-x-2 px-3 py-2 rounded-md font-bold hover:bg-red-50 text-red-400 transition"
                  >
                    <FiLogOut />
                    <span>تسجيل خروج</span>
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 space-x-2 px-3 py-2 rounded-md hover:bg-white/10 transition"
              >
                <FiUser />
                <span>دخول</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
