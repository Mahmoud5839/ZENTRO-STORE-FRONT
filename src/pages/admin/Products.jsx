import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiDollarSign,
  FiTrendingUp,
  FiPackage,
  FiShoppingBag,
} from "react-icons/fi";
// import { toast } from "react-toastify";
import api from "../../services/api";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    costPrice: "",
    description: "",
    category: "",
    countInStock: "",
    images: [],
  });
  const [imageUrls, setImageUrls] = useState([""]);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("api/products");
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      // toast.error(" فشل في تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: Number(formData.price),
        costPrice: Number(formData.costPrice),
        countInStock: Number(formData.countInStock),
        images: imageUrls.filter((url) => url.trim() !== ""),
        image: imageUrls[0] || "",
      };

      if (editingProduct) {
        await api.put(`api/products/${editingProduct._id}`, productData);
        // toast.success(" تم تحديث المنتج بنجاح");
        console.log("Product updated successfully");
      } else {
        await api.post("api/products", productData);
        // toast.success(" تم إضافة المنتج بنجاح");
        console.log("Product add successfully");
      }

      fetchProducts();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
      // toast.error(" فشل في حفظ المنتج");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      try {
        await api.delete(`api/products/${id}`);
        fetchProducts();
        // toast.success(" تم حذف المنتج بنجاح");
        alert(" تم حذف المنتج بنجاح");
      } catch (error) {
        console.error("Error deleting product:", error);
        // toast.error(" فشل في حذف المنتج");
        alert(" فشل في حذف المنتج");
      }
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      price: "",
      costPrice: "",
      description: "",
      category: "",
      countInStock: "",
      images: [],
    });
    setImageUrls([""]);
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      costPrice: product.costPrice || 0,
      description: product.description,
      category: product.category,
      countInStock: product.countInStock,
      images: product.images || [],
    });
    setImageUrls(product.images?.length ? product.images : [""]);
    setShowModal(true);
  };

  const addImageUrl = () => {
    setImageUrls([...imageUrls, ""]);
  };

  const updateImageUrl = (index, value) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const removeImageUrl = (index) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  // حساب إجمالي الأرباح المتوقعة
  const totalCostPrice = products.reduce(
    (sum, p) => sum + (p.costPrice || 0) * p.countInStock,
    0,
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-500">
            {" "}
            إدارة المنتجات
          </h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-800 transition flex items-center gap-2"
          >
            <FiPlus />
            <span>إضافة منتج</span>
          </button>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">إجمالي المنتجات</p>
                <p className="text-2xl font-bold text-white">
                  {products.length}
                </p>
              </div>
              <FiPackage className="text-3xl text-blue-500" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">إجمالي المخزون</p>
                <p className="text-2xl font-bold text-white">
                  {products.reduce((sum, p) => sum + p.countInStock, 0)}
                </p>
              </div>
              <FiPackage className="text-3xl text-green-500" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">قيمة المخزون </p>
                <p className="text-2xl font-bold text-green-400">
                  {totalCostPrice.toFixed(2)}
                </p>
              </div>
              <FiShoppingBag className="text-3xl text-green-500" />
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-3 text-right text-xs font-medium text-gray-300 uppercase">
                    الصورة
                  </th>
                  <th className="p-3 text-right text-xs font-medium text-gray-300 uppercase">
                    المنتج
                  </th>
                  <th className="p-3 text-center text-xs font-medium text-gray-300 uppercase">
                    سعر الشراء
                  </th>
                  <th className="p-3 text-center text-xs font-medium text-gray-300 uppercase">
                    سعر البيع
                  </th>
                  <th className="p-3 text-center text-xs font-medium text-gray-300 uppercase">
                    الربح
                  </th>
                  <th className="p-3 text-center text-xs font-medium text-gray-300 uppercase">
                    المخزون
                  </th>
                  <th className="p-3 text-center text-xs font-medium text-gray-300 uppercase">
                    العمليات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {products.map((product) => {
                  const profit = product.price - (product.costPrice || 0);
                  return (
                    <tr key={product._id} className="hover:bg-gray-700">
                      <td className="p-3">
                        <img
                          src={
                            product.images?.[0] ||
                            product.image ||
                            "https://via.placeholder.com/50"
                          }
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </td>
                      <td className="p-3 text-gray-300">{product.name}</td>
                      <td className="p-3 text-center text-gray-300">
                        {(product.costPrice || 0).toFixed(2)}
                      </td>
                      <td className="p-3 text-center text-gray-300">
                        {product.price.toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`font-semibold ${profit > 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {profit.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-3 text-center text-gray-300">
                        {product.countInStock}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => editProduct(product)}
                            className="text-blue-400 hover:text-blue-300"
                            title="تعديل"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="text-red-400 hover:text-red-300"
                            title="حذف"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for Add/Edit Product */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg  h-full overflow-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-white text-right">
                {editingProduct ? " تعديل منتج" : " إضافة منتج جديد"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2 text-right">
                    الاسم
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-right"
                    placeholder="أدخل اسم المنتج"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2 text-right">
                      سعر التكلفة
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.costPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, costPrice: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-right"
                      placeholder="سعر التكلفة"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2 text-right">
                      سعر البيع
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-right"
                      placeholder="سعر البيع"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-right">
                    المخزون
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.countInStock}
                    onChange={(e) =>
                      setFormData({ ...formData, countInStock: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-right"
                    placeholder="الكمية المتاحة"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-right">
                    القسم
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-right"
                    placeholder="مثال: إلكترونيات, ملابس, كتب..."
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-right">
                    الوصف
                  </label>
                  <textarea
                    required
                    rows="4"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-right"
                    placeholder="أدخل وصف المنتج بالتفصيل..."
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-right">
                    📸 صور المنتج
                  </label>
                  {imageUrls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updateImageUrl(index, e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-right"
                        placeholder="https://example.com/image.jpg"
                      />
                      {imageUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageUrl(index)}
                          className="text-red-400 hover:text-red-300 p-2"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-2"
                  >
                    <span> إضافة صورة أخرى</span>
                  </button>
                </div>

                <div className="flex justify-start gap-3 pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition text-gray-300"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingProduct ? "تحديث" : "إضافة"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
