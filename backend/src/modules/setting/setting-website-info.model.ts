import mongoose, { Document, Schema } from "mongoose";

export interface ISettingWebsiteInfo extends Document {
  websiteName?: string;
  phone?: string;
  email?: string;
  address?: string;
  logo?: string;
  favicon?: string;
}

const schema = new Schema<ISettingWebsiteInfo>({
  websiteName: { type: String },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  logo: { type: String },
  favicon: { type: String },
});

const SettingWebsiteInfo = mongoose.model<ISettingWebsiteInfo>("SettingWebsiteInfo", schema, "setting-website-info");

export default SettingWebsiteInfo;
