const express = require("express");
const router = express.Router();
const multer = require("multer");
const db = require("../models");
const auth = require("../middleware/auth.middleware");
const multerConfig = require("../services/multer.config");
const path = require("path");
const fs = require("fs");
const upload = multer(multerConfig.config).single(multerConfig.keyUpload);
const repairsService = require("../services/repairs.service")

router.get("/getRepairs", auth, async (req, res) => {
    try {
        const query = await db.Repairs.findAll({
            order: [
                ['id', 'DESC']
            ]
        })

        if(!query) return res.status(404).json({ success: false, message: "ไม่พบข้อมูลบันทึกการแจ้งซ่อม"});

        res.status(200).json({ success: true, resutls: query })

    } catch (error) {
        res.status(500).json({ success: false, message: "เกิดข้อมผิดพลาดกรุราติดต่อผู้ดูแลระบบ", error: error.message })
    }
}); 

router.get("/getRepairsForPms", auth, async (req, res) => {
    try {
        const query = await db.Repairs.findOne({
            where: {
                id: req.params.id
            }
        })

        if(!query) return res.status(404).json({success: false, message: "ไม่พบข้อมูลบันทึกการแจ้งซ่อม"})

        res.status(200).json({ success: true, resutls: query })

    } catch (error) {
        res.status(500).json({ success: false, message: "เกิดข้อมผิดพลาดกรุราติดต่อผู้ดูแลระบบ", error: error.message })
    }
}); 

router.post("/addRepairs/:id", auth, async (req, res) => {
    const service = new repairsService();
    const accessToken = req.user;
    try {
        service.addRepairs(req, res, req.params.id, accessToken);
    } catch (error) {
        res.status(500).json({ success: false, message: "เกิดข้อมผิดพลาดกรุราติดต่อผู้ดูแลระบบ", error: error.message })        
    }
}); 

router.put("/editRepairs/:id", auth, async (req, res) => {
    try {
        const data = await db.Repairs.findOne({
            where: {
                id: req.params.id
            }
        })
        
    } catch (error) {
        res.status(500).json({ success: false, message: "เกิดข้อมผิดพลาดกรุราติดต่อผู้ดูแลระบบ", error: error.message })        
    }
}); 

router.delete("/delRepairs/:id", auth, async (req, res) => {
    try {
        const query  = db.Repairs.findOne({
            where: {
                id: req.params.id
            }
        });

        if(!query) return res.status(404).json({ success: false, message: "ไม่พบข้อมูลบันทึกการแจ้งซ่อม"});

        if(query.image) {
            fs.unlink(path.join(__dirname, "../images", query.image), (err) => {
                if(err) {
                    console.log("ไม่สามารถลบไฟล์ได้ :",err);
                } else {
                    console.log("ลบไฟล์สำเร็จ");
                }
            });
        }

        const result = await db.Repairs.destroy({
            where: {
                id: req.params.id
            }
        });

        if (result === 1) {
            return res.status(204).json({ success: true, message: "ลบข้อมูลสำเร็จ" });
        } else {
            return res.status(404).json({ success: false, message: "ไม่พบข้อมูลบันทึกการแจ้งซ่อม" });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดไม่สามารถลบข้อมูลได้", error: error.message });
    }
}); 

module.exports = router;