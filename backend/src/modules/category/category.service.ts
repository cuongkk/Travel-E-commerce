import type { Request } from "express";
import moment from "moment";
import slugify from "slugify";
import Category from "./category.model";
import AccountAdmin from "../auth/account-admin.model";
import { buildCategoryTree } from "./category.helper";
import { pagination } from "../../utils/pagination.helper";
import { AccountRequest } from "../../interfaces/request.interface";

export const list = async (req: Request): Promise<{ categoryList: any[]; accountAdminList: any[]; pagination: any }> => {
  const find: any = { deleted: false };
  const anyReq = req as any;

  if (anyReq.query?.status) {
    find.status = anyReq.query.status;
  }

  if (anyReq.query?.createdBy) {
    find.createdBy = anyReq.query.createdBy;
  }

  const filterDate: any = {};
  if (anyReq.query?.startDate) {
    filterDate.$gte = moment(anyReq.query.startDate).toDate();
    find.createdAt = filterDate;
  }
  if (anyReq.query?.endDate) {
    filterDate.$lte = moment(anyReq.query.endDate).toDate();
    find.createdAt = filterDate;
  }

  if (anyReq.query?.keyword) {
    let regex: string = (anyReq.query.keyword as string).trim();
    regex = regex.replace(/\s\s+/g, " ");
    regex = slugify(regex);
    const re = new RegExp(regex, "i");
    find.slug = re;
  }

  const pageInfo = await pagination(Category, find, anyReq);

  const categoryList: any[] = await Category.find(find).sort({ position: "asc" }).limit(pageInfo.limitItems).skip(pageInfo.skip);

  const accountAdminList = await AccountAdmin.find({}).select("id fullName");

  for (const item of categoryList) {
    if ((item as any).createdBy) {
      const infoAccount = await AccountAdmin.findOne({ _id: (item as any).createdBy });
      if (infoAccount) {
        (item as any).createdByFullName = infoAccount.fullName;
        (item as any).createdAtFormat = moment((item as any).createdAt).format("HH:mm - DD/MM/YYYY");
      }
    }

    if ((item as any).updatedBy) {
      const infoAccount = await AccountAdmin.findOne({ _id: (item as any).updatedBy });
      if (infoAccount) {
        (item as any).updatedByFullName = infoAccount.fullName;
        (item as any).updatedAtFormat = moment((item as any).updatedAt).format("HH:mm - DD/MM/YYYY");
      }
    }
  }

  return { categoryList, accountAdminList, pagination: pageInfo };
};

export const create = async (req: Request): Promise<{ categoryList: any[] }> => {
  const categoryList = await Category.find({ deleted: false });
  const categoryTree = buildCategoryTree(categoryList as any[]);
  return { categoryList: categoryTree };
};

export const createPost = async (req: Request): Promise<{ result: string; message: string }> => {
  const anyReq = req as any;
  const reqWithAccount = req as AccountRequest;

  if (anyReq.file) {
    anyReq.body.avatar = anyReq.file.path;
  } else {
    anyReq.body.avatar = "";
  }

  if (anyReq.body.position) {
    anyReq.body.position = parseInt(anyReq.body.position, 10);
  } else {
    const record = await Category.findOne().sort({ position: "desc" });
    anyReq.body.position = record ? (record as any).position + 1 : 1;
  }

  anyReq.body.createdBy = reqWithAccount.account?.id;

  const newRecord = new Category(anyReq.body);
  await newRecord.save();

  return {
    result: "success",
    message: "Tạo danh mục thành công",
  };
};

export const edit = async (req: Request): Promise<{ categoryList: any[]; categoryDetail: any } | { code: string; message: string }> => {
  try {
    const { id } = req.params as { id: string };

    const categoryDetail = await Category.findOne({ _id: id, deleted: false });

    if (!categoryDetail) {
      return { code: "error", message: "Danh mục không tồn tại!" };
    }

    const categoryList = await Category.find({ deleted: false });
    const categoryTree = buildCategoryTree(categoryList as any[]);
    return { categoryList: categoryTree, categoryDetail };
  } catch (error) {
    return { code: "error", message: "Danh mục không tồn tại!" };
  }
};

export const editPatch = async (req: Request): Promise<{ code: string; message: string }> => {
  try {
    const { id } = req.params as { id: string };
    const anyReq = req as any;
    const reqWithAccount = req as AccountRequest;

    const categoryDetail = await Category.findOne({ _id: id, deleted: false });

    if (!categoryDetail) {
      return {
        code: "error",
        message: "Danh mục không tồn tại!",
      };
    }

    if (anyReq.file) {
      anyReq.body.avatar = anyReq.file.path;
    } else {
      anyReq.body.avatar = "";
    }

    if (anyReq.body.position) {
      anyReq.body.position = parseInt(anyReq.body.position, 10);
    } else {
      const record = await Category.findOne({}).sort({ position: "desc" });
      anyReq.body.position = record ? (record as any).position + 1 : 1;
    }

    anyReq.body.updatedBy = reqWithAccount.account?.id;

    await Category.updateOne({ _id: id, deleted: false }, anyReq.body);

    return {
      code: "success",
      message: "Đã cập nhật danh mục!",
    };
  } catch (error) {
    return {
      code: "error",
      message: "Danh mục không tồn tại!",
    };
  }
};

export const deletePatch = async (req: Request): Promise<{ code: string; message: string }> => {
  try {
    const { id } = req.params as { id: string };
    const reqWithAccount = req as AccountRequest;

    const categoryDetail = await Category.findOne({ _id: id, deleted: false });

    if (!categoryDetail) {
      return {
        code: "error",
        message: "Danh mục không tồn tại!",
      };
    }

    await Category.updateOne(
      { _id: id, deleted: false },
      {
        deleted: true,
        deletedBy: reqWithAccount.account?.id,
        deletedAt: Date.now(),
      },
    );

    return {
      code: "success",
      message: "Đã xóa danh mục!",
    };
  } catch (error) {
    return {
      code: "error",
      message: "Danh mục không tồn tại!",
    };
  }
};
