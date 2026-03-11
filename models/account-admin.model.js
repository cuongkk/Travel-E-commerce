const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    phone: String,
    role: String,
    positionCompany: String,
    status: String, // initial: Khởi tạo, active: Hoạt động, inactive: Tạm dừng

    password: String,
    avatar: String,
    createdBy: String,
    updatedBy: String,
    slug: {
      type: String,
      slug: "fullName",
      unique: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: String,
    deletedAt: Date,
  },
  {
    timestamps: true,
  },
  {
    timestamps: true,
  },
);
const AccountAdmin = mongoose.model("AccountAdmin", schema, "accounts_admin");

module.exports = AccountAdmin;
