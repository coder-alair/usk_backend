'use strict';

const { s3 } = require('@config/aws');
const { internalServerErrorResponse } = require('./Response');

module.exports = {
  /**
   * @description This function is used to create pre signed URL
   * @param {*} mimeType
   * @param {*} fileName
   * @param {*} storagePath
   * @returns {*}
   */
  getUploadURL: (mimeType, fileName, storagePath) => {
    return new Promise((resolve, reject) => {
      const s3Params = {
        Bucket: process.env.AMZ_BUCKET,
        Key: `${storagePath}/${fileName}`,
        ContentType: mimeType,
        Expires: 600 // 10 min
      };

      const uploadURL = s3.getSignedUrl('putObject', s3Params);
      resolve({
        uploadURL,
        filename: fileName
      });
    });
  },
  /**
   * @description This function is used to upload file to s3
   * @param {*} storagePath
   * @param {*} file
   * @returns {*}
   */
  uploadFile: (storagePath, file, mimeType) => {
    return new Promise((resolve, reject) => {
      const params = {
        Bucket: process.env.AMZ_BUCKET,
        Key: storagePath,
        ContentType: mimeType,
        Body: file
      };

      s3.upload(params, (err, data) => {
        if (err) {
          reject(err);
        }

        resolve(data);
      });
    });
  },
  /**
   * @description This function is used remove object from s3
   * @param {*} file
   * @param {*} storagePath
   * @param {*} res
   * @returns {*}
   */
  removeOldImage: (file, storagePath, res) => {
    return new Promise((resolve, reject) => {
      const params = {
        Bucket: `${process.env.AMZ_BUCKET}`,
        Key: `${storagePath}/${file}`
      };
      try {
        return s3.deleteObject(params, (err, data) => {
          if (data) {
            resolve({
              code: 200,
              body: data
            });
          }

          reject(err);
        });
      } catch {
        return internalServerErrorResponse(res);
      }
    });
  }
};
