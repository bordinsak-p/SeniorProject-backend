const express = require("express");
const router = express.Router();
const multer = require("multer");
const db = require("../models");
const auth = require("../middleware/auth.middleware");
const multerConfig = require("../services/multer.config");
const path = require("path");
const fs = require("fs");
const upload = multer(multerConfig.config).single(multerConfig.keyUpload);
const equipment = require('../services/equipment.service');
const { Op } = require('sequelize');


router.get("/getEquipment", auth, async (req, res) => {
    try {   
        const { equipmentId, equipmentName, locationName, branchInfo, roomNumber, budgetYear } = req.query;

        const whereCondition = {};

        if (equipmentId != null) {
            whereCondition.equipment_id = { [Op.like]: `%${equipmentId}%` };
        }

        if (equipmentName != null) {
            whereCondition.equipment_name = { [Op.like]: `%${equipmentName}%` };
        }


        // ใน Sequelize, การใช้ Op.gte และ Op.lte ในกรณีที่ต้องการดึงข้อมูลที่มีช่วงวันที่ที่กำหนดอาจจะต้องปรับเปลี่ยนการใช้คุณลักษณะของ where clause ในการสร้าง query เพื่อให้ได้ผลลัพธ์ที่ถูกต้อง.
        // ในกรณีนี้, คุณสามารถใช้ Sequelize literal และ operator or เพื่อสร้างคำสั่ง where ที่ถูกต้อง

        //     where
        // (`Equipments`.`budget_year` >= '2023-11-22 07:00:00' or `Equipments`.`budget_year` <= '2023-11-22 07:00:00')
        
        // if (budgetYear != null) {
        //     whereCondition.budget_year = { 
        //         [Op.and]: [
        //             { [Op.gte]: new Date(budgetYear) },
        //             { [Op.lte]: new Date(budgetYear) }
        //         ]
        //     };
        // }

        if (budgetYear != null) {
            const startDate = new Date(budgetYear);
            const endDate = new Date(budgetYear);
            endDate.setHours(23, 59, 59, 999); // Set เวลาเป็นสิ้นสุดของวัน
        
            whereCondition.budget_year = {
                [Op.gte]: startDate,
                [Op.lte]: endDate
            };
        }

        if (locationName != null) {
            whereCondition['$Location.location_name$'] = { [Op.like]: `%${locationName}%` };
        }

        if (branchInfo != null) {
            whereCondition['$Location.branch_info$'] = { [Op.like]: `%${branchInfo}%` };
        }

        if (roomNumber != null) {
            whereCondition['$Location.room_number$'] = { [Op.like]: `%${roomNumber}%` };
        }

        const order = [['id', 'DESC']];

        const { rows, count } = await db.Equipments.findAndCountAll({
            order,
            include: [{
                model: db.Locations,
                attributes: ['location_name', 'branch_info', 'room_number'],
            }],
            where: whereCondition,
        });

        res.status(200).json({ success: true, count, results: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get("/getEquipmentForPrm/:id", auth, async (req, res) => {

    try {
        const result = await db.Equipments.findOne({
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

router.post("/addEquipment", auth, async (req, res) => {
    upload(req, res, async (next) => {
        if (next instanceof multer.MulterError) {
            console.log(`error: ${JSON.stringify(next)}`);
            return res.status(500).json({ message: next });
        }

        const { locationname, branchinfo, roomnumber, equipmentid, equipmentname, description } = req.body;

        const transaction = await db.sequelize.transaction();

        try {
            const loc = await db.Locations.create({
                location_name: locationname,
                branch_info: branchinfo,
                room_number: roomnumber
            }, { transaction });

            const equ = await db.Equipments.create({
                equipment_id: equipmentid,
                equipment_name: equipmentname,
                location_id: loc["dataValues"].id,
                description: description,
                image: req.file ? req.file.filename : undefined,
                budget_year: new Date(),
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

router.put("/editEquipment/:id", auth, async (req, res) => {
    const service = new equipment();
    try {
        const data = await db.Equipments.findOne({
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

router.delete("/delEquipment/:id", auth, async (req, res) => {
    try {
        const query = await db.Equipments.findOne({
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
 
        const result = await db.Equipments.destroy({
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
