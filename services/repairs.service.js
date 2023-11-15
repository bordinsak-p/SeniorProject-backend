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
            const { description, status } = req.body

            try {
                const query = await db.Equipments.findByPk(equipmentId);

                if(!query) return res.status(404).json({ success: false, message: "ไม่พบข้อมูลครุภัณฑ์" });
                
                const result = await db.Repairs.create(
                    {
                        user_id: userId,
                        equipmentment_id: equipmentId,
                        request_date: new Date(),
                        description: description,
                        status: status
                    }
                );

                res.status(201).json({ success: true, message: "บันทึกข้อมูลสำเร็จ", results: result });
                
            } catch (error) {
                res.status(500).json({ success: false, message: "เกิดข้อมผิดพลาดในการบันทึกข้อมูล", error: error.message });
            }
        });
    }

    editRepairs(req, res, data, accessToken) {

    }
}