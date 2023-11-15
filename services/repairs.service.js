const path = require("path");
const fs = require("fs");
const multer = require("multer");
const db = require("../models");
const multerConfig = require("./multer.config");
const upload = multer(multerConfig.config).single(multerConfig.keyUpload);


module.exports = class RepairsServices {
    addRepairs(req, res, id, accessToken) {
        upload(req, res, async (next) => {
            if (next instanceof multer.MulterError) {
                console.log(`error: ${JSON.stringify(next)}`);
                return res.status(500).json({ message: next });
            }

            const equipmentId = id
            const userId = accessToken.id

            console.log(req.body);

            try {
                const query = await db.Equipments.findByPk(equipmentId);

                if(!query) return res.status(404).json({ success: false, message: "ไม่พบข้อมูลครุภัณฑ์" });
                

            } catch (error) {
                console.log(error);
            }
        });
    }
}