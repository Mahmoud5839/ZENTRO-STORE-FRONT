import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../services/api";
import { setUserInfo, setLoading, setError } from "../redux/userSlice";
import {
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiAlertCircle,
  FiShield,
  FiMail,
  FiSend,
  FiX,
} from "react-icons/fi";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [sendingReset, setSendingReset] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resendingVerification, setResendingVerification] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    color: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // فحص قوة كلمة المرور
  const checkPasswordStrength = (pass) => {
    let score = 0;

    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    let label = "";
    let color = "";

    if (pass.length === 0) {
      label = "";
      color = "bg-gray-200";
    } else if (score <= 2) {
      label = "ضعيف";
      color = "bg-red-500";
    } else if (score <= 4) {
      label = "متوسط";
      color = "bg-yellow-500";
    } else {
      label = "قوي";
      color = "bg-green-500";
    }

    setPasswordStrength({ score, label, color, length: pass.length });
  };

  const handlePasswordChange = (e) => {
    const pass = e.target.value;
    setPassword(pass);
    checkPasswordStrength(pass);
  };

  // التحقق من صحة المدخلات
  const validateForm = () => {
    if (isRegister) {
      if (name.trim().length < 3) {
        toast.error("الاسم يجب أن يكون 3 أحرف على الأقل");
        return false;
      }

      if (password.length < 6) {
        toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
        return false;
      }

      if (password !== confirmPassword) {
        toast.error("كلمة المرور غير متطابقة");
        return false;
      }

      if (passwordStrength.score <= 2 && password.length > 0) {
        toast.warning("كلمة المرور ضعيفة. يرجى استخدام كلمة مرور أقوى");
        return false;
      }
    }

    if (!email.includes("@")) {
      toast.error("البريد الإلكتروني غير صالح");
      return false;
    }

    return true;
  };

  // إعادة إرسال رابط تأكيد البريد الإلكتروني
  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;

    setResendingVerification(true);
    try {
      await api.post("/auth/resend-verification", { email: unverifiedEmail });
      toast.success(" تم إرسال رابط التأكيد إلى بريدك الإلكتروني");
      setShowVerificationModal(false);
    } catch (error) {
      console.error("Error resending verification:", error);
      toast.error(error.response?.data?.message || "حدث خطأ، حاول مرة أخرى");
    } finally {
      setResendingVerification(false);
    }
  };

  // تسجيل عادي
  const submitHandler = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    dispatch(setLoading(true));

    try {
      let res;
      if (isRegister) {
        res = await api.post("/auth/register", { name, email, password });
        toast.success(" تم إنشاء الحساب بنجاح! يرجى تأكيد بريدك الإلكتروني");
        // تفريغ الحقول بعد التسجيل
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        res = await api.post("/auth/login", { email, password });
        toast.success("مرحباً بعودتك! ");
        dispatch(setUserInfo(res.data));
        // العودة للصفحة السابقة أو الرئيسية
        const from = location.state?.from || "/";
        navigate(from);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "حدث خطأ";
      const requiresVerification = err.response?.data?.requiresVerification;
      const userEmail = err.response?.data?.email;

      if (requiresVerification && userEmail) {
        setUnverifiedEmail(userEmail);
        setShowVerificationModal(true);
      } else {
        toast.error(errorMsg);
      }

      dispatch(setError(errorMsg));
    }

    dispatch(setLoading(false));
  };

  // إرسال رابط إعادة تعيين كلمة المرور
  const handleForgotPassword = async () => {
    if (!forgotEmail || !forgotEmail.includes("@")) {
      toast.error("يرجى إدخال بريد إلكتروني صحيح");
      return;
    }

    setSendingReset(true);
    try {
      await api.post("/auth/forgot-password", { email: forgotEmail });
      toast.success(
        "  تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
      );
      setShowForgotModal(false);
      setForgotEmail("");
    } catch (error) {
      console.error("Error sending reset link:", error);
      toast.error(error.response?.data?.message || "حدث خطأ، حاول مرة أخرى");
    } finally {
      setSendingReset(false);
    }
  };

  // تسجيل دخول بجوجل
  const googleSuccess = async (credentialResponse) => {
    dispatch(setLoading(true));
    try {
      const { data } = await api.post("/auth/google", {
        credential: credentialResponse.credential,
      });

      dispatch(setUserInfo(data));
      toast.success("تم تسجيل الدخول بواسطة Google! 🚀");
      navigate("/");
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("فشل تسجيل الدخول بواسطة Google");
    }
    dispatch(setLoading(false));
  };

  const googleError = () => {
    toast.error("فشل تسجيل الدخول بواسطة Google");
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
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

      <div className="max-w-md w-full space-y-8 bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-700">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-white">
            {isRegister ? "إنشاء حساب جديد" : "تسجيل الدخول"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {isRegister ? "انضم إلينا اليوم" : "مرحباً بعودتك"}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={submitHandler}>
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                الاسم الكامل
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 bg-gray-700 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                placeholder="أدخل اسمك"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              required={!isRegister}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded-lg relative block w-full px-3 py-2 bg-gray-700 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={handlePasswordChange}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 bg-gray-700 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                placeholder="•••••••••••"
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

            {/* Password Strength Indicator */}
            {isRegister && password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">قوة كلمة المرور:</span>
                  <span
                    className={`font-semibold ${passwordStrength.color === "bg-red-500" ? "text-red-400" : passwordStrength.color === "bg-yellow-500" ? "text-yellow-400" : "text-green-400"}`}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
                <ul className="text-xs text-gray-400 space-y-1 mt-2">
                  <li
                    className={`flex items-center gap-1 ${password.length >= 8 ? "text-green-400" : ""}`}
                  >
                    {password.length >= 8 ? (
                      <FiCheckCircle />
                    ) : (
                      <FiAlertCircle />
                    )}
                    8 أحرف على الأقل
                  </li>
                  <li
                    className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? "text-green-400" : ""}`}
                  >
                    {/[A-Z]/.test(password) ? (
                      <FiCheckCircle />
                    ) : (
                      <FiAlertCircle />
                    )}
                    حرف كبير (A-Z)
                  </li>
                  <li
                    className={`flex items-center gap-1 ${/[0-9]/.test(password) ? "text-green-400" : ""}`}
                  >
                    {/[0-9]/.test(password) ? (
                      <FiCheckCircle />
                    ) : (
                      <FiAlertCircle />
                    )}
                    رقم (0-9)
                  </li>
                  <li
                    className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(password) ? "text-green-400" : ""}`}
                  >
                    {/[^A-Za-z0-9]/.test(password) ? (
                      <FiCheckCircle />
                    ) : (
                      <FiAlertCircle />
                    )}
                    رمز خاص (@, #, $, !)
                  </li>
                </ul>
              </div>
            )}
          </div>

          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 bg-gray-700 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
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
                <p className="text-red-400 text-xs mt-1">
                  كلمة المرور غير متطابقة
                </p>
              )}
              {confirmPassword && password === confirmPassword && password && (
                <p className="text-green-400 text-xs mt-1">
                  كلمة المرور متطابقة
                </p>
              )}
            </div>
          )}

          {/* زر نسيت كلمة المرور */}
          {!isRegister && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-sm text-yellow-500 hover:text-yellow-400 transition-colors duration-200"
              >
                نسيت كلمة المرور؟
              </button>
            </div>
          )}

          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-gray-900 bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-200"
          >
            {isRegister ? "إنشاء حساب" : "تسجيل دخول"}
          </button>
        </form>

        {/* Google Login Button */}
        <div className="mt-4">
          <div className="relative">
            <div className="inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">أو</span>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={googleSuccess}
              onError={googleError}
              useOneTap
              theme="filled_blue"
              shape="rectangular"
              text="continue_with"
              locale="ar"
            />
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setPassword("");
              setConfirmPassword("");
              setPasswordStrength({ score: 0, label: "", color: "" });
            }}
            className="text-yellow-500 hover:text-yellow-400 transition-colors duration-200"
          >
            {isRegister ? "لديك حساب؟ سجل دخول" : "ليس لديك حساب؟ سجل الآن"}
          </button>
        </div>
      </div>

      {/* مودال نسيت كلمة المرور */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FiMail className="text-yellow-500" />
                استعادة كلمة المرور
              </h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-gray-400 hover:text-gray-300 transition"
              >
                <FiX size={24} />
              </button>
            </div>
            <p className="text-gray-400 mb-4 text-sm">
              أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
            </p>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-4"
            />
            <button
              onClick={handleForgotPassword}
              disabled={sendingReset}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {sendingReset ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
              ) : (
                <>
                  <FiSend />
                  إرسال رابط الاستعادة
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/*   مودال تأكيد البريد الإلكتروني (للمستخدم غير المؤكد) */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FiAlertCircle className="text-yellow-500" />
                البريد الإلكتروني غير مؤكد
              </h3>
              <button
                onClick={() => setShowVerificationModal(false)}
                className="text-gray-400 hover:text-gray-300 transition"
              >
                <FiX size={24} />
              </button>
            </div>
            <p className="text-gray-400 mb-2">
              عذراً، لم يتم تأكيد بريدك الإلكتروني بعد.
            </p>
            <p className="text-gray-500 text-sm mb-4">
              تم إرسال رابط التأكيد إلى:{" "}
              <span className="text-yellow-500">{unverifiedEmail}</span>
            </p>
            <p className="text-gray-500 text-sm mb-4">
              يرجى التحقق من بريدك الإلكتروني والنقر على رابط التأكيد.
            </p>
            <button
              onClick={handleResendVerification}
              disabled={resendingVerification}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {resendingVerification ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
              ) : (
                <>
                  <FiSend />
                  إعادة إرسال رابط التأكيد
                </>
              )}
            </button>
            <button
              onClick={() => setShowVerificationModal(false)}
              className="w-full mt-3 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
