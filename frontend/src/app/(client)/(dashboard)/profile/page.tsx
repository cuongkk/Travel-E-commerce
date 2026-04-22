"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import type { ApiResponse, AuthMeData, ClientAccountProfile } from "@/types/client-api";
import { setReloadToast, showReloadToastIfAny } from "@/utils/toast";

registerPlugin(FilePondPluginFileValidateType, FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

type ProfileFormState = {
  fullName: string;
  phone: string;
  avatar: string;
};

type ChangePasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type FilePondLikeFile = {
  source?: string;
  file?: File;
  options?: {
    type?: string;
  };
};

const toFormState = (account: ClientAccountProfile): ProfileFormState => ({
  fullName: account.fullName || "",
  phone: account.phone || "",
  avatar: account.avatar || "",
});

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [needLogin, setNeedLogin] = useState(false);
  const [account, setAccount] = useState<ClientAccountProfile | null>(null);
  const [formState, setFormState] = useState<ProfileFormState>({
    fullName: "",
    phone: "",
    avatar: "",
  });
  const [avatarFiles, setAvatarFiles] = useState<FilePondLikeFile[]>([]);
  const [payAmount, setPayAmount] = useState("");
  const [passwordState, setPasswordState] = useState<ChangePasswordFormState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const payload = (await response.json()) as ApiResponse<AuthMeData>;

        if (response.status === 401) {
          setNeedLogin(true);
          return;
        }

        if (!response.ok || payload.success !== true || !payload.data?.account) {
          setReloadToast("error", payload.message || "Không thể tải thông tin người dùng.");
          showReloadToastIfAny();
          return;
        }

        setAccount(payload.data.account);
        setFormState(toFormState(payload.data.account));
        if (payload.data.account.avatar) {
          setAvatarFiles([
            {
              source: payload.data.account.avatar,
              options: { type: "local" },
            },
          ]);
        }
      } catch {
        setReloadToast("error", "Lỗi kết nối. Vui lòng thử lại.");
        showReloadToastIfAny();
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const onChange = (field: keyof ProfileFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const onPasswordChange = (field: keyof ChangePasswordFormState, value: string) => {
    setPasswordState((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSavingProfile) return;

    if (!formState.fullName.trim()) {
      setReloadToast("error", "Họ và tên không được để trống.");
      showReloadToastIfAny();
      return;
    }

    try {
      setIsSavingProfile(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fullName: formState.fullName.trim(),
          phone: formState.phone.trim(),
          avatar: formState.avatar.trim(),
        }),
      });

      const payload = (await response.json()) as ApiResponse<AuthMeData>;

      if (response.status === 401) {
        setNeedLogin(true);
        return;
      }

      if (!response.ok || payload.success !== true || !payload.data?.account) {
        setReloadToast("error", payload.message || "Cập nhật thông tin thất bại.");
        showReloadToastIfAny();
        return;
      }

      setAccount(payload.data.account);
      setFormState(toFormState(payload.data.account));
      setReloadToast("success", payload.message || "Cập nhật thông tin thành công.");
      showReloadToastIfAny();
      router.refresh();
    } catch {
      setReloadToast("error", "Lỗi kết nối. Vui lòng thử lại.");
      showReloadToastIfAny();
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isChangingPassword) return;

    if (!passwordState.currentPassword || !passwordState.newPassword || !passwordState.confirmPassword) {
      setReloadToast("error", "Vui lòng nhập đầy đủ thông tin đổi mật khẩu.");
      showReloadToastIfAny();
      return;
    }

    if (passwordState.newPassword.length < 6) {
      setReloadToast("error", "Mật khẩu mới phải có ít nhất 6 ký tự.");
      showReloadToastIfAny();
      return;
    }

    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setReloadToast("error", "Xác nhận mật khẩu mới không khớp.");
      showReloadToastIfAny();
      return;
    }

    try {
      setIsChangingPassword(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(passwordState),
      });

      const payload = (await response.json()) as ApiResponse<{ ok: boolean }>;

      if (response.status === 401) {
        setNeedLogin(true);
        return;
      }

      if (!response.ok || payload.success !== true) {
        setReloadToast("error", payload.message || "Đổi mật khẩu thất bại.");
        showReloadToastIfAny();
        return;
      }

      setPasswordState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setReloadToast("success", payload.message || "Đổi mật khẩu thành công.");
      showReloadToastIfAny();
    } catch {
      setReloadToast("error", "Lỗi kết nối. Vui lòng thử lại.");
      showReloadToastIfAny();
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleWalletPaySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPaying) return;

    const amount = Number(payAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setReloadToast("error", "Vui lòng nhập số tiền thanh toán hợp lệ.");
      showReloadToastIfAny();
      return;
    }

    try {
      setIsPaying(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/wallet/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ amount }),
      });

      const payload = (await response.json()) as ApiResponse<{ balance: number; paidAmount: number; transactionCode: string }>;

      if (response.status === 401) {
        setNeedLogin(true);
        return;
      }

      if (!response.ok || payload.success !== true || !payload.data) {
        setReloadToast("error", payload.message || "Thanh toán thất bại.");
        showReloadToastIfAny();
        return;
      }

      setAccount((prev) => (prev ? { ...prev, walletBalance: payload.data?.balance || 0 } : prev));
      setPayAmount("");
      setReloadToast("success", `${payload.message || "Thanh toán thành công"} (${payload.data.transactionCode})`);
      showReloadToastIfAny();
    } catch {
      setReloadToast("error", "Lỗi kết nối. Vui lòng thử lại.");
      showReloadToastIfAny();
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-32">
        <div className="rounded-2xl border border-outline-variant/20 bg-surface p-6">Đang tải thông tin tài khoản...</div>
      </section>
    );
  }

  if (needLogin) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-32">
        <div className="rounded-2xl border border-outline-variant/20 bg-surface p-6 space-y-4">
          <h1 className="text-2xl font-bold text-on-surface">Bạn cần đăng nhập</h1>
          <p className="text-on-surface-variant">Vui lòng đăng nhập để quản lý thông tin cá nhân.</p>
          <Link href="/login?redirect=/profile" className="inline-flex items-center rounded-full bg-primary px-5 py-2 font-semibold text-on-primary">
            Đến trang đăng nhập
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-28 md:py-32">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-on-surface font-headline">Quản lý thông tin cá nhân</h1>
          <p className="text-on-surface-variant">Cập nhật hồ sơ, thanh toán bằng số dư tài khoản và đổi mật khẩu.</p>
        </div>
        <Link href="/profile/wishlist" className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-full font-semibold transition-colors">
          <span>Wishlist</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </Link>
      </div>
      
      {/* Mobile Wishlist Button */}
      <div className="mb-6 md:hidden">
        <Link href="/profile/wishlist" className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl font-bold transition-colors">
          <span>Danh sách yêu thích</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </Link>
      </div>

      <div className="rounded-2xl border border-outline-variant/20 bg-surface p-5 md:p-8 shadow-sm mb-8">
        <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 gap-5">
          <h2 className="text-xl font-bold text-on-surface">Thông tin cá nhân</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-on-surface">Họ và tên</span>
              <input
                value={formState.fullName}
                onChange={(event) => onChange("fullName", event.target.value)}
                className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 outline-none focus:border-primary"
                type="text"
                autoComplete="name"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-on-surface">Số điện thoại</span>
              <input
                value={formState.phone}
                onChange={(event) => onChange("phone", event.target.value)}
                className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 outline-none focus:border-primary"
                type="text"
                autoComplete="tel"
              />
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-on-surface">Email</span>
            <input
              value={account?.email || ""}
              className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-on-surface-variant"
              type="email"
              readOnly
              disabled
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-on-surface">Ảnh đại diện</span>
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3">
              <FilePond
                files={avatarFiles as any}
                onupdatefiles={(items) => setAvatarFiles(items as any)}
                allowMultiple={false}
                acceptedFileTypes={["image/*"]}
                name="avatar"
                instantUpload
                labelIdle='Kéo thả ảnh hoặc <span class="filepond--label-action">Chọn ảnh</span>'
                server={{
                  process: (_fieldName: string, file: Blob, _metadata: any, load: any, error: any, _progress: any, abort: any) => {
                    const controller = new AbortController();
                    const formData = new FormData();
                    formData.append("avatar", file, (file as File).name || "avatar.jpg");
                    setIsUploadingAvatar(true);

                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/avatar/upload`, {
                      method: "POST",
                      credentials: "include",
                      body: formData,
                      signal: controller.signal,
                    })
                      .then(async (response) => {
                        const payload = (await response.json()) as ApiResponse<{ avatar: string; account: ClientAccountProfile }>;

                        if (!response.ok || payload.success !== true || !payload.data?.avatar) {
                          throw new Error(payload.message || "Upload ảnh thất bại.");
                        }

                        onChange("avatar", payload.data.avatar);
                        setAccount((prev) => (prev ? { ...prev, avatar: payload.data?.avatar || "" } : prev));
                        load(payload.data.avatar);
                        setReloadToast("success", payload.message || "Tải ảnh đại diện thành công.");
                        showReloadToastIfAny();
                      })
                      .catch((uploadErr: unknown) => {
                        error(uploadErr instanceof Error ? uploadErr.message : "Upload thất bại.");
                      })
                      .finally(() => {
                        setIsUploadingAvatar(false);
                      });

                    return {
                      abort: () => {
                        controller.abort();
                        abort();
                      },
                    };
                  },
                }}
              />
              {formState.avatar ? <p className="mt-2 text-xs text-on-surface-variant break-all">{formState.avatar}</p> : null}
            </div>
            {isUploadingAvatar ? <p className="text-xs text-on-surface-variant">Đang tải ảnh lên...</p> : null}
          </label>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="inline-flex items-center rounded-full bg-primary px-6 py-3 font-bold text-on-primary transition-transform active:scale-95 disabled:opacity-70"
            >
              {isSavingProfile ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-outline-variant/20 bg-surface p-5 md:p-8 shadow-sm mb-8">
        <h2 className="text-xl font-bold text-on-surface mb-2">Số dư tài khoản</h2>
        <p className="text-3xl font-extrabold text-primary mb-5">{Number(account?.walletBalance || 0).toLocaleString("vi-VN")} đ</p>

        <form onSubmit={handleWalletPaySubmit} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-on-surface">Số tiền cần thanh toán</span>
            <input
              value={payAmount}
              onChange={(event) => setPayAmount(event.target.value)}
              className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 outline-none focus:border-primary"
              type="number"
              min="1"
              step="0.01"
              placeholder="Nhập số tiền"
            />
          </label>

          <button
            type="submit"
            disabled={isPaying}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-bold text-on-primary transition-transform active:scale-95 disabled:opacity-70"
          >
            {isPaying ? "Đang thanh toán..." : "Thanh toán"}
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-outline-variant/20 bg-surface p-5 md:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-on-surface mb-4">Đổi mật khẩu</h2>

        <form onSubmit={handleChangePasswordSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-on-surface">Mật khẩu hiện tại</span>
            <input
              value={passwordState.currentPassword}
              onChange={(event) => onPasswordChange("currentPassword", event.target.value)}
              className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 outline-none focus:border-primary"
              type="password"
              autoComplete="current-password"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-on-surface">Mật khẩu mới</span>
            <input
              value={passwordState.newPassword}
              onChange={(event) => onPasswordChange("newPassword", event.target.value)}
              className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 outline-none focus:border-primary"
              type="password"
              autoComplete="new-password"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-on-surface">Xác nhận mật khẩu mới</span>
            <input
              value={passwordState.confirmPassword}
              onChange={(event) => onPasswordChange("confirmPassword", event.target.value)}
              className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 outline-none focus:border-primary"
              type="password"
              autoComplete="new-password"
            />
          </label>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="inline-flex items-center rounded-full bg-secondary px-6 py-3 font-bold text-on-secondary transition-transform active:scale-95 disabled:opacity-70"
            >
              {isChangingPassword ? "Đang cập nhật..." : "Đổi mật khẩu"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
