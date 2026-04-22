"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refresh = exports.toggleWishlist = exports.getWishlist = exports.walletPay = exports.getWalletBalance = exports.uploadMyAvatar = exports.changePassword = exports.updateMe = exports.getMe = exports.resetPassword = exports.verifyOtp = exports.forgotPassword = exports.register = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const slugify_1 = __importDefault(require("slugify"));
const account_model_1 = __importDefault(require("./account.model"));
const forgot_password_model_1 = __importDefault(require("./forgot-password.model"));
const tour_model_1 = __importDefault(require("../tour/tour.model"));
const generate_helper_1 = require("../../utils/generate.helper");
const mail_helper_1 = require("../../utils/mail.helper");
const auth_tokens_1 = require("./auth.tokens");
const error_middleware_1 = require("../../middlewares/error.middleware");
const serializeAccount = (accountInput) => {
    var _a, _b;
    const account = (accountInput === null || accountInput === void 0 ? void 0 : accountInput.toObject) ? accountInput.toObject() : accountInput;
    return {
        id: ((_b = (_a = account === null || account === void 0 ? void 0 : account._id) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a)) || "",
        fullName: (account === null || account === void 0 ? void 0 : account.fullName) || "",
        email: (account === null || account === void 0 ? void 0 : account.email) || "",
        phone: (account === null || account === void 0 ? void 0 : account.phone) || "",
        avatar: (account === null || account === void 0 ? void 0 : account.avatar) || "",
        role: (account === null || account === void 0 ? void 0 : account.role) || "client",
        status: (account === null || account === void 0 ? void 0 : account.status) || "",
        walletBalance: Number((account === null || account === void 0 ? void 0 : account.walletBalance) || 0),
        wishlist: (account === null || account === void 0 ? void 0 : account.wishlist) || [],
        createdAt: account === null || account === void 0 ? void 0 : account.createdAt,
        updatedAt: account === null || account === void 0 ? void 0 : account.updatedAt,
    };
};
const login = async (req) => {
    const { email, password, rememberPassword } = req.body;
    const existAccount = await account_model_1.default.findOne({ email, deleted: false });
    if (!existAccount) {
        throw new error_middleware_1.HttpError(401, "Email không tồn tại trong hệ thống");
    }
    const isPasswordValid = await bcryptjs_1.default.compare(password, existAccount.password);
    if (!isPasswordValid) {
        throw new error_middleware_1.HttpError(401, "Mật khẩu không đúng");
    }
    if (existAccount.status === "initial") {
        throw new error_middleware_1.HttpError(403, "Tài khoản chưa được kích hoạt");
    }
    const userId = existAccount._id.toString();
    const userType = (existAccount.role || "client").toLowerCase() === "admin" ? "admin" : "client";
    const accessToken = (0, auth_tokens_1.signAccessToken)({ sub: userId, userType });
    const jti = (0, auth_tokens_1.newJti)();
    const refreshToken = (0, auth_tokens_1.signRefreshToken)({ sub: userId, userType, jti }, Boolean(rememberPassword));
    const refreshTokenHash = await bcryptjs_1.default.hash(refreshToken, 10);
    await account_model_1.default.updateOne({ _id: existAccount._id }, {
        $set: {
            refreshTokenHash,
            refreshTokenJti: jti,
        },
    });
    return {
        accessToken,
        refreshToken,
        user: {
            id: userId,
            role: userType,
        },
    };
};
exports.login = login;
const register = async (req) => {
    const { fullName, email, password, ...rest } = req.body;
    const existAccount = await account_model_1.default.findOne({ email, deleted: false });
    if (existAccount) {
        throw new error_middleware_1.HttpError(409, "Email đã tồn tại, vui lòng sử dụng email khác");
    }
    const data = {
        ...rest,
        fullName,
        email,
        status: "active",
        role: rest.role || "client",
    };
    if (fullName) {
        data.slug = (0, slugify_1.default)(fullName, { lower: true, strict: true });
    }
    data.password = await bcryptjs_1.default.hash(password, 10);
    const newAccount = new account_model_1.default(data);
    await newAccount.save();
    return {
        id: newAccount._id.toString(),
    };
};
exports.register = register;
const forgotPassword = async (req) => {
    const { email } = req.body;
    const existAccount = await account_model_1.default.findOne({ email, status: "active" });
    if (!existAccount) {
        throw new error_middleware_1.HttpError(404, "Email không tồn tại trong hệ thống");
    }
    const existingOTP = await forgot_password_model_1.default.findOne({ email });
    if (existingOTP) {
        throw new error_middleware_1.HttpError(429, "Mã OTP đã được gửi. Vui lòng kiểm tra email của bạn.");
    }
    const otpCode = (0, generate_helper_1.generateRandomNumber)(6);
    const newRecord = new forgot_password_model_1.default({
        email,
        otp: otpCode,
        expireAt: new Date(Date.now() + 5 * 60 * 1000),
    });
    await newRecord.save();
    const subject = "Mã OTP đặt lại mật khẩu";
    const content = `Mã OTP của bạn là: <b>${otpCode}</b>. Mã có hiệu lực trong 5 phút.`;
    await (0, mail_helper_1.sendMail)(email, subject, content);
    return {
        ok: true,
    };
};
exports.forgotPassword = forgotPassword;
const verifyOtp = async (req) => {
    const { email, otp } = req.body;
    const existRecord = await forgot_password_model_1.default.findOne({ email, otp });
    if (!existRecord) {
        throw new error_middleware_1.HttpError(400, "Mã OTP không đúng hoặc đã hết hạn");
    }
    await forgot_password_model_1.default.deleteOne({ email, otp });
    const existAccount = await account_model_1.default.findOne({ email });
    if (!existAccount) {
        throw new error_middleware_1.HttpError(404, "Tài khoản không tồn tại");
    }
    // Issue a short-lived access token to allow password reset flow.
    const token = (0, auth_tokens_1.signAccessToken)({ sub: existAccount._id.toString(), userType: "admin" });
    return {
        token,
    };
};
exports.verifyOtp = verifyOtp;
const resetPassword = async (req) => {
    const { password } = req.body;
    const account = req.account;
    if (!account) {
        throw new error_middleware_1.HttpError(401, "Token không hợp lệ hoặc đã hết hạn");
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    await account_model_1.default.updateOne({ email: account.email }, { $set: { password: hashedPassword } });
    return {
        ok: true,
    };
};
exports.resetPassword = resetPassword;
const getMe = async (req) => {
    var _a;
    const accountFromMiddleware = req.account;
    if (accountFromMiddleware) {
        return {
            account: serializeAccount(accountFromMiddleware),
        };
    }
    const tokenFromHeader = ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.startsWith("Bearer ")) ? req.headers.authorization.split(" ")[1] : undefined;
    const token = tokenFromHeader;
    if (!token) {
        throw new error_middleware_1.HttpError(401, "Không tìm thấy token xác thực");
    }
    try {
        const decoded = (0, auth_tokens_1.verifyAccessToken)(token);
        const account = await account_model_1.default.findById(decoded.sub);
        if (!account) {
            throw new error_middleware_1.HttpError(404, "Tài khoản không tồn tại");
        }
        return {
            account: serializeAccount(account),
        };
    }
    catch (error) {
        throw new error_middleware_1.HttpError(401, "Token không hợp lệ hoặc đã hết hạn");
    }
};
exports.getMe = getMe;
const updateMe = async (req) => {
    const accountFromMiddleware = req.account;
    if (!(accountFromMiddleware === null || accountFromMiddleware === void 0 ? void 0 : accountFromMiddleware._id)) {
        throw new error_middleware_1.HttpError(401, "Bạn cần đăng nhập để cập nhật thông tin");
    }
    const { fullName, phone, avatar } = req.body;
    const updates = {};
    if (typeof fullName === "string") {
        const normalizedName = fullName.trim();
        if (!normalizedName) {
            throw new error_middleware_1.HttpError(400, "Họ và tên không hợp lệ");
        }
        updates.fullName = normalizedName;
        updates.slug = (0, slugify_1.default)(normalizedName, { lower: true, strict: true });
    }
    if (phone !== undefined) {
        updates.phone = typeof phone === "string" ? phone.trim() : "";
    }
    if (avatar !== undefined) {
        updates.avatar = typeof avatar === "string" ? avatar.trim() : "";
    }
    if (Object.keys(updates).length === 0) {
        throw new error_middleware_1.HttpError(400, "Không có dữ liệu để cập nhật");
    }
    const updatedAccount = await account_model_1.default.findByIdAndUpdate(accountFromMiddleware._id, { $set: updates }, { new: true });
    if (!updatedAccount) {
        throw new error_middleware_1.HttpError(404, "Tài khoản không tồn tại");
    }
    return {
        account: serializeAccount(updatedAccount),
    };
};
exports.updateMe = updateMe;
const changePassword = async (req) => {
    const accountFromMiddleware = req.account;
    if (!(accountFromMiddleware === null || accountFromMiddleware === void 0 ? void 0 : accountFromMiddleware._id)) {
        throw new error_middleware_1.HttpError(401, "Bạn cần đăng nhập để đổi mật khẩu");
    }
    const { currentPassword, newPassword } = req.body;
    if (currentPassword === newPassword) {
        throw new error_middleware_1.HttpError(400, "Mật khẩu mới phải khác mật khẩu hiện tại");
    }
    const account = await account_model_1.default.findById(accountFromMiddleware._id);
    if (!account) {
        throw new error_middleware_1.HttpError(404, "Tài khoản không tồn tại");
    }
    const isPasswordValid = await bcryptjs_1.default.compare(currentPassword, account.password);
    if (!isPasswordValid) {
        throw new error_middleware_1.HttpError(400, "Mật khẩu hiện tại không chính xác");
    }
    const newPasswordHash = await bcryptjs_1.default.hash(newPassword, 10);
    await account_model_1.default.updateOne({ _id: account._id }, {
        $set: {
            password: newPasswordHash,
        },
        $unset: {
            refreshTokenHash: "",
            refreshTokenJti: "",
        },
    });
    return {
        ok: true,
    };
};
exports.changePassword = changePassword;
const uploadMyAvatar = async (req) => {
    const accountFromMiddleware = req.account;
    if (!(accountFromMiddleware === null || accountFromMiddleware === void 0 ? void 0 : accountFromMiddleware._id)) {
        throw new error_middleware_1.HttpError(401, "Bạn cần đăng nhập để cập nhật ảnh đại diện");
    }
    const uploadedFile = req.file;
    const avatarUrl = (uploadedFile === null || uploadedFile === void 0 ? void 0 : uploadedFile.path) || (uploadedFile === null || uploadedFile === void 0 ? void 0 : uploadedFile.secure_url);
    if (!avatarUrl) {
        throw new error_middleware_1.HttpError(400, "Không tìm thấy tệp ảnh hợp lệ");
    }
    const updatedAccount = await account_model_1.default.findByIdAndUpdate(accountFromMiddleware._id, { $set: { avatar: String(avatarUrl).trim() } }, { new: true });
    if (!updatedAccount) {
        throw new error_middleware_1.HttpError(404, "Tài khoản không tồn tại");
    }
    return {
        avatar: updatedAccount.avatar || "",
        account: serializeAccount(updatedAccount),
    };
};
exports.uploadMyAvatar = uploadMyAvatar;
const getWalletBalance = async (req) => {
    const accountFromMiddleware = req.account;
    if (!(accountFromMiddleware === null || accountFromMiddleware === void 0 ? void 0 : accountFromMiddleware._id)) {
        throw new error_middleware_1.HttpError(401, "Bạn cần đăng nhập để xem số dư");
    }
    const account = await account_model_1.default.findById(accountFromMiddleware._id);
    if (!account) {
        throw new error_middleware_1.HttpError(404, "Tài khoản không tồn tại");
    }
    return {
        balance: Number(account.walletBalance || 0),
    };
};
exports.getWalletBalance = getWalletBalance;
const walletPay = async (req) => {
    const accountFromMiddleware = req.account;
    if (!(accountFromMiddleware === null || accountFromMiddleware === void 0 ? void 0 : accountFromMiddleware._id)) {
        throw new error_middleware_1.HttpError(401, "Bạn cần đăng nhập để thanh toán");
    }
    const { amount } = req.body;
    const normalizedAmount = Number(amount);
    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
        throw new error_middleware_1.HttpError(400, "Số tiền thanh toán không hợp lệ");
    }
    const account = await account_model_1.default.findById(accountFromMiddleware._id);
    if (!account) {
        throw new error_middleware_1.HttpError(404, "Tài khoản không tồn tại");
    }
    const currentBalance = Number(account.walletBalance || 0);
    if (currentBalance < normalizedAmount) {
        throw new error_middleware_1.HttpError(400, "Số dư không đủ để thanh toán");
    }
    const nextBalance = Number((currentBalance - normalizedAmount).toFixed(2));
    await account_model_1.default.updateOne({ _id: account._id }, { $set: { walletBalance: nextBalance } });
    return {
        paidAmount: normalizedAmount,
        balance: nextBalance,
        transactionCode: `PAY-${Date.now()}`,
    };
};
exports.walletPay = walletPay;
const getWishlist = async (req) => {
    const accountFromMiddleware = req.account;
    if (!(accountFromMiddleware === null || accountFromMiddleware === void 0 ? void 0 : accountFromMiddleware._id)) {
        throw new error_middleware_1.HttpError(401, "Bạn cần đăng nhập để xem danh sách yêu thích");
    }
    const account = await account_model_1.default.findById(accountFromMiddleware._id);
    if (!account)
        throw new error_middleware_1.HttpError(404, "Tài khoản không tồn tại");
    const wishlistIds = account.wishlist || [];
    const tours = await tour_model_1.default.find({
        _id: { $in: wishlistIds },
        deleted: false,
        status: "active"
    });
    return { wishlist: tours };
};
exports.getWishlist = getWishlist;
const toggleWishlist = async (req) => {
    const accountFromMiddleware = req.account;
    if (!(accountFromMiddleware === null || accountFromMiddleware === void 0 ? void 0 : accountFromMiddleware._id)) {
        throw new error_middleware_1.HttpError(401, "Bạn cần đăng nhập để thực hiện tác vụ này");
    }
    const { tourId } = req.body;
    if (!tourId)
        throw new error_middleware_1.HttpError(400, "Thiếu id của Tour");
    const tourInfo = await tour_model_1.default.findOne({ _id: tourId, deleted: false });
    if (!tourInfo)
        throw new error_middleware_1.HttpError(404, "Tour không tồn tại");
    const account = await account_model_1.default.findById(accountFromMiddleware._id);
    if (!account)
        throw new error_middleware_1.HttpError(404, "Tài khoản không tồn tại");
    let currentWishlist = account.wishlist || [];
    let action = "added";
    if (currentWishlist.includes(tourId)) {
        currentWishlist = currentWishlist.filter(id => id !== tourId);
        action = "removed";
    }
    else {
        currentWishlist.push(tourId);
    }
    await account_model_1.default.updateOne({ _id: account._id }, { $set: { wishlist: currentWishlist } });
    return { action, tourId };
};
exports.toggleWishlist = toggleWishlist;
const refresh = async (req) => {
    const { refreshToken } = req.body;
    const decoded = (0, auth_tokens_1.verifyRefreshToken)(refreshToken);
    if (decoded.userType !== "admin" && decoded.userType !== "client") {
        throw new error_middleware_1.HttpError(403, "Unsupported user type");
    }
    const account = await account_model_1.default.findOne({
        _id: decoded.sub,
        status: "active",
    });
    if (!account || account.deleted) {
        throw new error_middleware_1.HttpError(401, "Tài khoản không hợp lệ hoặc đã bị khoá");
    }
    if (!account.refreshTokenHash || !account.refreshTokenJti) {
        throw new error_middleware_1.HttpError(401, "Refresh token not recognized");
    }
    if (account.refreshTokenJti !== decoded.jti) {
        throw new error_middleware_1.HttpError(401, "Refresh token has been rotated");
    }
    const matches = await bcryptjs_1.default.compare(refreshToken, account.refreshTokenHash);
    if (!matches) {
        throw new error_middleware_1.HttpError(401, "Refresh token invalid");
    }
    // Rotate refresh token
    const newRefreshJti = (0, auth_tokens_1.newJti)();
    const newRefreshToken = (0, auth_tokens_1.signRefreshToken)({ sub: account._id.toString(), userType: decoded.userType, jti: newRefreshJti }, true);
    const newRefreshHash = await bcryptjs_1.default.hash(newRefreshToken, 10);
    await account_model_1.default.updateOne({ _id: account._id }, {
        $set: {
            refreshTokenHash: newRefreshHash,
            refreshTokenJti: newRefreshJti,
        },
    });
    const newAccessToken = (0, auth_tokens_1.signAccessToken)({ sub: account._id.toString(), userType: decoded.userType });
    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};
exports.refresh = refresh;
