const jwt = require("jsonwebtoken");
const accountAdmin = require("../../models/account-admin.model.js");
const Role = require("../../models/role.model");

module.exports.verifyToken = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect(`/${pathAdmin}/account/login`);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const existAccount = await accountAdmin.findOne({
      _id: decoded._id,
      status: "active",
    });

    if (!existAccount) {
      res.clearCookie("token");
      return res.redirect(`/${pathAdmin}/account/login`);
    }

    if (existAccount.role) {
      const role = await Role.findOne({
        _id: existAccount.role,
        deleted: false,
      });
      if (role) {
        existAccount.roleName = role.name;
      }
    }

    req.account = existAccount;

    res.locals.account = existAccount;
    next();
  } catch (error) {
    res.clearCookie("token");
    return res.redirect(`/${pathAdmin}/account/login`);
  }
};
