const express = require("express");
const router = express.Router();
const multer = require("multer");
const db = require("../models");
const auth = require("../middleware/auth.middleware");
const path = require("path");
const fs = require("fs");
const repairsService = require("../services/repairs.service");
const { Op } = require('sequelize');

router.get("/getRepairs", auth, async (req, res) => {
    try {
        const { username, firstname, lastname, status, requestdate, equipmentname, budgetyear, equipmentid } = req.query

        const whereCondi = {}

        if (username != null) {
            whereCondi['$users.username$'] = { [Op.like]: `%${username}%` }
        }

        if (firstname != null) {
            whereCondi['$users.firstname$'] = { [Op.like]: `%${firstname}%` }
        }

        if (lastname != null) {
            whereCondi['$users.lastname$'] = { [Op.like]: `%${lastname}%` }
        }
        
        if (equipmentname != null) {
            whereCondi['$equipments.equipment_name$'] = { [Op.like]: `%${equipmentname}%` }
        }
       
        if (equipmentid != null) {
            whereCondi['$equipments.equipment_id$'] = { [Op.like]: `%${equipmentid}%` }
        }

        if (requestdate != null) {
            const startDate = new Date(requestdate);
            const endDate = new Date(requestdate);
            endDate.setHours(23, 59, 59, 999);
            
            whereCondi.request_Date = { 
                [Op.gte]: startDate,
                [Op.lte]: endDate
            }
        }

        if (budgetyear != null) {
            const startDate = new Date(budgetyear);
            const endDate = new Date(budgetyear);
            endDate.setHours(23, 59, 59, 999);
            
            whereCondi['$equipments.budget_year$'] = { 
                [Op.gte]: startDate,
                [Op.lte]: endDate
            }
        }

        if (status != null) {
            whereCondi.status = { [Op.like]: `%${status}%` }
        }

        if (requestdate != null) {
            const startDate = new Date(requestdate);
            const endDate = new Date(requestdate);
            endDate.setHours(23, 59, 59, 999);

            whereCondi.request_date = {
                [Op.gte]: startDate,
                [Op.lte]: endDate
            };
        }

        const order = [
            ['id', 'DESC']
        ]

        const { rows, count } = await db.Repairs.findAndCountAll({
            order,
            include: [
                {
                    model: db.Users,
                    attributes: ['firstname', 'lastname', 'username'],
                    as: 'users'
                },
                {
                    model: db.Equipments,
                    attributes: ['equipment_id', 'equipment_name', 'budget_year'],
                    as: 'equipments'
                }
            ],
            where: whereCondi,
        });

        res.status(200).json({ success: true, count, results: rows });

    } catch (error) {
        res.status(500).json({ success: false, message: "เกิดข้อมผิดพลาดกรุราติดต่อผู้ดูแลระบบ", error: error.message })
    }
});


router.get("/getRepairsForPms/:id", auth, async (req, res) => {
    try {
        const query = await db.Repairs.findOne({
            order: [
                ['id', 'DESC']
            ],
            include: [
                {
                    model: db.Users,
                    attributes: ['firstname', 'lastname', 'username'],
                    as: 'users'
                },
                {
                    model: db.Equipments,
                    attributes: ['equipment_id', 'equipment_name', 'budget_year'],
                    as: 'equipments'
                }
            ],
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
    const service = new repairsService()
    try {
        const data = await db.Repairs.findOne({
            where: {
                id: req.params.id
            }
        })
        service.editRepairs(req, res, data);
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