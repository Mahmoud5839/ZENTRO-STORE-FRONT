import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import {
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiLock,
  FiAlertCircle,
} from "react-icons/fi";
import api from "../services/api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(true);

  useEffect(() => {
    if (!token) {
      setValidToken(false);
      toast.error(" رابط غير صالح");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error(" كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    if (password !== confirmPassword) {
      toast.error(" كلمة المرور غير متطابقة");
      return;
    }

    setLoading(true);
    try {
      await api.post("api/auth/reset-password", { token, password });
      toast.success(" تم تغيير كلمة المرور بنجاح");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(error.response?.data?.message || " حدث خطأ، حاول مرة أخرى");
      if (error.response?.status === 400) {
        setValidToken(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!validToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center py-12 px-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md text-center border border-gray-700">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiAlertCircle className="text-red-400 text-5xl" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">رابط غير صالح</h2>
          <p className="text-gray-400 mb-6">
            الرابط الذي استخدمته غير صالح أو منتهي الصلاحية
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-2 rounded-xl font-semibold transition"
          >
            العودة لتسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center py-12 px-4">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiLock className="text-yellow-500 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            إعادة تعيين كلمة المرور
          </h2>
          <p className="text-gray-400 text-sm mt-2">أدخل كلمة المرور الجديدة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              كلمة المرور الجديدة
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <FiEyeOff className="text-gray-400" />
                ) : (
                  <FiEye className="text-gray-400" />
                )}
              </button>
            </div>
            {password && (
              <p
                className={`text-xs mt-2 flex items-center gap-1 ${
                  password.length >= 6 ? "text-green-400" : "text-red-400"
                }`}
              >
                {password.length >= 6 ? <FiCheckCircle /> : <FiAlertCircle />}
                {password.length >= 6
                  ? "✓ كلمة مرور قوية"
                  : "يجب أن تكون 6 أحرف على الأقل"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              تأكيد كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 left-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <FiEyeOff className="text-gray-400" />
                ) : (
                  <FiEye className="text-gray-400" />
                )}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                <FiAlertCircle />✗ كلمة المرور غير متطابقة
              </p>
            )}
            {confirmPassword && password === confirmPassword && password && (
              <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                <FiCheckCircle />✓ كلمة المرور متطابقة
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 py-2 rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
            ) : (
              "تغيير كلمة المرور"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
