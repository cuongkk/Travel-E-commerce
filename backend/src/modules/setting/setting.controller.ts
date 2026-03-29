import type { Request, Response } from "express";
import * as settingService from "./setting.service";

export const list = (req: Request, res: Response): void => {
  settingService
    .list(req)
    .then((data) => res.json({ code: "success", ...data }))
    .catch(() => res.json({ code: "error", message: "Lấy dữ liệu cài đặt thất bại!" }));
};

export const websiteInfo = (req: Request, res: Response): Promise<void> => {
  return settingService
    .websiteInfo(req)
    .then((data) => {
      res.json({ code: "success", message: "Lấy thông tin website thành công!", ...data });
    })
    .catch(() => {
      res.json({ code: "error", message: "Lấy thông tin website thất bại!" });
    });
};

export const websiteInfoPatch = (req: Request, res: Response): Promise<void> => {
  return settingService
    .websiteInfoPatch(req)
    .then((result) => {
      res.json(result);
    })
    .catch(() => {
      res.json({ code: "error", message: "Cập nhật thông tin website thất bại!" });
    });
};

export const accountAdminList = (req: Request, res: Response): Promise<void> => {
  return settingService
    .accountAdminList(req)
    .then((data) => {
      res.json({ code: "success", message: "Lấy danh sách tài khoản quản trị thành công!", ...data });
    })
    .catch(() => {
      res.json({ code: "error", message: "Lấy danh sách tài khoản quản trị thất bại!" });
    });
};

export const accountAdminCreate = (req: Request, res: Response): Promise<void> => {
  return settingService
    .accountAdminCreate(req)
    .then((data) => {
      res.json({ code: "success", message: "Lấy dữ liệu tạo tài khoản quản trị thành công!", ...data });
    })
    .catch(() => {
      res.json({ code: "error", message: "Lấy dữ liệu tạo tài khoản quản trị thất bại!" });
    });
};

export const accountAdminCreatePost = (req: Request, res: Response): Promise<void> => {
  return settingService
    .accountAdminCreatePost(req)
    .then((result) => {
      res.json(result);
    })
    .catch(() => {
      res.json({ code: "error", message: "Tạo tài khoản quản trị thất bại!" });
    });
};

export const accountAdminEdit = (req: Request, res: Response): Promise<void> => {
  return settingService
    .accountAdminEdit(req)
    .then((data) => {
      if ((data as any).code === "error") {
        res.json(data);
        return;
      }
      res.json({ code: "success", message: "Lấy dữ liệu chỉnh sửa tài khoản quản trị thành công!", ...data });
    })
    .catch(() => {
      res.json({ code: "error", message: "Lấy dữ liệu chỉnh sửa tài khoản quản trị thất bại!" });
    });
};

export const accountAdminEditPatch = (req: Request, res: Response): Promise<void> => {
  return settingService
    .accountAdminEditPatch(req)
    .then((result) => {
      res.json(result);
    })
    .catch(() => {
      res.json({ code: "error", message: "Cập nhật tài khoản quản trị thất bại!" });
    });
};

export const roleList = (req: Request, res: Response): Promise<void> => {
  return settingService
    .roleList(req)
    .then((data) => {
      res.json({ code: "success", message: "Lấy danh sách nhóm quyền thành công!", ...data });
    })
    .catch(() => {
      res.json({ code: "error", message: "Lấy danh sách nhóm quyền thất bại!" });
    });
};

export const roleCreate = (req: Request, res: Response): void => {
  settingService
    .roleCreate(req)
    .then((data) => {
      res.json({ code: "success", message: "Lấy dữ liệu tạo nhóm quyền thành công!", ...data });
    })
    .catch(() => {
      res.json({ code: "error", message: "Lấy dữ liệu tạo nhóm quyền thất bại!" });
    });
};

export const roleCreatePost = (req: Request, res: Response): Promise<void> => {
  return settingService
    .roleCreatePost(req)
    .then((result) => {
      res.json(result);
    })
    .catch(() => {
      res.json({ code: "error", message: "Tạo nhóm quyền thất bại!" });
    });
};

export const roleEdit = (req: Request, res: Response): Promise<void> => {
  return settingService
    .roleEdit(req)
    .then((data) => {
      if ((data as any).code === "error") {
        res.json(data);
        return;
      }
      res.json({ code: "success", message: "Lấy dữ liệu chỉnh sửa nhóm quyền thành công!", ...data });
    })
    .catch(() => {
      res.json({ code: "error", message: "Lấy dữ liệu chỉnh sửa nhóm quyền thất bại!" });
    });
};

export const roleEditPatch = (req: Request, res: Response): Promise<void> => {
  return settingService
    .roleEditPatch(req)
    .then((result) => {
      res.json(result);
    })
    .catch(() => {
      res.json({ code: "error", message: "Cập nhật nhóm quyền thất bại!" });
    });
};

export const roleDeletePatch = (req: Request, res: Response): Promise<void> => {
  return settingService
    .roleDeletePatch(req)
    .then((result) => {
      res.json(result);
    })
    .catch(() => {
      res.json({ code: "error", message: "Xóa nhóm quyền thất bại!" });
    });
};
