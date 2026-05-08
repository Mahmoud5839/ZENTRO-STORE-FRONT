import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiArrowLeft,
  FiMapPin,
  FiPhone,
  FiUser,
  FiHome,
  FiCalendar,
  FiDollarSign,
} from "react-icons/fi";
import {
  MdLocationCity,
  MdLocalShipping,
  MdOutlinePendingActions,
} from "react-icons/md";
import { FaBoxOpen, FaMoneyBillWave, FaUndo } from "react-icons/fa";
import { HiOutlineReceiptRefund } from "react-icons/hi";
// import ContactModal from "../components/ContactModal";
import api from "../services/api";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.user);
  const [order, setOrder] = useState(null);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
    } catch (error) {
      console.error("Error fetching order:", error);
      navigate("/my-orders");
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
    if (id) {
      Promise.all([fetchOrderDetails(), fetchReturns()]);
    }
  }, [id]);

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("ar-EG", options);
  };

  const getOrderStatus = () => {
    if (!order)
      return {
        label: "",
        color: "",
        bg: "",
        icon: null,
        message: "",
        isReturned: false,
      };

    const allItemsReturned = order.orderItems?.every((item) => {
      const isReturned = returns.some(
        (r) =>
          r.product?._id === item.productId &&
          (r.status === "approved" || r.status === "completed"),
      );
      return isReturned;
    });

    if (allItemsReturned && order.orderItems?.length > 0) {
      return {
        label: "تم الاسترجاع",
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        icon: <HiOutlineReceiptRefund className="text-purple-400 text-2xl" />,
        message: "تم استرجاع الطلب بنجاح",
        isReturned: true,
      };
    } else if (order?.isCompleted) {
      return {
        label: "تم التسليم",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        icon: <FiCheckCircle className="text-emerald-400 text-2xl" />,
        message: "تم تسليم الطلب بنجاح",
        isReturned: false,
      };
    } else if (order?.isDelivered) {
      return {
        label: "تم التوصيل",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        icon: <FiTruck className="text-blue-400 text-2xl" />,
        message: "تم توصيل الطلب إلى العنوان المحدد",
        isReturned: false,
      };
    } else {
      return {
        label: "قيد المعالجة",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        icon: <MdOutlinePendingActions className="text-amber-400 text-2xl" />,
        message: "جاري تجهيز الطلب للتوصيل",
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

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-gray-800/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-xl">
            <FaBoxOpen className="text-4xl text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            الطلب غير موجود
          </h2>
          <p className="text-gray-400 mb-6">
            لم نتمكن من العثور على الطلب المطلوب
          </p>
          <Link
            to="/my-orders"
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-2 rounded-xl font-semibold transition"
          >
            <FiArrowLeft />
            <span>عودة للطلبات</span>
          </Link>
        </div>
      </div>
    );
  }

  const status = getOrderStatus();
  const totalAmount =
    order.totalPrice ||
    order.orderItems?.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <Link
              to="/my-orders"
              className="inline-flex items-center gap-2 text-yellow-500 hover:text-yellow-400 transition mb-2"
            >
              <FiArrowLeft />
              <span>عودة للطلبات</span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <FiPackage className="text-yellow-500" />
              تفاصيل الطلب
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              رقم الطلب: {order._id.slice(-8)}
            </p>
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${status.bg} border ${status.isReturned ? "border-purple-500/30" : "border-gray-700"}`}
          >
            {status.icon}
            <span className={`font-semibold ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Order Items & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-700">
              <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 px-5 py-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FiPackage />
                  المنتجات
                </h2>
              </div>
              <div className="p-5 space-y-4">
                {order.orderItems?.map((item, idx) => {
                  const isItemReturned = returns.some(
                    (r) =>
                      r.product?._id === item.productId &&
                      (r.status === "approved" || r.status === "completed"),
                  );

                  return (
                    <div
                      key={idx}
                      className="flex gap-4 pb-4 border-b border-gray-700 last:border-0 last:pb-0"
                    >
                      <img
                        src={item.image || "https://via.placeholder.com/80"}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg shadow-md"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/80";
                        }}
                      />
                      <div className="flex-1">
                        <h2
                          className="font-semibold text-white hover:text-yellow-500 transition line-clamp-1"
                        >
                          {item.name}
                        </h2>
                        {isItemReturned && (
                          <span className="inline-flex items-center gap-1 text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full mt-1">
                            <HiOutlineReceiptRefund className="text-xs" />
                            مسترجع
                          </span>
                        )}
                        <div className="flex gap-4 mt-1 text-sm text-gray-400">
                          <span>
                            الكمية:{" "}
                            <span className="text-white">{item.quantity}</span>
                          </span>
                          <span>
                            السعر:{" "}
                            <span className="text-white">{item.price}</span>
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
            </div>

            {/* Order Timeline */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-700">
              <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 px-5 py-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FiCalendar />
                  حالة الطلب
                </h2>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <FiCheckCircle className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">تم إنشاء الطلب</p>
                      <p className="text-sm text-gray-400">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  {order.isDelivered && (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <FiTruck className="text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">تم التوصيل</p>
                        <p className="text-sm text-gray-400">
                          {order.deliveredAt
                            ? formatDate(order.deliveredAt)
                            : formatDate(order.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.isCompleted && (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <FaMoneyBillWave className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">تم التسليم</p>
                        <p className="text-sm text-gray-400">
                          {order.completedAt
                            ? formatDate(order.completedAt)
                            : formatDate(order.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {status.isReturned && (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <HiOutlineReceiptRefund className="text-purple-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">تم الاسترجاع</p>
                        <p className="text-sm text-gray-400">
                          تم استرجاع الطلب بالكامل
                        </p>
                      </div>
                    </div>
                  )}

                  {!order.isDelivered &&
                    !order.isCompleted &&
                    !status.isReturned && (
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
                          <MdOutlinePendingActions className="text-amber-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">
                            في انتظار المعالجة
                          </p>
                          <p className="text-sm text-gray-400">
                            جاري تجهيز طلبك للتوصيل
                          </p>
                        </div>
                      </div>
                    )}
                </div>

                <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
                  <p className="text-sm text-gray-300 flex items-center gap-2">
                    {status.icon}
                    <span>{status.message}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-amber-500/10 rounded-2xl p-4 text-center border border-amber-500/30">
              <h3 className="font-semibold text-amber-400 mb-1">
                تحتاج مساعدة؟
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                تواصل معنا لأي استفسار بخصوص طلبك
              </p>
              {/* <button
                onClick={() => setIsContactOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-gray-900 px-5 py-2 rounded-lg text-sm font-semibold transition"
              >
                اتصل بنا
              </button> */}
            </div>
          </div>

          {/* Right Column - Shipping & Payment Info */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-700">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FiMapPin />
                  عنوان الشحن
                </h2>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <FiUser className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">
                      {order.shippingAddress?.fullName || "غير متوفر"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiPhone className="text-gray-400 mt-0.5" />
                  <p className="text-gray-300">
                    {order.shippingAddress?.phone || "غير متوفر"}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <MdLocationCity className="text-gray-400 mt-0.5" />
                  <p className="text-gray-300">
                    {order.shippingAddress?.governorate || ""}
                    {order.shippingAddress?.city &&
                      ` - ${order.shippingAddress.city}`}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <FiHome className="text-gray-400 mt-0.5" />
                  <p className="text-gray-300">
                    {order.shippingAddress?.street ||
                      order.shippingAddress?.address ||
                      "غير متوفر"}
                    {order.shippingAddress?.building &&
                      ` - ${order.shippingAddress.building}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment & Total */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-700">
              <div className="bg-gradient-to-r from-emerald-600 to-green-700 px-5 py-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FaMoneyBillWave />
                  الدفع والإجمالي
                </h2>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">طريقة الدفع</span>
                  <span className="font-semibold text-white">
                    {order.paymentMethod === "cod"
                      ? "الدفع عند الاستلام"
                      : "غير محدد"}
                  </span>
                </div>
                <div className="border-t border-gray-700 pt-3 mt-2">
                  <div className="flex justify-between text-gray-400 mb-2">
                    <span>إجمالي المنتجات</span>
                    <span className="text-white">
                      {totalAmount?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400 mb-2">
                    <span>الشحن</span>
                    <span className="text-emerald-400">مجاني</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-700 mt-2">
                    <span className="text-lg font-bold text-white">
                      الإجمالي
                    </span>
                    <span className="text-2xl font-bold text-yellow-500">
                      {totalAmount?.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-gray-700/30 rounded-lg text-center">
                  <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                    <FiCheckCircle className="text-emerald-500" />
                    الدفع عند الاستلام متاح لهذا الطلب
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {/* <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      /> */}
    </div>
  );
};

export default OrderDetails;
