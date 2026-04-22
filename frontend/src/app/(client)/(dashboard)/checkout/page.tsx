"use client";

import { useEffect, useState } from "react";
import { FaCalendar, FaCreditCard, FaMoneyBill, FaUser, FaRegCommentDots } from "react-icons/fa";
import { FaShield, FaUserGroup } from "react-icons/fa6";
import { getMyCart } from "@/utils/cart-client";
import type { CartItem, CartSummary } from "@/types/client-api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/utils/api-client";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(null);
  const [applyingVoucher, setApplyingVoucher] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    note: "",
    paymentMethod: "zalopay",
  });

  useEffect(() => {
    const loadCart = async () => {
      try {
        const data = await getMyCart();
        setCart(data.cart);
        setSummary(data.summary);
      } catch (error) {
        console.error("Load cart error:", error);
        toast.error("Không thể tải thông tin giỏ hàng.");
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (method: string) => {
    setFormData((prev) => ({ ...prev, paymentMethod: method }));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + ((item.priceNew && item.priceNew > 0) ? item.priceNew : item.price || 0) * item.quantity, 0);
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }

    setApplyingVoucher(true);
    try {
      const response = await fetch(`${API_BASE_URL}/voucher-client/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: voucherCode.trim(), cartTotal: calculateSubtotal() }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Mã giảm giá không hợp lệ");
      }

      setAppliedVoucher({ code: data.data.voucherCode, discount: data.data.discount });
      toast.success(data.message);
    } catch (err: any) {
      toast.error(err.message);
      setAppliedVoucher(null);
    } finally {
      setApplyingVoucher(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error("Vui lòng điền đầy đủ thông tin liên hệ.");
      return;
    }

    if (cart.length === 0) {
      toast.error("Giỏ hàng của bạn đang trống.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Tạo đơn hàng
      const orderRes = await fetch(`${API_BASE_URL}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          email: formData.email,
          note: formData.note,
          paymentMethod: formData.paymentMethod,
          voucherCode: appliedVoucher?.code,
        }),
        credentials: "include",
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.message || "Lỗi khi tạo đơn hàng.");
      }

      const orderId = orderData.data._id;

      // 2. Xử lý thanh toán ZaloPay nếu chọn
      if (formData.paymentMethod === "zalopay") {
        const paymentRes = await fetch(`${API_BASE_URL}/payment/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
          credentials: "include",
        });

        const paymentData = await paymentRes.json();
        if (!paymentRes.ok || !paymentData.success) {
          throw new Error(paymentData.message || "Lỗi khi khởi tạo thanh toán ZaloPay.");
        }

        toast.success("Đang chuyển hướng đến cổng thanh toán ZaloPay...");
        window.location.href = paymentData.data.order_url;
      } else if (formData.paymentMethod === "momo") {
        const paymentRes = await fetch(`${API_BASE_URL}/payment/create-momo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
          credentials: "include",
        });

        const paymentData = await paymentRes.json();
        if (!paymentRes.ok || !paymentData.success) {
          throw new Error(paymentData.message || "Lỗi khi khởi tạo thanh toán MoMo.");
        }

        toast.success("Đang chuyển hướng đến cổng thanh toán MoMo...");
        window.location.href = paymentData.data.payUrl;
      } else {
        // Các phương thức khác
        toast.success("Đặt hàng thành công! Chúng tôi sẽ liên hệ sớm.");
        // router.push("/profile/orders"); // Hoặc trang nào đó
      }
    } catch (error: any) {
      toast.error(error.message || "Đã xảy ra lỗi trong quá trình đặt hàng.");
    } finally {
      setSubmitting(false);
    }
  };

  const subtotal = calculateSubtotal();
  const discount = appliedVoucher ? appliedVoucher.discount : 0;
  const total = subtotal - discount;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <main className="max-w-screen-2xl mx-auto px-6 md:px-12 py-10 lg:py-20 w-full">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 xl:gap-20">
          {/* Form Side */}
          <div className="lg:col-span-7 space-y-12">
            <section>
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-3">Hoàn tất hành trình của bạn</h1>
              <p className="text-on-surface-variant font-body text-lg">Kiểm tra thông tin và đảm bảo chỗ cho chuyến đi tuyệt vời của bạn.</p>
            </section>

            {/* Section 1: Contact Information */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <FaUser className="text-primary" />
                <h2 className="font-headline text-xl font-bold tracking-tight">Thông tin liên hệ</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container-low/40 p-6 md:p-10 rounded-lg">
                <div className="space-y-2 group">
                  <label className="font-label text-[0.75rem] uppercase tracking-widest text-on-surface-variant ml-1 font-bold">Tên</label>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-lowest border-none rounded-full px-6 py-4 focus:ring-2 focus:ring-primary/20 text-on-surface transition-all outline-none"
                    placeholder="VD: Hải"
                    type="text"
                  />
                </div>
                <div className="space-y-2 group">
                  <label className="font-label text-[0.75rem] uppercase tracking-widest text-on-surface-variant ml-1 font-bold">Họ</label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-lowest border-none rounded-full px-6 py-4 focus:ring-2 focus:ring-primary/20 text-on-surface transition-all outline-none"
                    placeholder="VD: Nguyễn Văn"
                    type="text"
                  />
                </div>
                <div className="md:col-span-2 space-y-2 group">
                  <label className="font-label text-[0.75rem] uppercase tracking-widest text-on-surface-variant ml-1 font-bold">Địa chỉ Email</label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-lowest border-none rounded-full px-6 py-4 focus:ring-2 focus:ring-primary/20 text-on-surface transition-all outline-none"
                    placeholder="alex@travelka.com"
                    type="email"
                  />
                </div>
                <div className="md:col-span-2 space-y-2 group">
                  <label className="font-label text-[0.75rem] uppercase tracking-widest text-on-surface-variant ml-1 font-bold">Số điện thoại</label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-lowest border-none rounded-full px-6 py-4 focus:ring-2 focus:ring-primary/20 text-on-surface transition-all outline-none"
                    placeholder="+84 901 234 567"
                    type="tel"
                  />
                </div>
                <div className="md:col-span-2 space-y-2 group">
                  <label className="font-label text-[0.75rem] uppercase tracking-widest text-on-surface-variant ml-1 font-bold">Ghi chú thêm</label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full bg-surface-container-lowest border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 text-on-surface transition-all outline-none resize-none"
                    placeholder="Ghi chú thêm về yêu cầu của bạn..."
                  />
                </div>
              </div>
            </section>

            {/* Section 2: Payment Method */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <FaMoneyBill className="text-primary" />
                <h2 className="font-headline text-xl font-bold tracking-tight">Phương thức thanh toán</h2>
              </div>
              <div className="grid grid-cols-1 gap-5">
                {/* ZaloPay */}
                <label className={`relative flex items-center justify-between p-6 rounded-lg cursor-pointer transition-all shadow-sm border ${formData.paymentMethod === 'zalopay' ? 'bg-blue-50 border-blue-200' : 'bg-surface-container-lowest border-transparent hover:bg-surface-container-low'}`}>
                  <input className="hidden" name="payment" type="radio" checked={formData.paymentMethod === 'zalopay'} onChange={() => handlePaymentChange('zalopay')} />
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-[#008fe5] rounded flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">ZaloPay</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-on-surface">Ví điện tử ZaloPay</span>
                      <span className="text-xs text-on-surface-variant">Thanh toán nhanh chóng, an toàn qua ZaloPay</span>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.paymentMethod === 'zalopay' ? 'border-primary bg-primary' : 'border-outline-variant'}`}>
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </label>

                {/* MoMo */}
                <label className={`relative flex items-center justify-between p-6 rounded-lg cursor-pointer transition-all shadow-sm border ${formData.paymentMethod === 'momo' ? 'bg-pink-50 border-pink-200' : 'bg-surface-container-lowest border-transparent hover:bg-surface-container-low'}`}>
                  <input className="hidden" name="payment" type="radio" checked={formData.paymentMethod === 'momo'} onChange={() => handlePaymentChange('momo')} />
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-[#A50064] rounded flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">MoMo</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-on-surface">Ví điện tử MoMo</span>
                      <span className="text-xs text-on-surface-variant">Thanh toán qua ứng dụng MoMo</span>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.paymentMethod === 'momo' ? 'border-primary bg-primary' : 'border-outline-variant'}`}>
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </label>

                {/* Money */}
                <label className={`relative flex items-center justify-between p-6 rounded-lg cursor-pointer transition-all shadow-sm border ${formData.paymentMethod === 'money' ? 'bg-green-50 border-green-200' : 'bg-surface-container-lowest border-transparent hover:bg-surface-container-low'}`}>
                  <input className="hidden" name="payment" type="radio" checked={formData.paymentMethod === 'money'} onChange={() => handlePaymentChange('money')} />
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center">
                      <FaMoneyBill className="text-white text-lg" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-on-surface">Tiền mặt</span>
                      <span className="text-xs text-on-surface-variant">Thanh toán khi hoàn thành dịch vụ</span>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.paymentMethod === 'money' ? 'border-primary bg-primary' : 'border-outline-variant'}`}>
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </label>

                {/* Bank */}
                <label className={`relative flex items-center justify-between p-6 rounded-lg cursor-pointer transition-all shadow-sm border ${formData.paymentMethod === 'bank' ? 'bg-orange-50 border-orange-200' : 'bg-surface-container-lowest border-transparent hover:bg-surface-container-low'}`}>
                  <input className="hidden" name="payment" type="radio" checked={formData.paymentMethod === 'bank'} onChange={() => handlePaymentChange('bank')} />
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-orange-500 rounded flex items-center justify-center">
                      <FaCreditCard className="text-white text-lg" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-on-surface">Chuyển khoản ngân hàng</span>
                      <span className="text-xs text-on-surface-variant">Chuyển khoản qua số tài khoản</span>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.paymentMethod === 'bank' ? 'border-primary bg-primary' : 'border-outline-variant'}`}>
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Sticky Order Summary Side */}
          <aside className="lg:col-span-5">
            <div className="sticky top-32 space-y-8">
              <div className="bg-surface-container-lowest rounded-lg p-8 shadow-[0_32px_64px_-16px_rgba(0,107,17,0.1)] overflow-hidden relative border border-primary/5">
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
                <h2 className="font-headline text-2xl font-extrabold tracking-tight mb-8">Tóm tắt đơn hàng</h2>

                <div className="space-y-6 mb-10 overflow-auto max-h-[400px] pr-2">
                  {cart.map((item, index) => (
                    <div key={index} className="flex gap-4 group items-center">
                      <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                        <img
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          src={item.avatar || "https://images.unsplash.com/photo-1528127269322-539801943592?ixlib=rb-1.2.1-auto=format&fit=crop&w=800&q=80"}
                        />
                      </div>
                      <div className="flex flex-col justify-center flex-1">
                        <h3 className="font-bold text-sm leading-tight text-on-surface line-clamp-1">{item.name}</h3>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-on-surface-variant">Số lượng: {item.quantity}</span>
                          <span className="font-bold text-primary text-sm">${(((item.priceNew && item.priceNew > 0) ? item.priceNew : item.price || 0) * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 border-t border-outline-variant/15 pt-8">
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant font-medium">Tạm tính</span>
                    <span className="font-bold text-on-surface">${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span className="font-medium">Giảm giá ({appliedVoucher?.code})</span>
                      <span className="font-bold">-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant font-medium">Phí dịch vụ</span>
                    <span className="font-bold text-primary italic">Miễn phí</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-outline-variant/15 space-y-3">
                  <span className="text-on-surface-variant font-medium text-sm">Mã giảm giá</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      placeholder="Nhập mã giảm giá"
                      className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-3 text-sm focus:border-primary outline-none transition-colors uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyVoucher}
                      disabled={applyingVoucher || !voucherCode.trim()}
                      className="bg-primary/10 text-primary font-bold px-6 py-3 rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t-2 border-dashed border-outline-variant/20">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="font-label text-[0.75rem] uppercase tracking-widest text-on-surface-variant font-bold">Tổng thanh toán</span>
                      <div className="text-4xl font-plus-jakarta font-extrabold text-on-surface mt-1">${total.toFixed(2)}</div>
                    </div>
                    <div className="text-primary text-[0.65rem] font-black bg-primary-container px-4 py-2 rounded-full tracking-widest uppercase">GIÁ TỐT NHẤT</div>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || cart.length === 0}
                  className="w-full mt-10 bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold py-6 rounded-full hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:translate-y-0"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-on-primary"></div>
                  ) : (
                    <>
                      <FaShield />
                      Xác nhận đặt chỗ
                    </>
                  )}
                </button>
                <p className="text-center text-[0.7rem] text-on-surface-variant mt-6 font-inter leading-relaxed max-w-xs mx-auto">
                  Bằng việc Xác nhận đặt chỗ, bạn đồng ý với{" "}
                  <a className="underline font-bold text-on-surface hover:text-primary" href="#">
                    Điều khoản dịch vụ
                  </a>{" "}
                  và{" "}
                  <a className="underline font-bold text-on-surface hover:text-primary" href="#">
                    Chính sách hủy
                  </a>
                  {" "}của chúng tôi.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
