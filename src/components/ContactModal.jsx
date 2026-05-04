import React, { useState, useEffect, useRef } from "react";
// import { toast } from "react-toastify";
import {
  FaEnvelope,
  FaUser,
  FaComment,
  FaPaperPlane,
  FaTimes,
} from "react-icons/fa";
import { MdSubject } from "react-icons/md";
import api from "../services/api";

const ContactModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/messages", formData);
      // toast.success(" تم إرسال رسالتك بنجاح!");
      alert(" تم إرسال رسالتك بنجاح! ");
      setFormData({ name: "", email: "", subject: "", message: "" });
      onClose();
    } catch (err) {
      // toast.error(" حدث خطأ في إرسال الرسالة");
      alert(" حدث خطأ في إرسال الرسالة");
      console.error("Error sending message:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 280,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "1rem",
      }}
    >
      <div
        ref={modalRef}
        className="bg-gray-900 rounded-xl shadow-xl w-[90%] max-w-md mx-auto overflow-hidden"
        style={{ direction: "rtl" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 px-5 py-3 flex justify-between items-center">
          <h2 className="text-white text-lg font-bold flex items-center gap-2">
            <FaEnvelope />
            اتصل بنا
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 ">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="  text-gray-300 text-lg mb-1 flex items-center gap-2">
                <FaUser className="text-blue-500" />
                الاسم
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-600 text-white px-3 py-2  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="أدخل اسمك"
              />
            </div>

            <div>
              <label className="  text-gray-300 text-lg mb-1 flex items-center gap-2">
                <FaEnvelope className="text-blue-500" />
                البريد الإلكتروني
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-600 text-white px-3 py-2  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="يجب ان يكون الايميل المسجل في الحساب"
              />
            </div>

            <div>
              <label className="  text-gray-300 text-lg mb-1 flex items-center gap-2">
                <MdSubject className="text-blue-500" />
                الموضوع
              </label>
              <input
                type="text"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full bg-gray-600 text-white px-3 py-2  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="استفسار عن منتج / مشكلة في الطلب / ... إلخ"
              />
            </div>

            <div>
              <label className="  text-gray-300 text-lg mb-1 flex items-center gap-2">
                <FaComment className="text-blue-500" />
                الرسالة
              </label>
              <textarea
                name="message"
                required
                rows="4"
                value={formData.message}
                onChange={handleChange}
                className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="اكتب رسالتك هنا + رقم الطلب اذا كان الاستفسار عن طلب معين"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white/10 text-white py-2 rounded-lg font-semibold hover:bg-gray-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <FaPaperPlane />
                  إرسال الرسالة
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
