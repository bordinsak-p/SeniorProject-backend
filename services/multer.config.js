const multer = require("multer");
const fs = require("fs");

// export file เพื่อนำไปใช้กับไฟล์ server.js
// export ออกไปในรูปแบบของ object
module.exports = multerConfig = {
  config: {
    storage: multer.diskStorage({
      // กำหนด path ในการ save รูป
      destination: (req, file, cb) => {
        const folder = "./images";

        // เช็คเงื่อนไขว่าถ้าไม่มี folder ให้ทำการสร้าง folder ขึ้นมาใหม่
        if (!fs.existsSync(folder)) {
          fs.mkdirSync(folder);
        }

        // cb คือตัวแปรส่งออกไป
        cb(null, folder);
      },

      // ตั้งชื่อ file
      filename: (req, file, cb) => {
        // ตังชื่อไฟล์โดยการนำวันที่ปัจจุบัน - random ตัวเลข
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

        // ทำการตัด / ออกจาก string image/png
        // ทำการ ตัด 'image' เพื่อเอานามสกุลไฟล์
        const originalname = file.mimetype.split('/')

        // เมื่อ split แล้วจะได้ array ซึงเก็บ [ 'image', 'png' ]
        // ให้เราเอาตำแหน่งที่ 1 เพื่อนำไปเป็นนามสกุลของไฟล์
        cb(null, file.fieldname + "-" + uniqueSuffix + "." +originalname[1]);
      },
    }),

    // กำหนดไฟล์ size
    limits: { fileSize: 1024 * 1024 * 5 },

    fileFilter: (req, file, cb) => {
      const image = file.mimetype.startsWith("image/");

      if (image) {
        // accept ไฟล์ที่ส่งเข้ามาถูกต้อง
        cb(null, true);
      } else {
        // ไม่เข้าเงื่อไขไหนเลยจะส่ง error ออกไป
        cb({ message: "File type not supported"}, false);
      }

      //   // ถ้า return เป็น false จะทำการ reject
      //   cb(null, false);
    },
  },
  keyUpload: "image",
};
