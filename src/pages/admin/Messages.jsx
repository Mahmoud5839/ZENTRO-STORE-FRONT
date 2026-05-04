import React, { useState, useEffect } from "react";
import {
  FiMail,
  FiUser,
  FiMessageSquare,
  FiCheckCircle,
  FiClock,
  FiSend,
} from "react-icons/fi";
import { MdSubject, MdEmail } from "react-icons/md";
// import { toast } from "react-toastify";
import api from "../../services/api";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get("api/messages");
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      // toast.error(" فشل في تحميل الرسائل");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`api/messages/${id}/read`);
      fetchMessages();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleReply = async (id) => {
    if (!replyText.trim()) {
      // toast.error(" يرجى كتابة الرد أولاً");
      return;
    }

    setSendingReply(true);
    try {
      await api.put(`api/messages/${id}/reply`, { reply: replyText });
      // toast.success(" تم إرسال الرد بنجاح!");
      setReplyText("");
      fetchMessages();
      // تحديث الرسالة المحددة لعرض الرد الجديد
      const updatedMessage = messages.find((m) => m._id === id);
      if (updatedMessage) {
        setSelectedMessage({
          ...updatedMessage,
          reply: replyText,
          isReplied: true,
          repliedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      // toast.error(" فشل في إرسال الرد");
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

  const unreadCount = messages.filter((m) => !m.isRead).length;

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
            <FiMail className="text-yellow-500" />
            مركز الرسائل
          </h1>
          <p className="text-gray-400 mt-1">
            لديك {unreadCount}{" "}
            {unreadCount === 1 ? "رسالة غير مقروءة" : "رسائل غير مقروءة"}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1 bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
              <h2 className="text-white font-semibold">جميع الرسائل</h2>
            </div>
            <div className="divide-y divide-gray-700 max-h-[600px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FiMail className="text-5xl mx-auto mb-3 opacity-50" />
                  <p>لا توجد رسائل بعد</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`p-4 cursor-pointer transition hover:bg-gray-700 ${
                      selectedMessage?._id === msg._id ? "bg-gray-700" : ""
                    } ${!msg.isRead ? "bg-gray-750" : ""}`}
                    onClick={() => {
                      setSelectedMessage(msg);
                      setReplyText("");
                      if (!msg.isRead) markAsRead(msg._id);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FiUser className="text-blue-400 text-sm" />
                          <p className="font-semibold text-white text-sm">
                            {msg.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <MdEmail className="text-gray-500 text-xs" />
                          <p className="text-gray-400 text-xs">{msg.email}</p>
                        </div>
                        <p className="text-gray-300 text-sm mt-2 line-clamp-1">
                          {msg.subject}
                        </p>
                      </div>
                      {!msg.isRead && (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs mt-2">
                      {formatDate(msg.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Message Details */}
          <div className="lg:col-span-2 bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
              <h2 className="text-white font-semibold">تفاصيل الرسالة</h2>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {selectedMessage ? (
                <div className="space-y-5">
                  {/* معلومات المرسل */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-300">
                      <FiUser className="text-blue-400" />
                      <span className="font-semibold">المرسل:</span>
                      <span>{selectedMessage.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <MdEmail className="text-blue-400" />
                      <span className="font-semibold">البريد:</span>
                      <span>{selectedMessage.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <MdSubject className="text-blue-400" />
                      <span className="font-semibold">الموضوع:</span>
                      <span>{selectedMessage.subject}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <FiClock className="text-blue-400" />
                      <span className="font-semibold">التاريخ:</span>
                      <span>{formatDate(selectedMessage.createdAt)}</span>
                    </div>
                  </div>

                  {/* الرسالة الأصلية */}
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex items-center gap-2 text-gray-300 mb-3">
                      <FiMessageSquare className="text-blue-400" />
                      <span className="font-semibold">نص الرسالة:</span>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </div>

                  {/* ✅ الردود المتسلسلة (من مصفوفة replies) */}
                  {selectedMessage.replies &&
                    selectedMessage.replies.length > 0 && (
                      <div className="border-t border-gray-700 pt-4">
                        <div className="flex items-center gap-2 text-gray-300 mb-3">
                          <FiMessageSquare className="text-green-400" />
                          <span className="font-semibold">
                            المحادثة (الردود)
                          </span>
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
                                    ? " رد من الدعم"
                                    : " رد من العميل"}
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

                  {/* الرد القديم (للتوافق مع الإصدارات القديمة) */}
                  {selectedMessage.reply &&
                    !selectedMessage.replies?.length && (
                      <div className="border-t border-gray-700 pt-4">
                        <div className="flex items-center gap-2 text-green-400 mb-3">
                          <FiCheckCircle />
                          <span className="font-semibold">الرد من الدعم:</span>
                        </div>
                        <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
                          <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {selectedMessage.reply}
                          </p>
                          <p className="text-gray-500 text-xs mt-2">
                            تم الرد في: {formatDate(selectedMessage.repliedAt)}
                          </p>
                        </div>
                      </div>
                    )}

                  {/* نموذج الرد (للأدمن) */}
                  <div className="border-t border-gray-700 pt-4">
                    <label className="text-gray-300 mb-2 font-semibold flex items-center gap-2">
                      <FiSend className="text-yellow-400" />
                      الرد على الرسالة:
                    </label>
                    <textarea
                      rows="4"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white"
                      placeholder="اكتب ردك هنا..."
                    />
                    <button
                      onClick={() => handleReply(selectedMessage._id)}
                      disabled={sendingReply}
                      className="mt-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-5 py-2 rounded-lg font-semibold transition flex items-center gap-2"
                    >
                      {sendingReply ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                      ) : (
                        <FiSend />
                      )}
                      إرسال الرد
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <FiMail className="text-5xl mx-auto mb-3 opacity-50" />
                  <p>اختر رسالة من القائمة لعرض تفاصيلها والرد عليها</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
