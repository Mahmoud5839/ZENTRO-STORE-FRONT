import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiShoppingBag,
  FiPhone,
} from "react-icons/fi";
import { MdOutlinePendingActions } from "react-icons/md";
import api from "../services/api";

const MyReturns = () => {
  const [returns, setReturns] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [returnForm, setReturnForm] = useState({
    quantity: 1,
    reason: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // جلب بيانات المستخدم من localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserInfo(user);
    }
  }, []);

  const fetchReturns = async () => {
    try {
      const { data } = await api.get("/returns/my-returns");
      setReturns(data);
    } catch (error) {
      console.error("Error fetching returns:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders/myorders");
      // جلب الطلبات المكتملة فقط (اللي وصلت)
      const completedOrders = data.filter(
        (order) => order.isCompleted === true,
      );
      setOrders(completedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchReturns(), fetchOrders()]);
  }, []);

  const handleOpenModal = (order, product) => {
    setSelectedOrder(order);
    setSelectedProduct(product);
    setReturnForm({
      quantity: 1,
      reason: "",
      phone: userInfo?.phone || "",
    });
    setShowModal(true);
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (!returnForm.reason.trim()) {
      toast.error("يرجى كتابة سبب الاسترجاع");
      return;
    }
    if (!returnForm.phone.trim()) {
      toast.error("يرجى إدخال رقم الهاتف للتواصل");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/returns", {
        order: selectedOrder._id,
        product: selectedProduct.product,
        quantity: returnForm.quantity,
        reason: returnForm.reason,
        phone: returnForm.phone,
      });
      toast.success("تم إرسال طلب الاسترجاع بنجاح");
      setShowModal(false);
      fetchReturns();
    } catch (error) {
      console.error("Error submitting return:", error);
      toast.error("فشل في إرسال طلب الاسترجاع");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return {
          label: "قيد المراجعة",
          icon: <MdOutlinePendingActions className="text-yellow-500" />,
          color: "bg-yellow-500/20 text-yellow-500",
        };
      case "approved":
        return {
          label: "تم القبول",
          icon: <FiCheckCircle className="text-green-500" />,
          color: "bg-green-500/20 text-green-500",
        };
      case "rejected":
        return {
          label: "مرفوض",
          icon: <FiXCircle className="text-red-500" />,
          color: "bg-red-500/20 text-red-500",
        };
      case "completed":
        return {
          label: "تم الاسترجاع",
          icon: <FiRefreshCw className="text-blue-500" />,
          color: "bg-blue-500/20 text-blue-500",
        };
      default:
        return {
          label: status,
          icon: <FiAlertCircle className="text-gray-500" />,
          color: "bg-gray-500/20 text-gray-500",
        };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-yellow-500/20 rounded-2xl">
              <FiRefreshCw className="text-3xl text-yellow-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">طلبات الاسترجاع</h1>
              <p className="text-gray-400 mt-1">
                تابع حالة طلبات الاسترجاع الخاصة بك
              </p>
            </div>
          </div>
          <div className="h-1 w-20 bg-yellow-500 rounded-full"></div>
        </div>

        {/* Returns List */}
        {returns.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-gray-700">
            <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiRefreshCw className="text-5xl text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              لا توجد طلبات استرجاع
            </h3>
            <p className="text-gray-400 mb-6">
              يمكنك طلب استرجاع أي منتج من طلباتك المكتملة
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {returns.map((returnItem) => {
              const status = getStatusBadge(returnItem.status);
              return (
                <div
                  key={returnItem._id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-700"
                >
                  <div className="p-5">
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FiPackage className="text-yellow-500" />
                          <h3 className="text-lg font-semibold text-white">
                            {returnItem.product?.name || "منتج"}
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">رقم الطلب</p>
                            <p className="text-gray-300 font-mono">
                              {returnItem.order?._id?.slice(-8) || "..."}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">الكمية</p>
                            <p className="text-gray-300">
                              {returnItem.quantity}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">السعر الإجمالي</p>
                            <p className="text-gray-300">
                              {returnItem.product?.price *
                                returnItem.quantity || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">التاريخ</p>
                            <p className="text-gray-300">
                              {new Date(
                                returnItem.createdAt,
                              ).toLocaleDateString("ar-EG")}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">الحالة</p>
                            <div
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${status.color}`}
                            >
                              {status.icon}
                              <span>{status.label}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-500">رقم الهاتف للتواصل</p>
                            <p className="text-gray-300">
                              {returnItem.phone || "غير متوفر"}
                            </p>
                          </div>
                        </div>
                        {returnItem.reason && (
                          <div className="mt-3 p-3 bg-gray-700/50 rounded-lg">
                            <p className="text-gray-500 text-sm mb-1">
                              سبب الاسترجاع:
                            </p>
                            <p className="text-gray-300 text-sm">
                              {returnItem.reason}
                            </p>
                          </div>
                        )}
                        {returnItem.adminNote && (
                          <div className="mt-2 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                            <p className="text-blue-400 text-sm mb-1">
                              ملاحظة الإدارة:
                            </p>
                            <p className="text-gray-300 text-sm">
                              {returnItem.adminNote}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Eligible Orders Section */}
        {orders.filter((order) =>
          order.orderItems.some((item) => {
            const alreadyReturned = returns.some(
              (r) => r.product?._id === item.productId,
            );
            return !alreadyReturned;
          }),
        ).length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FiShoppingBag className="text-yellow-500" />
              طلبات مؤهلة للاسترجاع
            </h2>
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-700"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-white font-semibold">
                        رقم الطلب: {order._id?.slice(-8)}
                      </h3>
                      <span className="text-sm text-green-400">مكتمل</span>
                    </div>
                    <div className="space-y-2">
                      {order.orderItems.map((item) => {
                        const alreadyReturned = returns.some(
                          (r) => r.product?._id === item.productId,
                        );
                        if (alreadyReturned) return null;
                        return (
                          <div
                            key={item.productId}
                            className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div>
                                <p className="text-white font-medium">
                                  {item.name}
                                </p>
                                <p className="text-gray-400 text-sm">
                                  الكمية: {item.quantity} | السعر: {item.price}{" "}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleOpenModal(order, item)}
                              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
                            >
                              <FiRefreshCw />
                              طلب استرجاع
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal for Return Request */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">طلب استرجاع</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-300 transition"
                >
                  <FiXCircle className="text-2xl" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
                <p className="text-gray-300">
                  <span className="font-semibold">المنتج:</span>{" "}
                  {selectedProduct?.name}
                </p>
                <p className="text-gray-300">
                  <span className="font-semibold">الكمية المتاحة:</span>{" "}
                  {selectedProduct?.quantity}
                </p>
              </div>

              <form onSubmit={handleSubmitReturn} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">
                    الكمية المراد استرجاعها
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct?.quantity}
                    value={returnForm.quantity}
                    onChange={(e) =>
                      setReturnForm({
                        ...returnForm,
                        quantity: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">
                    سبب الاسترجاع
                  </label>
                  <textarea
                    rows="3"
                    value={returnForm.reason}
                    onChange={(e) =>
                      setReturnForm({ ...returnForm, reason: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="اكتب سبب الاسترجاع هنا..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 flex items-center gap-2">
                    <FiPhone className="text-yellow-500" />
                    رقم الهاتف للتواصل
                  </label>
                  <input
                    type="tel"
                    value={returnForm.phone}
                    onChange={(e) =>
                      setReturnForm({ ...returnForm, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="مثال: 01012345678"
                    required
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    سيتم التواصل معك على هذا الرقم بخصوص طلب الاسترجاع
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                    ) : (
                      <>
                        <FiRefreshCw />
                        إرسال الطلب
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReturns;
