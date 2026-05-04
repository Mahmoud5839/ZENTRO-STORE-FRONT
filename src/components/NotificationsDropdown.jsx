import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaEnvelope,
  FaCheckDouble,
  FaShoppingBag,
} from "react-icons/fa";
import { FiRefreshCcw } from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../services/api";

const NotificationsDropdown = () => {
  // const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [adminNotifs, setAdminNotifs] = useState([]);
  const [userNotifs, setUserNotifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchAdminNotifications = async () => {
    if (!userInfo || userInfo.role !== "admin") return;
    setLoading(true);
    try {
      const { data } = await api.get("/notifications/admin");
      setAdminNotifs(data.notifications || []);
    } catch (error) {
      console.error("Error fetching admin notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserNotifications = async () => {
    if (!userInfo || userInfo.role !== "user") return;
    setLoading(true);
    try {
      const { data } = await api.get("/notifications/my");
      setUserNotifs(data.notifications || []);
    } catch (error) {
      console.error("Error fetching user notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo?.role === "admin") {
      fetchAdminNotifications();
    } else if (userInfo?.role === "user") {
      fetchUserNotifications();
    }

    const interval = setInterval(() => {
      if (userInfo?.role === "admin") fetchAdminNotifications();
      else if (userInfo?.role === "user") fetchUserNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, [userInfo]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      if (userInfo?.role === "admin") {
        fetchAdminNotifications();
      } else {
        fetchUserNotifications();
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/notifications/read/all");
      if (userInfo?.role === "admin") {
        fetchAdminNotifications();
      } else {
        fetchUserNotifications();
      }
      // toast.success(" تم تحديث جميع الإشعارات");
      alert(" تم تحديث جميع الإشعارات");
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const notifications = userInfo?.role === "admin" ? adminNotifs : userNotifs;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getAllNotifications = () => {
    if (userInfo?.role === "admin") {
      return notifications.map((n) => ({
        id: n._id,
        title: n.title,
        message: n.message,
        read: n.isRead,
        createdAt: n.createdAt,
        link: n.link,
        icon:
          n.type === "order" ? (
            <FaShoppingBag className="text-green-500" />
          ) : n.type === "return" ? (
            <FiRefreshCcw className="text-orange-500" />
          ) : (
            <FaEnvelope className="text-blue-500" />
          ),
      }));
    } else {
      return notifications.map((n) => ({
        id: n._id,
        title: n.title,
        message: n.message,
        read: n.isRead,
        createdAt: n.createdAt,
        link: n.link,
        icon:
          n.type === "return" ? (
            <FiRefreshCcw className="text-orange-500" />
          ) : (
            <FaEnvelope className="text-blue-500" />
          ),
      }));
    }
  };

  const allNotifications = getAllNotifications();

  useEffect(() => {
    if (notifications.length > 0) {
      const lastNotif = notifications[0];
      if (!lastNotif.isRead) {
        toast.info(lastNotif.message, {
          toastId: lastNotif._id,
          position: "top-right",
          autoClose: 5000,
          onClick: () => {
            if (lastNotif.link) navigate(lastNotif.link);
          },
        });
      }
    }
  }, [notifications, navigate]);

  if (!userInfo) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 px-4 py-2 rounded-md hover:bg-white/10 w-full transition"
      >
        <FaBell className="text-xl" /> <span className="text-xl">الإشعارات</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-96 bg-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-200">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 px-4 py-3 flex justify-between items-center sticky top-0">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <FaBell />
              الإشعارات
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-white hover:text-gray-200 flex items-center gap-1"
              >
                <FaCheckDouble />
                تحديث الكل
              </button>
            )}
          </div>

          <div className="max-h-[500px] overflow-auto">
            {allNotifications.length === 0 && !loading ? (
              <div className="text-center py-12 text-gray-300">
                <FaBell className="text-5xl mx-auto mb-3 text-gray-300" />
                <p>لا توجد إشعارات جديدة</p>
              </div>
            ) : (
              allNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border-b hover:bg-gray-700 transition cursor-pointer ${
                    !notif.read ? "bg-gray-700/50" : ""
                  }`}
                  onClick={() => {
                    if (!notif.read) handleMarkAsRead(notif.id);
                    if (notif.link) navigate(notif.link);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">{notif.icon}</div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-100 text-sm block">
                        {notif.title}
                      </p>
                      <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.createdAt).toLocaleString("ar-EG")}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
