import type { Request } from "express";
import bcrypt from "bcryptjs";
import moment from "moment";
import slugify from "slugify";
import Role from "../user/role.model";
import AccountAdmin from "../auth/account-admin.model";
import SettingWebsiteInfo from "./setting-website-info.model";
import { AccountRequest } from "../../interfaces/request.interface";
import { permissionList } from "../../configs/variable.config";

export const list = async (req: Request): Promise<{ pageTitle: string }> => {
  return {
    pageTitle: "Cài đặt",
  };
};

export const websiteInfo = async (req: Request): Promise<{ settingWebsiteInfo: any }> => {
  const existRecord = await SettingWebsiteInfo.findOne({});

  const settingWebsiteInfo =
    existRecord ||
    ({
      websiteName: "",
      phone: "",
      email: "",
      address: "",
      logo: "",
      favicon: "",
    } as any);

  return { settingWebsiteInfo };
};

export const websiteInfoPatch = async (req: Request): Promise<{ code: string; message: string }> => {
  const anyReq = req as any;
  const existRecord = await SettingWebsiteInfo.findOne({});

  const websiteName = (anyReq.body?.name as string) || existRecord?.websiteName || "";
  const phone = (anyReq.body?.phone as string) || existRecord?.phone || "";
  const email = (anyReq.body?.email as string) || existRecord?.email || "";
  const address = (anyReq.body?.address as string) || existRecord?.address || "";

  let logo = existRecord?.logo;
  let favicon = existRecord?.favicon;

  if (anyReq.files?.logo?.[0]) {
    logo = anyReq.files.logo[0].path;
  }

  if (anyReq.files?.favicon?.[0]) {
    favicon = anyReq.files.favicon[0].path;
  }

  const payload = {
    websiteName,
    phone,
    email,
    address,
    logo: logo || "",
    favicon: favicon || "",
  };

  if (!existRecord) {
    const newRecord = new SettingWebsiteInfo(payload);
    await newRecord.save();
  } else {
    await SettingWebsiteInfo.updateOne({}, payload);
  }

  return {
    code: "success",
    message: "Cập nhật thành công!",
  };
};

export const accountAdminList = async (req: Request): Promise<{ accountAdminList: any[] }> => {
  const accountAdminList = await AccountAdmin.find({
    deleted: false,
  }).sort({
    createdAt: "desc",
  });

  for (const item of accountAdminList) {
    if (item.role) {
      const role = await Role.findOne({
        _id: item.role,
        deleted: false,
      });
      if (role) {
        (item as any).roleName = role.name;
      }
    }
  }

  return { accountAdminList };
};

export const accountAdminCreate = async (req: Request): Promise<{ roleList: any[] }> => {
  const roleList = await Role.find({ deleted: false });
  return { roleList };
};

export const accountAdminCreatePost = async (req: Request): Promise<{ code: string; message: string }> => {
  const anyReq = req as any;

  const existEmail = await AccountAdmin.findOne({
    email: anyReq.body.email,
  });

  if (existEmail) {
    return {
      code: "error",
      message: "Email đã tồn tại trong hệ thống!",
    };
  }

  if (anyReq.file) {
    anyReq.body.avatar = anyReq.file.path;
  } else {
    anyReq.body.avatar = "";
  }

  const reqWithAccount = req as AccountRequest;
  anyReq.body.createdBy = reqWithAccount.account?.id;

  if (anyReq.body.fullName) {
    anyReq.body.slug = slugify(anyReq.body.fullName, { lower: true, strict: true });
  }

  anyReq.body.password = await bcrypt.hash(anyReq.body.password, 10);

  const newAccount = new AccountAdmin(anyReq.body);
  await newAccount.save();

  return {
    code: "success",
    message: "Đã tạo tài khoản quản trị!",
  };
};

export const accountAdminEdit = async (req: Request): Promise<{ roleList: any[]; accountDetail: any } | { code: string; message: string }> => {
  try {
    const { id } = req.params as { id: string };

    const accountDetail = await AccountAdmin.findOne({
      _id: id,
      deleted: false,
    });

    if (!accountDetail) {
      return { code: "error", message: "Tài khoản không tồn tại!" };
    }

    const roleList = await Role.find({ deleted: false });
    return { roleList, accountDetail };
  } catch (error) {
    return { code: "error", message: "Tài khoản không tồn tại!" };
  }
};

export const accountAdminEditPatch = async (req: Request): Promise<{ code: string; message: string }> => {
  try {
    const { id } = req.params as { id: string };
    const anyReq = req as any;

    const accountDetail = await AccountAdmin.findOne({
      _id: id,
      deleted: false,
    });

    if (!accountDetail) {
      return {
        code: "error",
        message: "Tài khoản không tồn tại!",
      };
    }

    const existEmail = await AccountAdmin.findOne({
      _id: { $ne: id },
      email: anyReq.body.email,
    });

    if (existEmail) {
      return {
        code: "error",
        message: "Email đã tồn tại trong hệ thống!",
      };
    }

    if (anyReq.file) {
      anyReq.body.avatar = anyReq.file.path;
    } else {
      anyReq.body.avatar = "";
    }

    const reqWithAccount = req as AccountRequest;
    anyReq.body.updatedBy = reqWithAccount.account?.id;

    await AccountAdmin.updateOne(
      {
        _id: id,
        deleted: false,
      },
      anyReq.body,
    );

    return {
      code: "success",
      message: "Đã cập nhật khoản quản trị!",
    };
  } catch (error) {
    return {
      code: "error",
      message: "Email không tồn tại!",
    };
  }
};

export const roleList = async (req: Request): Promise<{ roleList: any[] }> => {
  const find = {
    deleted: false,
  };

  const roleList = await Role.find(find).sort({
    createdAt: "desc",
  });

  for (const item of roleList) {
    if (item.createdBy) {
      const infoAccount = await AccountAdmin.findOne({ _id: item.createdBy });
      if (infoAccount) {
        (item as any).createdByFullName = infoAccount.fullName;
        (item as any).createdAtFormat = moment((item as any).createdAt).format("HH:mm - DD/MM/YYYY");
      }
    }

    if (item.updatedBy) {
      const infoAccount = await AccountAdmin.findOne({ _id: item.updatedBy });
      if (infoAccount) {
        (item as any).updatedByFullName = infoAccount.fullName;
        (item as any).updatedAtFormat = moment((item as any).updatedAt).format("HH:mm - DD/MM/YYYY");
      }
    }
  }

  return { roleList };
};

export const roleCreate = async (req: Request): Promise<{ permissionList: typeof permissionList }> => {
  return { permissionList };
};

export const roleCreatePost = async (req: Request): Promise<{ code: string; message: string }> => {
  const anyReq = req as any;
  const reqWithAccount = req as AccountRequest;

  anyReq.body.createdBy = reqWithAccount.account?.id;

  const record = new Role(anyReq.body);
  await record.save();

  return {
    code: "success",
    message: "Đã tạo nhóm quyền!",
  };
};

export const roleEdit = async (req: Request): Promise<{ permissionList: typeof permissionList; role: any } | { code: string; message: string }> => {
  try {
    const { id } = req.params as { id: string };

    const role = await Role.findOne({
      _id: id,
      deleted: false,
    });

    if (!role) {
      return { code: "error", message: "Nhóm quyền không tồn tại!" };
    }

    return { permissionList, role };
  } catch (error) {
    return { code: "error", message: "Nhóm quyền không tồn tại!" };
  }
};

export const roleEditPatch = async (req: Request): Promise<{ code: string; message: string }> => {
  try {
    const { id } = req.params as { id: string };
    const anyReq = req as any;
    const reqWithAccount = req as AccountRequest;

    const role = await Role.findOne({
      _id: id,
      deleted: false,
    });

    if (!role) {
      return {
        code: "error",
        message: "Nhóm quyền không tồn tại!",
      };
    }

    anyReq.body.updatedBy = reqWithAccount.account?.id;

    await Role.updateOne(
      {
        _id: id,
        deleted: false,
      },
      anyReq.body,
    );

    return {
      code: "success",
      message: "Đã cập nhật nhóm quyền!",
    };
  } catch (error) {
    return {
      code: "error",
      message: "Nhóm quyền không tồn tại!",
    };
  }
};

export const roleDeletePatch = async (req: Request): Promise<{ code: string; message: string }> => {
  try {
    const { id } = req.params as { id: string };
    const reqWithAccount = req as AccountRequest;

    const role = await Role.findOne({
      _id: id,
      deleted: false,
    });

    if (!role) {
      return {
        code: "error",
        message: "Nhóm quyền không tồn tại!",
      };
    }

    await Role.updateOne(
      {
        _id: id,
        deleted: false,
      },
      {
        deleted: true,
        deletedBy: reqWithAccount.account?.id,
        deletedAt: Date.now(),
      },
    );

    return {
      code: "success",
      message: "Đã xóa nhóm quyền!",
    };
  } catch (error) {
    return {
      code: "error",
      message: "Nhóm quyền không tồn tại!",
    };
  }
};
