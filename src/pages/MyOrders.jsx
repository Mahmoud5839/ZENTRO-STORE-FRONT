import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiEye,
  FiArrowLeft,
  FiShoppingBag,
} from "react-icons/fi";
import { MdDeliveryDining, MdOutlinePendingActions } from "react-icons/md";
import { FaBoxOpen, FaMoneyBillWave } from "react-icons/fa";
import { HiOutlineReceiptRefund } from "react-icons/hi";
import api from "../services/api";

const MyOrders = () => {
  const { userInfo } = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders/myorders");
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReturns = async () => {
    try {
      const { data } = await api.get("/returns/my-returns");
      setReturns(data);
    } catch (error) {
      console.error("Error fetching returns:", error);
    }
  };

  useEffect(() => {
    if (userInfo) {
      Promise.all([fetchOrders(), fetchReturns()]);
    }
  }, [userInfo]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("ar-EG", options);
  };

  const getOrderStatus = (order) => {
    const allItemsReturned = order.orderItems.every((item) => {
      const isReturned = returns.some(
        (r) =>
          r.product?._id === item.productId &&
          (r.status === "approved" || r.status === "completed"),
      );
      return isReturned;
    });

    if (allItemsReturned && order.orderItems.length > 0) {
      return {
        label: "تم الاسترجاع",
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/30",
        icon: <HiOutlineReceiptRefund className="text-purple-400" />,
        isReturned: true,
      };
    } else if (order.isCompleted) {
      return {
        label: "تم التسليم",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        icon: <FiCheckCircle className="text-emerald-400" />,
        isReturned: false,
      };
    } else if (order.isDelivered) {
      return {
        label: "تم التوصيل",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        icon: <FiTruck className="text-blue-400" />,
        isReturned: false,
      };
    } else {
      return {
        label: "قيد المعالجة",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        icon: <MdOutlinePendingActions className="text-amber-400" />,
        isReturned: false,
      };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-20">
        <div className="container mx-auto px-4 text-center max-w-md">
          <div className="bg-gray-800/50 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6 shadow-xl backdrop-blur-sm">
            <FaBoxOpen className="text-5xl text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            لا توجد طلبات بعد
          </h2>
          <p className="text-gray-400 mb-8">
            اكتشف منتجاتنا وابدأ رحلة التسوق معنا
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <FiShoppingBag />
            <span>تسوق الآن</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-yellow-500/20 rounded-2xl">
              <FiPackage className="text-3xl text-yellow-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">طلباتي</h1>
              <p className="text-gray-400 mt-1">
                لديك {orders.length} {orders.length === 1 ? "طلب" : "طلبات"}
              </p>
            </div>
          </div>
          <div className="h-1 w-20 bg-yellow-500 rounded-full"></div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order, index) => {
            const status = getOrderStatus(order);
            const totalAmount =
              order.totalPrice ||
              order.orderItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0,
              );

            return (
              <div
                key={order._id}
                className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-700 hover:border-yellow-500/50"
                style={{ animation: `fadeInUp 0.5s ease ${index * 0.1}s both` }}
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-gray-800/80 border-b border-gray-700">
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-700/50 rounded-lg">
                      <FiPackage className="text-yellow-500 text-sm" />
                      <span className="text-gray-400 text-sm">رقم الطلب</span>
                      <span className="font-mono font-semibold text-white text-sm">
                        {order._id.slice(-8)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-700/50 rounded-lg">
                      <FiClock className="text-yellow-500 text-sm" />
                      <span className="text-gray-400 text-sm">التاريخ</span>
                      <span className="text-gray-300 text-sm">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${status.bg} ${status.color} border ${status.border} mt-3 sm:mt-0`}
                  >
                    {status.icon}
                    <span>{status.label}</span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-5">
                  <div className="space-y-3">
                    {order.orderItems.map((item, idx) => {
                      const isItemReturned = returns.some(
                        (r) =>
                          r.product?._id === item.productId &&
                          (r.status === "approved" || r.status === "completed"),
                      );

                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all duration-200"
                        >
                          <img
                            src={item.image || "https://via.placeholder.com/60"}
                            alt={item.productName || item.name}
                            className="w-16 h-16 object-cover rounded-lg shadow-md"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/60";
                            }}
                          />
                          <div className="flex-1">
                            <Link
                              to={`/product/${item.productId || item.product}`}
                              className="font-semibold text-white hover:text-yellow-500 transition line-clamp-1"
                            >
                              {item.productName || item.name}
                            </Link>
                            {isItemReturned && (
                              <span className="inline-flex items-center gap-1 text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full mt-1">
                                <HiOutlineReceiptRefund className="text-xs" />
                                مسترجع
                              </span>
                            )}
                            <div className="flex flex-wrap gap-4 mt-1 text-sm">
                              <span className="text-gray-400">
                                الكمية:{" "}
                                <span className="text-white">
                                  {item.quantity}
                                </span>
                              </span>
                              <span className="text-gray-400">
                                السعر:{" "}
                                <span className="text-white">
                                  {item.price}  
                                </span>
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-yellow-500 text-lg">
                              {(item.price * item.quantity).toFixed(2)}  
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Total & Actions */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-5 pt-4 border-t border-gray-700">
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="bg-gray-700/50 rounded-xl px-4 py-2">
                        <p className="text-sm text-gray-400">الإجمالي</p>
                        <p className="text-2xl font-bold text-yellow-500">
                          {totalAmount.toFixed(2)}  
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg">
                        <MdDeliveryDining />
                        <span>توصيل مجاني</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-blue-400 bg-blue-500/10 px-3 py-2 rounded-lg">
                        <FaMoneyBillWave />
                        <span>الدفع عند الاستلام</span>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4 sm:mt-0">
                      <Link
                        to={`/order/${order._id}`}
                        className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-5 py-2 rounded-xl font-semibold transition-all duration-200"
                      >
                        <FiEye />
                        <span>تفاصيل الطلب</span>
                      </Link>

                      {/* زر طلب استرجاع (يظهر فقط للطلبات المكتملة وغير المسترجعة) */}
                      {order.isCompleted && !status.isReturned && (
                        <Link
                          to="/my-returns"
                          className="flex items-center gap-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-5 py-2 rounded-xl font-semibold transition-all duration-200 border border-orange-500/30"
                        >
                          <HiOutlineReceiptRefund />
                          <span>طلب استرجاع</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Animation Styles */}
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default MyOrders;
