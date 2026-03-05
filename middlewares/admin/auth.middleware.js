const jwt = require("jsonwebtoken");
const accountAdmin = require("../../models/account-admin.model.js");

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

    req.account = existAccount;

    res.locals.account = existAccount;
    next();
  } catch (error) {
    res.clearCookie("token");
    return res.redirect(`/${pathAdmin}/account/login`);
  }
};
