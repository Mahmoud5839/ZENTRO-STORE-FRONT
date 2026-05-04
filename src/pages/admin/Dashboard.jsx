import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiPackage,
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiShoppingBag,
  FiRefreshCw,
} from "react-icons/fi";
import api from "../../services/api";

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState("all");

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("api/products");
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("api/orders");
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchReturns = async () => {
    try {
      const { data } = await api.get("api/returns");
      setReturns(data);
    } catch (error) {
      console.error("Error fetching returns:", error);
    }
  };

  useEffect(() => {
    Promise.all([fetchProducts(), fetchOrders(), fetchReturns()]).finally(
      () => {
        setLoading(false);
      },
    );
  }, []);

  const completeOrder = async (orderId) => {
    try {
      await api.put(`api/orders/${orderId}/complete`);
      fetchOrders();
    } catch (error) {
      console.error("Error completing order:", error);
    }
  };

  // ✅ حساب إجمالي المبالغ المستردة من المرتجعات المقبولة
  const calculateTotalRefunds = () => {
    const approvedReturns = returns.filter(
      (r) => r.status === "approved" || r.status === "completed",
    );
    return approvedReturns.reduce((sum, r) => {
      // إذا كان مبلغ الاسترجاع محدد، استخدمه، وإلا استخدم سعر المنتج × الكمية
      const refundAmount = r.refundAmount || r.product?.price * r.quantity || 0;
      return sum + refundAmount;
    }, 0);
  };

  // ✅ حساب إجمالي الأرباح المفقودة من المرتجعات المقبولة
  const calculateLostProfitFromReturns = () => {
    const approvedReturns = returns.filter(
      (r) => r.status === "approved" || r.status === "completed",
    );
    return approvedReturns.reduce((sum, r) => {
      const product = products.find((p) => p._id === r.product?._id);
      if (product && product.costPrice) {
        const profitLost = (product.price - product.costPrice) * r.quantity;
        return sum + profitLost;
      }
      // تقدير 30% ربح إذا مفيش سعر شراء
      return sum + r.product?.price * r.quantity * 0.3 || 0;
    }, 0);
  };

  // حساب إجمالي الأرباح الفعلية (من الطلبات المكتملة - خصم المرتجعات)
  const calculateActualProfit = () => {
    let totalProfit = 0;
    orders.forEach((order) => {
      if (order.isCompleted && order.orderItems) {
        order.orderItems.forEach((item) => {
          const product = products.find((p) => p._id === item.product);
          if (product && product.costPrice) {
            totalProfit += (item.price - product.costPrice) * item.quantity;
          } else {
            totalProfit += item.price * item.quantity * 0.3;
          }
        });
      }
    });
    // ✅ خصم أرباح المرتجعات
    return totalProfit - calculateLostProfitFromReturns();
  };

  // حساب إجمالي الإيرادات الفعلية (من الطلبات المكتملة - خصم المرتجعات المالية)
  const calculateActualRevenue = () => {
    const totalRevenue = orders
      .filter((order) => order.isCompleted === true)
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // ✅ خصم المبالغ المستردة
    return totalRevenue - calculateTotalRefunds();
  };

  // حساب إجمالي الأرباح المتوقعة (من المنتجات في المخزون)
  const calculateExpectedProfit = () => {
    return products.reduce((sum, p) => {
      const profit = (p.price - (p.costPrice || 0)) * p.countInStock;
      return sum + (profit > 0 ? profit : 0);
    }, 0);
  };

  // حساب إجمالي قيمة المخزون
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + (p.costPrice || 0) * p.countInStock,
    0,
  );

  // حساب عدد المرتجعات قيد المراجعة
  const pendingReturnsCount = returns.filter(
    (r) => r.status === "pending",
  ).length;

  const filteredOrders = orders.filter((order) => {
    if (orderFilter === "completed") return order.isCompleted;
    if (orderFilter === "pending") return !order.isCompleted;
    return true;
  });

  const completedCount = orders.filter((o) => o.isCompleted === true).length;
  const pendingCount = orders.filter((o) => o.isCompleted === false).length;

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: calculateActualRevenue(),
    totalProfit: calculateActualProfit(),
    expectedProfit: calculateExpectedProfit(),
    pendingOrders: pendingCount,
    inventoryValue: totalInventoryValue,
    totalStock: products.reduce((sum, p) => sum + p.countInStock, 0),
    totalRefunds: calculateTotalRefunds(),
    pendingReturns: pendingReturnsCount,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-yellow-500 mb-2">
            لوحة التحكم
          </h1>
          <p className="text-gray-400">مرحباً بعودتك! إليك ملخص أداء المتجر</p>
        </div>

        {/* Stats Cards - الصف الأول */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 hover:bg-gray-750 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">المنتجات</p>
                <p className="text-3xl font-bold text-white">
                  {stats.totalProducts}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <FiPackage className="text-2xl text-blue-400" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              إجمالي المخزون: {stats.totalStock} قطعة
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-lg p-6 hover:bg-gray-750 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">الطلبات</p>
                <p className="text-3xl font-bold text-white">
                  {stats.totalOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <FiUsers className="text-2xl text-green-400" />
              </div>
            </div>
            <div className="mt-2 flex gap-4 text-xs">
              <span className="text-green-400">مكتملة: {completedCount}</span>
              <span className="text-yellow-400">معلقة: {pendingCount}</span>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-lg p-6 hover:bg-gray-750 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">الإيرادات</p>
                <p className="text-3xl font-bold text-white">
                  {stats.totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <FiDollarSign className="text-2xl text-yellow-400" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              بعد خصم {stats.totalRefunds.toFixed(2)} مبالغ مستردة
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-lg p-6 hover:bg-gray-750 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">مرتجعات معلقة</p>
                <p className="text-3xl font-bold text-white">
                  {stats.pendingReturns}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                <FiRefreshCw className="text-2xl text-orange-400" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">في انتظار المراجعة</div>
          </div>
        </div>

        {/* Stats Cards - الصف الثاني (الأرباح والمخزون) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-green-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm">الأرباح الفعلية</p>
                <p className="text-3xl font-bold text-green-400">
                  {stats.totalProfit.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <FiTrendingUp className="text-2xl text-green-400" />
              </div>
            </div>
            <div className="mt-2 text-xs text-green-300/70">
              بعد خصم المرتجعات والقيمة المستردة
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-blue-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm">الأرباح المتوقعة</p>
                <p className="text-3xl font-bold text-blue-400">
                  {stats.expectedProfit.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <FiTrendingUp className="text-2xl text-blue-400" />
              </div>
            </div>
            <div className="mt-2 text-xs text-blue-300/70">
              عند بيع كل المخزون
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-purple-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">قيمة المخزون</p>
                <p className="text-3xl font-bold text-purple-400">
                  {stats.inventoryValue.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <FiShoppingBag className="text-2xl text-purple-400" />
              </div>
            </div>
            <div className="mt-2 text-xs text-purple-300/70">
              حسب سعر الشراء
            </div>
          </div>
        </div>

        {/* Latest Orders Table */}
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-700 border-b border-gray-600 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">أحدث الطلبات</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setOrderFilter("all")}
                className={`px-3 py-1 rounded-lg text-sm transition ${
                  orderFilter === "all"
                    ? "bg-yellow-500 text-gray-900"
                    : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                }`}
              >
                الكل ({orders.length})
              </button>
              <button
                onClick={() => setOrderFilter("pending")}
                className={`px-3 py-1 rounded-lg text-sm transition ${
                  orderFilter === "pending"
                    ? "bg-yellow-500 text-gray-900"
                    : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                }`}
              >
                معلقة ({pendingCount})
              </button>
              <button
                onClick={() => setOrderFilter("completed")}
                className={`px-3 py-1 rounded-lg text-sm transition ${
                  orderFilter === "completed"
                    ? "bg-yellow-500 text-gray-900"
                    : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                }`}
              >
                مكتملة ({completedCount})
              </button>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-3 text-right text-xs font-medium text-gray-300 uppercase">
                    رقم الطلب
                  </th>
                  <th className="p-3 text-center text-xs font-medium text-gray-300 uppercase">
                    العميل
                  </th>
                  <th className="p-3 text-center text-xs font-medium text-gray-300 uppercase">
                    رقم الهاتف
                  </th>
                  <th className="p-3 text-center text-xs font-medium text-gray-300 uppercase">
                    الإجمالي
                  </th>
                  <th className="p-3 text-center text-xs font-medium text-gray-300 uppercase">
                    الحالة
                  </th>
                  <th className="p-3 text-center text-xs font-medium text-gray-300 uppercase">
                    التاريخ
                  </th>
                  <th className="p-3 text-center text-xs font-medium text-gray-300 uppercase">
                    إجراء
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredOrders.slice(0, 10).map((order) => (
                  <tr key={order._id} className="hover:bg-gray-700">
                    <td className="p-3 text-gray-300 font-mono text-sm">
                      {order._id.slice(-8)}
                    </td>
                    <td className="p-3 text-center text-gray-300">
                      {order.shippingAddress?.fullName ||
                        order.user?.name ||
                        "غير معروف"}
                    </td>
                    <td className="p-3 text-center text-gray-300">
                      {order.shippingAddress?.phone || "غير متوفر"}
                    </td>
                    <td className="p-3 text-center text-gray-300">
                      {order.totalPrice}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          order.isCompleted
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {order.isCompleted ? " مكتمل" : " قيد المعالجة"}
                      </span>
                    </td>
                    <td className="p-3 text-center text-gray-400 text-sm">
                      {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="p-3 text-center">
                      {!order.isCompleted && (
                        <button
                          onClick={() => completeOrder(order._id)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-3 py-1 rounded-lg text-sm transition"
                        >
                          تأكيد
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-400">
                      لا توجد طلبات لعرضها
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* روابط سريعة */}
          <div className="px-6 py-4 bg-gray-700/50 border-t border-gray-600 flex gap-4 flex-wrap">
            <Link
              to="/admin/products"
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
            >
              <FiPackage />
              إدارة المنتجات →
            </Link>
            <Link
              to="/admin/messages"
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
            >
              <FiUsers />
              مركز الرسائل →
            </Link>
            <Link
              to="/admin/returns"
              className="text-orange-400 hover:text-orange-300 text-sm flex items-center gap-1"
            >
              <FiRefreshCw />
              إدارة المرتجعات →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
