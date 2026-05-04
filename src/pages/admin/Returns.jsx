import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiUser,
  FiDollarSign,
  FiEdit2,
} from "react-icons/fi";
import { MdOutlinePendingActions, MdEmail } from "react-icons/md";
import api from "../../services/api";

const AdminReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: "",
    adminNote: "",
    refundAmount: "",
  });
  const [filter, setFilter] = useState("all");

  const fetchReturns = async () => {
    try {
      const { data } = await api.get("api/returns");
      setReturns(data);
    } catch (error) {
      console.error("Error fetching returns:", error);
      toast.error("فشل في تحميل طلبات الاسترجاع");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleOpenModal = (returnItem) => {
    setSelectedReturn(returnItem);
    setUpdateForm({
      status: returnItem.status,
      adminNote: returnItem.adminNote || "",
      refundAmount: returnItem.refundAmount || "",
    });
    setShowModal(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.put(`api/returns/${selectedReturn._id}/status`, {
        status: updateForm.status,
        adminNote: updateForm.adminNote,
        refundAmount: updateForm.refundAmount
          ? parseFloat(updateForm.refundAmount)
          : undefined,
      });
      toast.success("تم تحديث حالة طلب الاسترجاع");
      setShowModal(false);
      fetchReturns();
    } catch (error) {
      console.error("Error updating return:", error);
      toast.error("فشل في تحديث الحالة");
    } finally {
      setUpdating(false);
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

  const filteredReturns = returns.filter((returnItem) => {
    if (filter === "all") return true;
    return returnItem.status === filter;
  });

  const stats = {
    total: returns.length,
    pending: returns.filter((r) => r.status === "pending").length,
    approved: returns.filter((r) => r.status === "approved").length,
    completed: returns.filter((r) => r.status === "completed").length,
    rejected: returns.filter((r) => r.status === "rejected").length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-yellow-500 flex items-center gap-3">
            <FiRefreshCw className="text-yellow-500" />
            إدارة المرتجعات
          </h1>
          <p className="text-gray-400 mt-1">
            مراجعة وإدارة طلبات الاسترجاع من العملاء
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">الإجمالي</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">قيد المراجعة</p>
            <p className="text-2xl font-bold text-yellow-400">
              {stats.pending}
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">مقبول</p>
            <p className="text-2xl font-bold text-green-400">
              {stats.approved}
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">مكتمل</p>
            <p className="text-2xl font-bold text-blue-400">
              {stats.completed}
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">مرفوض</p>
            <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-700 pb-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg transition ${
              filter === "all"
                ? "bg-yellow-500 text-gray-900"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            الكل ({stats.total})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg transition ${
              filter === "pending"
                ? "bg-yellow-500 text-gray-900"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            قيد المراجعة ({stats.pending})
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-4 py-2 rounded-lg transition ${
              filter === "approved"
                ? "bg-yellow-500 text-gray-900"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            مقبول ({stats.approved})
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 rounded-lg transition ${
              filter === "completed"
                ? "bg-yellow-500 text-gray-900"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            مكتمل ({stats.completed})
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={`px-4 py-2 rounded-lg transition ${
              filter === "rejected"
                ? "bg-yellow-500 text-gray-900"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            مرفوض ({stats.rejected})
          </button>
        </div>

        {/* Returns Table */}
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-3 text-right text-xs font-medium text-gray-300 uppercase">
                    العميل
                  </th>
                  <th className="p-3 text-center text-xs font-medium text-gray-300 uppercase">
                    رقم الهاتف
                  </th>
                  <th className="p-3 text-center text-xs font-medium text-gray-300 uppercase">
                    المنتج
                  </th>
                  <th className="p-3 text-center text-xs font-medium text-gray-300 uppercase">
                    الكمية
                  </th>
                  <th className="p-3 text-center text-xs font-medium text-gray-300 uppercase">
                    السعر الإجمالي
                  </th>
                  <th className="p-3 text-center text-xs font-medium text-gray-300 uppercase">
                    رقم الطلب
                  </th>
                  <th className="p-3 text-center text-xs font-medium text-gray-300 uppercase">
                    التاريخ
                  </th>
                  <th className="p-3 text-center text-xs font-medium text-gray-300 uppercase">
                    الحالة
                  </th>
                  <th className="p-3 text-center text-xs font-medium text-gray-300 uppercase">
                    الإجراء
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredReturns.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-400">
                      لا توجد طلبات استرجاع
                    </td>
                  </tr>
                ) : (
                  filteredReturns.map((returnItem) => {
                    const status = getStatusBadge(returnItem.status);
                    return (
                      <tr key={returnItem._id} className="hover:bg-gray-700">
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="text-white text-sm flex items-center gap-1">
                              <FiUser className="text-gray-400 text-xs" />
                              {returnItem.user?.name || "غير معروف"}
                            </span>
                            <span className="text-gray-400 text-xs flex items-center gap-1 mt-1">
                              <MdEmail className="text-gray-500 text-xs" />
                              {returnItem.user?.email || "-"}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-center text-gray-300">
                          {returnItem.phone || "-"}
                        </td>
                        <td className="p-3 text-center text-gray-300">
                          {returnItem.product?.name || "-"}
                        </td>
                        <td className="p-3 text-center text-gray-300">
                          {returnItem.quantity}
                        </td>
                        <td className="p-3 text-center text-gray-300">
                          {returnItem.product?.price * returnItem.quantity || 0}
                        </td>
                        <td className="p-3 text-center text-gray-300 font-mono">
                          {returnItem.order?._id?.slice(-8) || "-"}
                        </td>
                        <td className="p-3 text-center text-gray-400 text-sm">
                          {new Date(returnItem.createdAt).toLocaleDateString(
                            "ar-EG",
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${status.color}`}
                          >
                            {status.icon}
                            <span>{status.label}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleOpenModal(returnItem)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-3 py-1 rounded-lg text-sm transition flex items-center gap-1 mx-auto"
                          >
                            <FiEdit2 size={14} />
                            تحديث
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Update Modal */}
      {showModal && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-lg w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                تحديث طلب الاسترجاع
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-300 transition"
              >
                <FiXCircle className="text-2xl" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
              <p className="text-gray-300">
                <span className="font-semibold">العميل:</span>{" "}
                {selectedReturn.user?.name}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold">رقم الهاتف:</span>{" "}
                {selectedReturn.phone}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold">المنتج:</span>{" "}
                {selectedReturn.product?.name}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold"> الإجمالي:</span>{" "}
                {selectedReturn.product?.price * selectedReturn.quantity || 0} 
              </p>
              <p className="text-gray-300">
                <span className="font-semibold">سبب الاسترجاع:</span>
              </p>
              <p className="text-gray-400 text-sm mt-1 p-2 bg-gray-900 rounded">
                {selectedReturn.reason}
              </p>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">تغيير الحالة</label>
                <select
                  value={updateForm.status}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, status: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="pending">قيد المراجعة</option>
                  <option value="approved">قبول</option>
                  <option value="rejected">رفض</option>
                  <option value="completed">اكتمال</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">
                  مبلغ الاسترجاع ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={updateForm.refundAmount}
                  onChange={(e) =>
                    setUpdateForm({
                      ...updateForm,
                      refundAmount: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="أدخل المبلغ المسترد"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">
                  ملاحظة إدارية
                </label>
                <textarea
                  rows="3"
                  value={updateForm.adminNote}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, adminNote: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="أضف ملاحظة للعميل..."
                />
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
                  disabled={updating}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                  ) : (
                    <>
                      <FiCheckCircle />
                      حفظ التغييرات
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReturns;
