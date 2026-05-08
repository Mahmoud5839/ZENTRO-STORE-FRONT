import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
// import { toast } from "react-toastify";
import { addNotification } from "../redux/notificationSlice";
import {
  FaUser,
  FaUserCircle,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaBuilding,
  FaHome,
  FaCreditCard,
  FaMoneyBillWave,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";
import { MdLocationCity, MdOutlineAttachMoney } from "react-icons/md";
import { FiPackage, FiTruck } from "react-icons/fi";
import api from "../services/api";
import { clearCart } from "../redux/cartSlice";

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.user);

  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    governorate: "",
    city: "",
    street: "",
    building: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);

  // قائمة المحافظات المصرية
  const governorates = [
    "القاهرة",
    "الإسكندرية",
    "الجيزة",
    "القليوبية",
    "الشرقية",
    "الدقهلية",
    "البحيرة",
    "المنوفية",
    "الغربية",
    "كفر الشيخ",
    "دمياط",
    "بورسعيد",
    "الإسماعيلية",
    "السويس",
    "شمال سيناء",
    "جنوب سيناء",
    "الفيوم",
    "بني سويف",
    "المنيا",
    "أسيوط",
    "سوهاج",
    "قنا",
    "الأقصر",
    "أسوان",
    "الوادي الجديد",
    "البحر الأحمر",
    "مطروح",
  ];

  //  المنتج من الطلب المباشر (لو موجود)
  const directProduct = location.state?.product;
  const isDirectOrder = !!directProduct;

  //  استخدام المنتج المباشر إذا وجد، وإلا استخدم السلة
  const orderItems = isDirectOrder ? [directProduct] : cartItems;

  const totalPrice = orderItems.reduce(
    (acc, item) => acc + item.price * (item.quantity || 1),
    0,
  );

  console.log("directProduct:", directProduct);
  console.log("isDirectOrder:", isDirectOrder);
  console.log("orderItems:", orderItems);
  console.log("cartItems:", cartItems);

  useEffect(() => {
    if (orderItems.length === 0) {
      // toast.warning("⚠️ لا توجد منتجات للشراء");
      alert(" لا توجد منتجات للشراء");
      navigate("/");
    }
  }, [orderItems, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!shippingAddress.firstName || !shippingAddress.lastName) {
      // toast.error("يرجى إدخال الاسم الأول والثاني");
      alert("يرجى إدخال الاسم الأول والثاني");
      return;
    }
    if (!shippingAddress.phone || shippingAddress.phone.length < 10) {
      // toast.error("يرجى إدخال رقم جوال صحيح");
      alert("يرجى إدخال رقم جوال صحيح");
      return;
    }
    if (!shippingAddress.governorate) {
      // toast.error("يرجى اختيار المحافظة");
      alert("يرجى اختيار المحافظة");
      return;
    }
    if (!shippingAddress.city) {
      // toast.error("يرجى إدخال اسم المدينة");
      alert;
      return;
    }
    if (!shippingAddress.street) {
      // toast.error("يرجى إدخال اسم الشارع");
      alert("يرجى إدخال اسم الشارع");
      return;
    }

    setLoading(true);

    try {
      const orderItemsData = orderItems.map((item) => ({
        name: item.name,
        quantity: item.quantity || 1,
        price: item.price,
        product: item.id || item.product,
        image: item.image,
      }));

      const fullAddress = `${shippingAddress.street}، ${shippingAddress.building || ""}، ${shippingAddress.city}، ${shippingAddress.governorate}`;

      const orderData = {
        orderItems: orderItemsData,
        shippingAddress: {
          fullName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          phone: shippingAddress.phone,
          governorate: shippingAddress.governorate,
          city: shippingAddress.city,
          street: shippingAddress.street,
          building: shippingAddress.building || "",
          address: fullAddress,
          postalCode: "00000",
          country: "مصر",
        },
        paymentMethod,
        totalPrice,
      };

      const { data } = await api.post("/orders", orderData);

      if (!isDirectOrder) {
        dispatch(clearCart());
      }

      console.log(" Adding notification:", {
        type: "order",
        title: " طلب جديد!",
        message: `طلب جديد رقم #${data._id.slice(-6)} بقيمة $${totalPrice} من ${shippingAddress.fullName}`,
        link: `/order/${data._id}`,
      });

      const existingNotifs = JSON.parse(
        localStorage.getItem("orderNotifications") || "[]",
      );
      existingNotifs.unshift({
        id: Date.now(),
        type: "order",
        title: " طلب جديد!",
        message: `طلب جديد رقم #${data._id.slice(-6)} بقيمة $${totalPrice}`,
        link: `/order/${data._id}`,
        read: false,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(
        "orderNotifications",
        JSON.stringify(existingNotifs),
      );

      dispatch(
        addNotification({
          id: Date.now(),
          type: "order",
          title: " طلب جديد!",
          message: `طلب جديد رقم #${data._id.slice(-6)} بقيمة $${totalPrice} من ${shippingAddress.fullName}`,
          link: `/order/${data._id}`,
          read: false,
          createdAt: new Date().toISOString(),
          icon: "order",
        }),
      );

      // toast.success(" تم إنشاء طلبك بنجاح!");
      confirm(" تم إنشاء طلبك بنجاح! هل ترغب في مشاهدة تفاصيل الطلب؟") &&
        navigate(`/order/${data._id}`);
    } catch (error) {
      console.error("Error creating order:", error);
      // toast.error(" حدث خطأ، يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  if (orderItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-yellow-500 flex items-center gap-3">
            <FaCreditCard className="text-yellow-500" />
            إتمام الشراء
          </h1>
          <button
            onClick={() => navigate(isDirectOrder ? "/" : "/cart")}
            className="flex items-center gap-2 text-yellow-500 hover:text-yellow-700 transition"
          >
            <FaArrowLeft />
            <span>{isDirectOrder ? "العودة للتسوق" : "العودة للسلة"}</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Checkout Form */}
          <div className="lg:w-2/3">
            <div className="rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <FaUserCircle />
                  بيانات الشحن
                </h2>
                <p className="text-gray-100 text-sm mt-1">
                  يرجى إدخال بياناتك بدقة لضمان توصيل طلبك
                </p>
              </div>

              <form onSubmit={submitHandler} className="p-6 space-y-5">
                {/* الاسم الأول والثاني */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-200 mb-2 font-medium flex items-center gap-2">
                      <FaUser className="text-blue-500" />
                      الاسم الأول
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.firstName}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          firstName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 text-white bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="أدخل اسمك الأول"
                    />
                  </div>
                  <div>
                    <label className="text-gray-200 mb-2 font-medium flex items-center gap-2">
                      <FaUserCircle className="text-blue-500" />
                      الاسم الثاني
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.lastName}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          lastName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 text-white bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="أدخل اسم العائلة"
                    />
                  </div>
                </div>

                {/* رقم الجوال */}
                <div>
                  <label className="text-gray-200 mb-2 font-medium flex items-center gap-2">
                    <FaPhoneAlt className="text-blue-500" />
                    رقم الجوال
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-800 px-3 py-3 rounded-xl  text-gray-200">
                      +20
                    </span>
                    <input
                      type="tel"
                      required
                      value={shippingAddress.phone}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          phone: e.target.value,
                        })
                      }
                      className="flex-1 px-4 py-3 text-white bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="رقم الجوال"
                    />
                  </div>
                  <p className="text-gray-400 text-xs mt-1">
                    مثال: 01012345678
                  </p>
                </div>

                {/* المحافظة */}
                <div>
                  <label className="text-gray-200 mb-2 font-medium flex items-center gap-2">
                    <MdLocationCity className="text-blue-500" />
                    المحافظة
                  </label>
                  <select
                    required
                    value={shippingAddress.governorate}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        governorate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-800 text-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="">اختر المحافظة</option>
                    {governorates.map((gov) => (
                      <option key={gov} value={gov}>
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className=" text-gray-200 mb-2 font-medium flex items-center gap-2">
                    <FaHome className="text-blue-500" />
                    المدينة
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        city: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 text-white bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="مثال: مدينة نصر - المعادي - المهندسين..."
                  />
                </div>

                {/* الشارع */}
                <div>
                  <label className=" text-gray-200 mb-2 font-medium flex items-center gap-2">
                    <FaMapMarkerAlt className="text-blue-500" />
                    الشارع
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.street}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        street: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 text-white bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="اسم الشارع"
                  />
                </div>

                {/* الشقة أو المبنى (اختياري) */}
                <div>
                  <label className=" text-gray-200 mb-2 font-medium flex items-center gap-2">
                    <FaBuilding className="text-blue-500" />
                    الشقة أو المبنى (اختياري)
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.building}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        building: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 text-white bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="الشقة، المبنى، الطابق"
                  />
                </div>

                {/* طريقة الدفع */}
                <div className="pt-4">
                  <label className="text-gray-200 mb-3 font-medium flex items-center gap-2">
                    <MdOutlineAttachMoney className="text-blue-500" />
                    اختر طريقة الدفع
                  </label>

                  <div className="space-y-3 ">
                    <label className="flex items-center justify-between bg-gray-800 p-4 border-2 rounded-xl cursor-pointer transition hover:border-blue-500 has-[:checked]:border-blue-600">
                      <div className="flex items-center gap-3 ">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-5 h-5 text-blue-600"
                        />
                        <FaMoneyBillWave className="text-green-600 text-xl" />
                        <div>
                          <p className="font-semibold text-gray-300">
                            الدفع عند الاستلام
                          </p>
                          <p className="text-sm text-gray-500">
                            ادفع نقداً عند استلام المنتج
                          </p>
                        </div>
                      </div>
                      <div className="text-green-600">
                        <FaCheckCircle className="opacity-0 peer-checked:opacity-100" />
                      </div>
                    </label>

                    <div className="p-4 bg-gray-800 rounded-xl">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <FiTruck />
                        <span>الشحن مجاني لجميع الطلبات</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>جاري المعالجة...</span>
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      <span>تأكيد الطلب</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-gray-800 rounded-2xl shadow-lg sticky top-24 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <FiPackage />
                  ملخص الطلب
                </h2>
              </div>

              <div className="p-6">
                {/* Products List */}
                <div className="space-y-3 max-h-80 overflow-auto mb-4">
                  {orderItems.map((item, idx) => (
                    <div
                      key={item.id || item.product || idx}
                      className="flex gap-3 pb-3 border-b last:border-0"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-300 line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-400">
                          الكمية: {item.quantity || 1}
                        </p>
                        <p className="text-yellow-600 font-bold">
                          {(item.price * (item.quantity || 1)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>إجمالي المنتج</span>
                    <span>{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>الشحن</span>
                    <span className="text-green-600">مجاني</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t mt-3">
                    <span className="text-lg font-bold text-gray-300">
                      الإجمالي
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      {totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <FaCheckCircle className="text-green-500" />
                    الدفع عند الاستلام متاح
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
