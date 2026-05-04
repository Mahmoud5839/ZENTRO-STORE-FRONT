import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiCheckCircle, FiAlertCircle, FiMail } from "react-icons/fi";
import api from "../services/api";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const { data } = await api.get(`/auth/verify-email/${token}`);
        setStatus("success");
        setMessage(data.message);
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message || "فشل تأكيد البريد الإلكتروني",
        );
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-96 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
      <div className="container mx-auto px-4 text-center max-w-md">
        <div
          className={`rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6 shadow-xl ${
            status === "success" ? "bg-emerald-500/20" : "bg-red-500/20"
          }`}
        >
          {status === "success" ? (
            <FiCheckCircle className="text-6xl text-emerald-400" />
          ) : (
            <FiAlertCircle className="text-6xl text-red-400" />
          )}
        </div>
        <h2
          className={`text-2xl font-bold mb-3 ${
            status === "success" ? "text-white" : "text-white"
          }`}
        >
          {status === "success" ? "تم تأكيد البريد الإلكتروني!" : "فشل التأكيد"}
        </h2>
        <p className="text-gray-400 mb-6">{message}</p>
        {status === "success" ? (
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-3 rounded-xl font-semibold transition"
          >
            <FiMail />
            <span>تسجيل الدخول</span>
          </Link>
        ) : (
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-3 rounded-xl font-semibold transition"
          >
            <span>العودة لتسجيل الدخول</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
