import React, { useState, useEffect, useRef } from "react";
import {
  FiMail,
  FiCheckCircle,
  FiClock,
  FiInbox,
  FiMessageSquare,
  FiSend,
} from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const MyMessages = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const intervalRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get("api/messages/my-messages");
      setMessages(data);
      if (!selectedMessage && data.length > 0) {
        setSelectedMessage(data[0]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      // toast.error(" فشل في تحميل رسائلك");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    intervalRef.current = setInterval(() => {
      fetchMessages();
    }, 10000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Show notification for new replies (old system)
  useEffect(() => {
    if (!loading && messages.length > 0) {
      messages.forEach((msg) => {
        const hasBeenNotified = localStorage.getItem(`replied_${msg._id}`);
        if (msg.reply && !hasBeenNotified) {
          toast.info(` رد جديد على رسالتك: ${msg.subject.substring(0, 40)}`, {
            position: "top-center",
            autoClose: 6000,
            onClick: () => {
              navigate("/my-messages");
            },
          });
          localStorage.setItem(`replied_${msg._id}`, "true");
        }
      });
    }
  }, [messages, loading]);

  // ✅ دالة إرسال رد من العميل
  const handleUserReply = async (ticketId) => {
    if (!replyText.trim()) {
      // toast.error(" يرجى كتابة الرد أولاً");
      console.error(" يرجى كتابة الرد أولاً");
      return;
    }

    setSendingReply(true);
    try {
      await api.post(`api/messages/${ticketId}/reply-by-user`, {
        message: replyText,
      });
      // toast.success(" تم إرسال ردك بنجاح");
      setReplyText("");
      fetchMessages();
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error(" فشل في إرسال ردك، حاول مرة أخرى");
    } finally {
      setSendingReply(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-yellow-500/20 rounded-2xl">
              <FiMail className="text-3xl text-yellow-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">مركز الرسائل</h1>
              <p className="text-gray-400 mt-1">
                تواصل مع فريق الدعم وتابع ردودهم
              </p>
            </div>
          </div>
          <div className="h-1 w-20 bg-yellow-500 rounded-full"></div>
        </div>

        {messages.length === 0 ? (
          // Empty State
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-gray-700">
            <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiInbox className="text-5xl text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              لا توجد رسائل بعد
            </h3>
            <p className="text-gray-400 mb-6">
              تواصل مع فريق الدعم وسنكون سعداء بمساعدتك
            </p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <FiMessageSquare />
              تصفح المنتجات
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Messages List Sidebar */}
            <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-700">
              <div className="p-4 bg-gray-800 border-b border-gray-700">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <FiMail className="text-yellow-500" />
                  جميع المحادثات ({messages.length})
                </h3>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    onClick={() => {
                      setSelectedMessage(msg);
                      setReplyText("");
                    }}
                    className={`p-4 border-b border-gray-700 cursor-pointer transition-all duration-200 ${
                      selectedMessage?._id === msg._id
                        ? "bg-yellow-500/10 border-r-4 border-r-yellow-500"
                        : "hover:bg-gray-700/50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4
                        className={`font-semibold ${selectedMessage?._id === msg._id ? "text-yellow-500" : "text-white"}`}
                      >
                        {msg.subject}
                      </h4>
                      {(msg.reply ||
                        (msg.replies && msg.replies.length > 0)) && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                          تم الرد
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                      {msg.message.substring(0, 60)}...
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <FiClock size={12} />
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Details Area */}
            <div className="lg:col-span-2">
              {selectedMessage ? (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-700">
                  {/* Message Header */}
                  <div className="p-5 bg-gray-800 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-2">
                      {selectedMessage.subject}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <FiClock size={14} />
                        {formatDate(selectedMessage.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Customer Message */}
                  <div className="p-5 border-b border-gray-700">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <FiMessageSquare className="text-blue-400 text-sm" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-white">
                            رسالتك
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(selectedMessage.createdAt)}
                          </span>
                        </div>
                        <div className="bg-gray-700/50 rounded-xl p-4">
                          <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                            {selectedMessage.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ✅ الردود المتسلسلة */}
                  {selectedMessage.replies &&
                    selectedMessage.replies.length > 0 && (
                      <div className="p-5 border-b border-gray-700">
                        <div className="flex items-center gap-2 text-gray-300 mb-3">
                          <FiMessageSquare className="text-green-400" />
                          <span className="font-semibold">المحادثة</span>
                        </div>
                        <div className="space-y-3">
                          {selectedMessage.replies.map((reply, idx) => (
                            <div
                              key={idx}
                              className={`rounded-lg p-4 ${
                                reply.sender === "admin"
                                  ? "bg-green-900/20 border border-green-500/30 mr-6"
                                  : "bg-blue-900/20 border border-blue-500/30 ml-6"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span
                                  className={`text-xs font-semibold ${
                                    reply.sender === "admin"
                                      ? "text-green-400"
                                      : "text-blue-400"
                                  }`}
                                >
                                  {reply.sender === "admin"
                                    ? " رد من خدمة العملاء"
                                    : " رد منك"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(reply.createdAt)}
                                </span>
                              </div>
                              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
                                {reply.message}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* الرد القديم (للتأكد من عرض الردود القديمة) */}
                  {selectedMessage.reply &&
                    !selectedMessage.replies?.length && (
                      <div className="p-5 bg-gradient-to-r from-green-900/10 to-emerald-900/10 border-b border-green-800/30">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <FiCheckCircle className="text-green-400 text-sm" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-green-400">
                                رد خدمة العملاء
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(
                                  selectedMessage.repliedAt ||
                                    selectedMessage.updatedAt,
                                )}
                              </span>
                            </div>
                            <div className="bg-green-500/5 rounded-xl p-4 border border-green-500/20">
                              <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                                {selectedMessage.reply}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* انتظار رد */}
                  {!selectedMessage.reply &&
                    (!selectedMessage.replies ||
                      selectedMessage.replies.length === 0) && (
                      <div className="p-5 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-full">
                          <FiClock className="text-yellow-500" />
                          <span className="text-yellow-400 text-sm">
                            في انتظار رد خدمة العملاء
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm mt-3">
                          سيتم الرد على رسالتك في أقرب وقت ممكن
                        </p>
                      </div>
                    )}

                  {/* ✅ نموذج رد العميل */}
                  <div className="p-5 border-t border-gray-700 bg-gray-800/30">
                    <label className="block text-gray-300 mb-2 font-medium">
                      الرد على هذه الرسالة
                    </label>
                    <textarea
                      rows="3"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition resize-none"
                      placeholder="اكتب ردك هنا..."
                    />
                    <button
                      onClick={() => handleUserReply(selectedMessage._id)}
                      disabled={sendingReply}
                      className="mt-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                    >
                      {sendingReply ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                      ) : (
                        <FiSend />
                      )}
                      إرسال الرد
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-gray-700">
                  <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiMail className="text-3xl text-gray-500" />
                  </div>
                  <p className="text-gray-400">
                    اختر رسالة من القائمة لعرض تفاصيلها
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMessages;
