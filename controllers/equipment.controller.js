const express = require("express");
const router = express.Router();
const multer = require("multer");
const db = require("../models");
const auth = require("../middleware/auth.middleware");
const multerConfig = require("../services/multer.config");
const path = require("path");
const fs = require("fs");
const upload = multer(multerConfig.config).single(multerConfig.keyUpload);
const shareServices = require('../services/equipment.service')

router.get("/getEquiment", auth, async (req, res) => {
    try {

        let offset = 10;
        let limit = 5;

        const { rows, count } = await db.Equiments.findAndCountAll({
            order: [
                ['id', 'DESC'],
            ]
        }, { offset: offset, limit: limit });

        res.status(200)
            .json({ success: true, count: count, offset: offset, limit: limit, results: rows })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get("/getEquimentForPrm/:id", auth, async (req, res) => {

    try {
        const result = await db.Equiments.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!result) {
            res.status(404).json({ success: false, message: "ไม่พบข้อมูลครุภัณฑ์" });
        }

        res.status(200).json({ success: true, results: result })
    } catch (error) {
        res.status(500).json({ success: false, message: "ไม่สามารถแก้ไขข้อมูลได้", error: error.message })
    }
});

router.post("/addEquiment", auth, async (req, res) => {
    upload(req, res, async (next) => {
        if (next instanceof multer.MulterError) {
            console.log(`error: ${JSON.stringify(next)}`);
            return res.status(500).json({ message: next });
        }

        const { locationname, branchinfo, roomnumber, equimentname, description } = req.body;

        const transaction = await db.sequelize.transaction();

        try {
            const loc = await db.Locations.create({
                location_name: locationname,
                branch_info: branchinfo,
                room_number: roomnumber
            }, { transaction });

            const equ = await db.Equiments.create({
                equiment_name: equimentname,
                location_id: loc["dataValues"].id,
                description: description,
                image: req.file ? req.file.filename : undefined,
                buget_year: new Date(),
            }, { transaction });

            // Commit transaction
            await transaction.commit();

            res.status(201).json({ success: true, message: "บันทึกข้อมูลสำเร็จ", results: equ });
        } catch (error) {
            console.log(error);

            // Rollback transaction in case of error
            await transaction.rollback();

            res.status(500).json({ success: false, message: "เกิดข้อมผิดพลาดในการบันทึกข้อมูล", error: error.message });
        }
    });
});

router.put("/editEquiment/:id", auth, async (req, res) => {
    const service = new shareServices();
    try {
        const data = await db.Equiments.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!data)
            return res.status(404).json({ success: false, message: "ไม่พบข้อมูลครุภัณฑ์" });

        service.checkImageAndUpdate(req, res, data);

    } catch (error) {
        res
            .status(500)
            .json({ success: false, message: "ไม่สามารถแก้ไขข้อมูลครุภัณฑ์", error: error.message })
    }
});

router.delete("/delEquiment/:id", auth, async (req, res) => {
    try {
        const query = await db.Equiments.findOne({
            where: {
                id: req.params.id
            }
        })

        if (!query) return res.status(404).json({ success: false, message: "ไม่พบข้อมูลครุภัณฑ์" });

        if (query.image) {
            fs.unlink(path.join(__dirname, "../images", query.image), (err) => {
                if (err) {
                    console.log("ไม่สามารถลบไฟล์ได้ :", err);
                } else {
                    console.log("ลบไฟล์สำเร็จ");
                }
            })
        }
 
        const result = await db.Equiments.destroy({
            where: {
                id: req.params.id,
            }
        })

        if (result === 1) {
            return res.status(204).json({ success: true, message: "ลบข้อมูลสำเร็จ" });
        } else {
            return res.status(404).json({ success: false, message: "ไม่พบข้อมูลสินค้า" });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: "ไม่พบข้อมูลครุภัณฑ์", error: error.message });
    }
});

module.exports = router;
