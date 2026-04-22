"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowRight, FaTrash } from "react-icons/fa";
import { FaLocationDot, FaPlus, FaMinus, FaTicket } from "react-icons/fa6";
import type { CartItem } from "@/types/client-api";
import { ApiClientError, getMyCart, removeCartItem, updateCartItemQuantity } from "@/utils/cart-client";
import { setReloadToast, showReloadToastIfAny } from "@/utils/toast";

const formatCurrency = (value: number): string => `${Math.max(0, Math.round(value)).toLocaleString("vi-VN")}đ`;

export default function CartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const loadCart = async () => {
    try {
      const data = await getMyCart();
      setCart(data.cart || []);
      setIsLoggedIn(true);
    } catch (error) {
      setCart([]);
      if (error instanceof ApiClientError && error.status === 401) {
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);
        setReloadToast("error", error instanceof Error ? error.message : "Không tải được giỏ hàng.");
        showReloadToastIfAny();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const subTotal = useMemo(() => {
    return cart.reduce((total, item) => total + Number((item.priceNew && item.priceNew > 0) ? item.priceNew : item.price || 0) * Number(item.quantity || 0), 0);
  }, [cart]);

  const taxAmount = useMemo(() => subTotal * 0.1, [subTotal]);
  const serviceFee = useMemo(() => subTotal * 0.05, [subTotal]);
  const totalAmount = useMemo(() => subTotal + taxAmount + serviceFee, [subTotal, taxAmount, serviceFee]);

  const handleQuantityChange = async (tourId: string, quantity: number) => {
    if (quantity < 1 || actionLoadingId) return;

    try {
      setActionLoadingId(tourId);
      const data = await updateCartItemQuantity(tourId, quantity);
      setCart(data.cart || []);
    } catch (error) {
      setReloadToast("error", error instanceof Error ? error.message : "Không thể cập nhật số lượng.");
      showReloadToastIfAny();
    } finally {
      setActionLoadingId("");
    }
  };

  const handleRemoveItem = async (tourId: string) => {
    if (actionLoadingId) return;

    try {
      setActionLoadingId(tourId);
      const data = await removeCartItem(tourId);
      setCart(data.cart || []);
      setReloadToast("success", "Đã xóa chuyến đi khỏi giỏ hàng.");
      showReloadToastIfAny();
    } catch (error) {
      setReloadToast("error", error instanceof Error ? error.message : "Không thể xóa chuyến đi.");
      showReloadToastIfAny();
    } finally {
      setActionLoadingId("");
    }
  };

  if (loading) {
    return <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto text-on-surface-variant">Đang tải giỏ hàng...</main>;
  }

  if (!isLoggedIn) {
    return (
      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-background font-headline mb-3">Giỏ hàng</h1>
        <p className="text-on-surface-variant font-medium mb-8">Bạn cần đăng nhập để xem và quản lý giỏ hàng của mình.</p>
        <button
          type="button"
          onClick={() => router.push(`/login?redirect=${encodeURIComponent("/cart")}`)}
          className="px-6 py-3 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary hover:text-on-primary transition-all active:scale-95"
        >
          Đăng nhập để tiếp tục
        </button>
      </main>
    );
  }

  return (
    <>
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-background font-headline mb-2">Giỏ hàng</h1>
          <p className="text-on-surface-variant font-medium">Xem và hoàn tất các trải nghiệm du lịch được chọn của bạn.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <section className="grow w-full space-y-6 lg:w-2/3">
            {cart.map((item) => {
              const quantity = Number(item.quantity || 1);
              const unitPrice = Number((item.priceNew && item.priceNew > 0) ? item.priceNew : item.price || 0);

              return (
                <div
                  key={item.tourId}
                  className="bg-surface-container-lowest rounded-lg overflow-hidden flex flex-col md:flex-row shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_24px_48px_-12px_rgba(17,24,39,0.08)] group transition-all duration-500"
                >
                  <div className="md:w-64 h-48 md:h-auto relative overflow-hidden shrink-0">
                    <img
                      alt={item.name || "Tour"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      src={item.avatar || "https://picsum.photos/800/500"}
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-primary shadow-sm">TOUR</div>
                  </div>

                  <div className="p-6 grow flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold font-headline text-on-background mb-1">{item.name || "Chuyến đi"}</h3>
                        <p className="text-sm text-on-surface-variant flex items-center gap-1 font-medium">
                          <FaLocationDot className="text-[18px] text-primary" />
                          {item.locationFromName || "Đang cập nhật điểm khởi hành"}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={actionLoadingId === item.tourId}
                        onClick={() => handleRemoveItem(item.tourId)}
                        className="text-outline hover:text-error transition-colors p-2 active:scale-90 duration-200 disabled:opacity-60"
                      >
                        <FaTrash />
                      </button>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between mt-8 gap-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">Giá mỗi người</span>
                        <span className="text-2xl font-black text-on-background">{formatCurrency(unitPrice)}</span>
                      </div>

                      <div className="flex items-center bg-surface-container rounded-full p-1 gap-4 self-start md:self-auto">
                        <button
                          type="button"
                          disabled={quantity <= 1 || actionLoadingId === item.tourId}
                          onClick={() => handleQuantityChange(item.tourId, quantity - 1)}
                          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-surface-container-lowest active:scale-90 transition-all text-on-surface disabled:opacity-50"
                        >
                          <FaMinus className="text-[20px]" />
                        </button>
                        <span className="font-bold text-lg min-w-6 text-center text-on-background">{quantity}</span>
                        <button
                          type="button"
                          disabled={actionLoadingId === item.tourId}
                          onClick={() => handleQuantityChange(item.tourId, quantity + 1)}
                          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-surface-container-lowest active:scale-90 transition-all text-on-surface disabled:opacity-50"
                        >
                          <FaPlus className="text-[20px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="p-12 rounded-lg border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center text-center bg-white/30 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => router.push("/tour")}
                className="px-6 py-3 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary hover:text-on-primary transition-all active:scale-95"
              >
                Thêm chuyến đi
              </button>
            </div>
          </section>

          <aside className="w-full lg:w-96 lg:sticky lg:top-32 shrink-0">
            <div className="bg-white rounded-lg p-8 shadow-[0_24px_48px_-12px_rgba(17,24,39,0.08)] border border-outline-variant/10">
              <h2 className="text-2xl font-bold font-headline mb-8 border-b border-surface-container-high pb-4">Tổng cộng</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-on-surface-variant font-medium">
                  <span>Giá gốc</span>
                  <span className="text-on-surface">{formatCurrency(subTotal)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant font-medium">
                  <span>Thuế (10%)</span>
                  <span className="text-on-surface">{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant font-medium">
                  <span>Phí dịch vụ (5%)</span>
                  <span className="text-on-surface">{formatCurrency(serviceFee)}</span>
                </div>
                <div className="pt-6 mt-4 border-t border-surface-container-high">
                  <div className="flex justify-end items-center">
                    <span className="text-3xl font-black text-primary">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="mb-8 p-1 bg-surface-container rounded-full flex items-center justify-between border border-outline-variant/20">
                <div className="flex items-center gap-3 pl-4">
                  <FaTicket className=" text-primary text-[20px]" />
                  <input
                    className="bg-transparent border-none focus:ring-0 text-sm font-bold text-on-surface-variant w-24 placeholder:text-on-surface-variant/50 p-0"
                    placeholder="Mã khuyến mãi"
                    type="text"
                  />
                </div>
                <button
                  type="button"
                  className="bg-white text-primary font-black text-xs uppercase tracking-wider px-6 py-3 rounded-full shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-colors"
                >
                  Áp dụng
                </button>
              </div>

              <button
                type="button"
                disabled={cart.length === 0}
                onClick={() => router.push("/checkout")}
                className="w-full py-5 rounded-full bg-linear-to-br from-primary to-primary-dim text-on-primary font-black text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Tiến hành thanh toán
                <FaArrowRight className="material-symbols-outlined" />
              </button>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
