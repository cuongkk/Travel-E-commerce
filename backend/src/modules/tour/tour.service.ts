import type { Request } from "express";
import moment from "moment";
import Category from "../category/category.model";
import City from "../city/city.model";
import { buildCategoryTree } from "../category/category.helper";
import Tour from "./tour.model";
import AccountAdmin from "../auth/account-admin.model";
import { pagination } from "../../utils/pagination.helper";
import { AccountRequest } from "../../interfaces/request.interface";

export const list = async (req: Request): Promise<{ tourList: any[]; pagination: any }> => {
  const find: any = { deleted: false };

  const pageInfo = await pagination(Tour, find, req as any);

  const tourList: any[] = await Tour.find(find).sort({ position: "desc" }).limit(pageInfo.limitItems).skip(pageInfo.skip);

  for (const item of tourList) {
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

  return { tourList, pagination: pageInfo };
};

export const create = async (req: Request): Promise<{ categoryList: any[]; cityList: any[] }> => {
  const categoryList = await Category.find({ deleted: false });
  const categoryTree = buildCategoryTree(categoryList as any[]);

  const cityList = await City.find({});
  return { categoryList: categoryTree, cityList };
};

export const createPost = async (req: Request): Promise<{ code: string; message: string }> => {
  const anyReq = req as any;
  const reqWithAccount = req as AccountRequest;

  if (anyReq.files?.avatar?.[0]) {
    anyReq.body.avatar = anyReq.files.avatar[0].path;
  } else {
    anyReq.body.avatar = "";
  }

  if (anyReq.files?.images?.length) {
    anyReq.body.images = anyReq.files.images.map((item: any) => item.path);
  } else {
    anyReq.body.images = [];
  }

  if (anyReq.body.position) {
    anyReq.body.position = parseInt(anyReq.body.position, 10);
  } else {
    const record = await Tour.findOne({}).sort({ position: "desc" });
    anyReq.body.position = record ? (record as any).position + 1 : 1;
  }

  anyReq.body.priceAdult = anyReq.body.priceAdult ? parseInt(anyReq.body.priceAdult, 10) : 0;
  anyReq.body.priceChildren = anyReq.body.priceChildren ? parseInt(anyReq.body.priceChildren, 10) : 0;
  anyReq.body.priceBaby = anyReq.body.priceBaby ? parseInt(anyReq.body.priceBaby, 10) : 0;
  anyReq.body.priceNewAdult = anyReq.body.priceNewAdult ? parseInt(anyReq.body.priceNewAdult, 10) : anyReq.body.priceAdult;
  anyReq.body.priceNewChildren = anyReq.body.priceNewChildren ? parseInt(anyReq.body.priceNewChildren, 10) : anyReq.body.priceChildren;
  anyReq.body.priceNewBaby = anyReq.body.priceNewBaby ? parseInt(anyReq.body.priceNewBaby, 10) : anyReq.body.priceBaby;
  anyReq.body.stockAdult = anyReq.body.stockAdult ? parseInt(anyReq.body.stockAdult, 10) : 0;
  anyReq.body.stockChildren = anyReq.body.stockChildren ? parseInt(anyReq.body.stockChildren, 10) : 0;
  anyReq.body.stockBaby = anyReq.body.stockBaby ? parseInt(anyReq.body.stockBaby, 10) : 0;
  anyReq.body.locations = anyReq.body.locations ? JSON.parse(anyReq.body.locations) : [];
  anyReq.body.departureDate = anyReq.body.departureDate ? new Date(anyReq.body.departureDate) : null;
  anyReq.body.endDate = anyReq.body.endDate ? new Date(anyReq.body.endDate) : null;

  if (anyReq.body.departureDate && anyReq.body.endDate) {
    const diffMs = anyReq.body.endDate.getTime() - anyReq.body.departureDate.getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    const days = Math.max(1, Math.ceil(diffMs / dayMs));
    anyReq.body.time = `${days} ngày`;
  } else {
    anyReq.body.time = "";
  }

  anyReq.body.schedules = anyReq.body.schedules ? JSON.parse(anyReq.body.schedules) : [];
  anyReq.body.createdBy = reqWithAccount.account?.id;

  const newRecord = new Tour(anyReq.body);
  await newRecord.save();

  return {
    code: "success",
    message: "Đã tạo tour!",
  };
};

export const trash = async (req: Request): Promise<{ tourList: any[] }> => {
  const find: any = { deleted: true };

  const tourList: any[] = await Tour.find(find).sort({ deletedAt: "desc" });

  for (const item of tourList) {
    if ((item as any).createdBy) {
      const infoAccount = await AccountAdmin.findOne({ _id: (item as any).createdBy });
      if (infoAccount) {
        (item as any).createdByFullName = infoAccount.fullName;
        (item as any).createdAtFormat = moment((item as any).createdAt).format("HH:mm - DD/MM/YYYY");
      }
    }

    if ((item as any).deletedBy) {
      const infoAccount = await AccountAdmin.findOne({ _id: (item as any).deletedBy });
      if (infoAccount) {
        (item as any).deletedByFullName = infoAccount.fullName;
        (item as any).deletedAtFormat = moment((item as any).deletedAt).format("HH:mm - DD/MM/YYYY");
      }
    }
  }

  return { tourList };
};

export const edit = async (req: Request): Promise<{ categoryList: any[]; tourDetail: any; cityList: any[] } | { code: string; message: string }> => {
  try {
    const { id } = req.params as { id: string };

    const tourDetail: any = await Tour.findOne({ _id: id, deleted: false });

    if (!tourDetail) {
      return { code: "error", message: "Tour không tồn tại!" };
    }

    if (tourDetail.departureDate) {
      tourDetail.departureDateFormat = moment(tourDetail.departureDate).format("YYYY-MM-DD");
    }

    const categoryList = await Category.find({ deleted: false });
    const categoryTree = buildCategoryTree(categoryList as any[]);
    const cityList = await City.find({});
    return { categoryList: categoryTree, tourDetail, cityList };
  } catch (error) {
    return { code: "error", message: "Tour không tồn tại!" };
  }
};

export const editPatch = async (req: Request): Promise<{ code: string; message: string }> => {
  try {
    const { id } = req.params as { id: string };
    const anyReq = req as any;
    const reqWithAccount = req as AccountRequest;

    const tourDetail: any = await Tour.findOne({ _id: id, deleted: false });

    if (!tourDetail) {
      return {
        code: "error",
        message: "Tour không tồn tại!",
      };
    }

    if (anyReq.files?.avatar?.[0]) {
      anyReq.body.avatar = anyReq.files.avatar[0].path;
    } else {
      anyReq.body.avatar = "";
    }

    if (anyReq.files?.images?.length) {
      anyReq.body.images = anyReq.files.images.map((item: any) => item.path);
    } else {
      anyReq.body.images = [];
    }

    if (anyReq.body.position) {
      anyReq.body.position = parseInt(anyReq.body.position, 10);
    } else {
      const record = await Tour.findOne({}).sort({ position: "desc" });
      anyReq.body.position = record ? (record as any).position + 1 : 1;
    }

    anyReq.body.priceAdult = anyReq.body.priceAdult ? parseInt(anyReq.body.priceAdult, 10) : 0;
    anyReq.body.priceChildren = anyReq.body.priceChildren ? parseInt(anyReq.body.priceChildren, 10) : 0;
    anyReq.body.priceBaby = anyReq.body.priceBaby ? parseInt(anyReq.body.priceBaby, 10) : 0;
    anyReq.body.priceNewAdult = anyReq.body.priceNewAdult ? parseInt(anyReq.body.priceNewAdult, 10) : anyReq.body.priceAdult;
    anyReq.body.priceNewChildren = anyReq.body.priceNewChildren ? parseInt(anyReq.body.priceNewChildren, 10) : anyReq.body.priceChildren;
    anyReq.body.priceNewBaby = anyReq.body.priceNewBaby ? parseInt(anyReq.body.priceNewBaby, 10) : anyReq.body.priceBaby;
    anyReq.body.stockAdult = anyReq.body.stockAdult ? parseInt(anyReq.body.stockAdult, 10) : 0;
    anyReq.body.stockChildren = anyReq.body.stockChildren ? parseInt(anyReq.body.stockChildren, 10) : 0;
    anyReq.body.stockBaby = anyReq.body.stockBaby ? parseInt(anyReq.body.stockBaby, 10) : 0;
    anyReq.body.locations = anyReq.body.locations ? JSON.parse(anyReq.body.locations) : [];
    anyReq.body.vehicle = anyReq.body.vehicle || tourDetail.vehicle || "";
    anyReq.body.departureDate = anyReq.body.departureDate ? new Date(anyReq.body.departureDate) : tourDetail.departureDate || null;
    anyReq.body.endDate = anyReq.body.endDate ? new Date(anyReq.body.endDate) : tourDetail.endDate || null;

    if (anyReq.body.departureDate && anyReq.body.endDate) {
      const diffMs = anyReq.body.endDate.getTime() - anyReq.body.departureDate.getTime();
      const dayMs = 24 * 60 * 60 * 1000;
      const days = Math.max(1, Math.ceil(diffMs / dayMs));
      anyReq.body.time = `${days} ngày`;
    } else {
      anyReq.body.time = tourDetail.time || "";
    }

    anyReq.body.schedules = anyReq.body.schedules ? JSON.parse(anyReq.body.schedules) : [];
    anyReq.body.updatedBy = reqWithAccount.account?.id;

    await Tour.updateOne({ _id: id, deleted: false }, anyReq.body);

    return {
      code: "success",
      message: "Đã cập nhật tour!",
    };
  } catch (error) {
    return {
      code: "error",
      message: "Tour không tồn tại!",
    };
  }
};

export const deletePatch = async (req: Request): Promise<{ code: string; message: string }> => {
  try {
    const { id } = req.params as { id: string };
    const reqWithAccount = req as AccountRequest;

    const tourDetail = await Tour.findOne({ _id: id, deleted: false });

    if (!tourDetail) {
      return {
        code: "error",
        message: "Tour không tồn tại!",
      };
    }

    await Tour.updateOne(
      { _id: id, deleted: false },
      {
        deleted: true,
        deletedBy: reqWithAccount.account?.id,
        deletedAt: Date.now(),
      },
    );

    return {
      code: "success",
      message: "Đã xóa tour!",
    };
  } catch (error) {
    return {
      code: "error",
      message: "Tour không tồn tại!",
    };
  }
};

export const undoPatch = async (req: Request): Promise<{ code: string; message: string }> => {
  try {
    const { id } = req.params as { id: string };

    const tourDetail = await Tour.findOne({ _id: id, deleted: true });

    if (!tourDetail) {
      return {
        code: "error",
        message: "Tour không tồn tại!",
      };
    }

    await Tour.updateOne(
      { _id: id, deleted: true },
      {
        deleted: false,
      },
    );

    return {
      code: "success",
      message: "Đã khôi phục tour!",
    };
  } catch (error) {
    return {
      code: "error",
      message: "Tour không tồn tại!",
    };
  }
};

export const destroyDel = async (req: Request): Promise<{ code: string; message: string }> => {
  try {
    const { id } = req.params as { id: string };

    const tourDetail = await Tour.findOne({ _id: id, deleted: true });

    if (!tourDetail) {
      return {
        code: "error",
        message: "Tour không tồn tại!",
      };
    }

    await Tour.deleteOne({ _id: id, deleted: true });

    return {
      code: "success",
      message: "Đã xóa vĩnh viễn tour!",
    };
  } catch (error) {
    return {
      code: "error",
      message: "Tour không tồn tại!",
    };
  }
};

export const changeMultiPatch = async (req: Request): Promise<{ code: string; message: string }> => {
  try {
    const { listId, option } = (req as any).body as { listId: string[]; option: string };
    const reqWithAccount = req as AccountRequest;

    switch (option) {
      case "active":
      case "inactive":
        await Tour.updateMany(
          { _id: { $in: listId }, deleted: false },
          {
            status: option,
            updatedBy: reqWithAccount.account?.id,
          },
        );
        return {
          code: "success",
          message: "Đã cập nhật trạng thái tour!",
        };
        break;

      case "delete":
        await Tour.updateMany(
          { _id: { $in: listId }, deleted: false },
          {
            deleted: true,
            deletedBy: reqWithAccount.account?.id,
            deletedAt: Date.now(),
          },
        );
        return {
          code: "success",
          message: "Đã chuyển tour vào thùng rác!",
        };
        break;

      case "undo":
        await Tour.updateMany(
          { _id: { $in: listId }, deleted: true },
          {
            deleted: false,
          },
        );
        return {
          code: "success",
          message: "Đã khôi phục các tour!",
        };
        break;

      case "destroy":
        await Tour.deleteMany({ _id: { $in: listId }, deleted: true });
        return {
          code: "success",
          message: "Đã xóa vĩnh viễn các tour!",
        };
        break;

      default:
        return {
          code: "error",
          message: "Dữ liệu không hợp lệ!",
        };
    }
  } catch (error) {
    return {
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    };
  }
};
