const { utils, config, api } = require("cloudinary").v2;

exports.api = api;

exports.cloudinaryConfig = (req, res, next) => {
  config({
    api_key: process.env.API_KEY,
    cloud_name: process.env.CLOUD_NAME,
    api_secret: process.env.API_SECRET,
  });
};

exports.createImageUpload = async (folder) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = await utils.api_sign_request(
    {
      timestamp,
      folder,
    },
    process.env.API_SECRET
  );

  return {
    timestamp,
    signature,
  };
};
