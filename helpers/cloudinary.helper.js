const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: "dkamd3ghb",
  api_key: "547395519916561",
  api_secret: "7L2rrXznC0NHJfQ4RUGdBBZtVVY",
});

module.exports.storage = new CloudinaryStorage({
  cloudinary: cloudinary,
});
