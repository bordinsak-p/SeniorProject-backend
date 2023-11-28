const express = require("express");
const router = express.Router();
const db = require("../models");
const auth = require("../middleware/auth.middleware");
const bcrypt = require("bcrypt");
const { Op } = require('sequelize');

// Add User
router.post('/addUsers', async (req, res) => {
    try {
        const { firstname, lastname, email, username, password, role } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db.Users.create({
            firstname: firstname,
            lastname: lastname,
            email: email,
            username: username,
            password: hashedPassword,
            role: role,
        });

        res.status(201).json({
            success: true,
            message: "เพิ่มข้อมูลสมาชิกสำเร็จ",
            user: newUser
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "ไม่สามารถดำเนินการได้", error: error.message });
    }
});


//Get Users 
router.get("/getUsers", auth, async (req, res) => {
    try{
        const { firstname, lastname, email, role, createAt } = req.query

        const whereCondi = {}

        if(firstname != null) {
            whereCondi.firstname = { [Op.like]: `%${firstname}%` }
        }
        
        if(lastname != null) {
            whereCondi.lastname = { [Op.like]: `%${lastname}%` }
        }
        
        if(email != null) {
            whereCondi.email = { [Op.like]: `%${email}%` }
        }
        
        if(role != null) {
            whereCondi.role = { [Op.like]: `%${role}%` }
        }
        
        if(createAt != null) {
            const startDate = new Date(createAt);
            const endDate = new Date(createAt);
            endDate.setHours(23, 59, 59, 999); // Set เวลาเป็นสิ้นสุดของวัน
        
            whereCondi.createAt = {
                [Op.gte]: startDate,
                [Op.lte]: endDate
            };
        }

        const order = [
            ['id', 'DESC']
        ]

        const { rows, count } = await db.Users.findAndCountAll({
            order,
            where: whereCondi,
        });

        res.status(200).json({success: true, count, results: rows}) 

    } catch(error) {
        res.status(500).json({success: false, message:"เกิดข้อผิดพลาด", error:error.message})
    }
});


// Get Users By {{Id}}
router.get("/getUsersForPms/:id", auth, async (req, res) => {
    try{
        const query = await db.Users.findOne({
            where: {
                id: req.params.id
            }
        })

        if(!query) return res.status(404).json({success: false, message: "ไม่พบข้อมูลสมาชิกที่ค้นหา"})
    
        res.status(200).json({success:true, results: query})

    } catch(error) {
        res.status(500).json({success:false, message:"เกิดข้อผิดพลาด", error: error.message})
    }
});

//Update User
router.put('/updateUsers/:id', auth, async (req, res) => {
    try {
        const userId = req.params.id;
        const updatedUserData = req.body;

        // เช็คถ้ามีการแก้ไขรหัสผ่าน
        if (updatedUserData.password) {
            // hash password ก่อนอัพเดท DB
            const hashedPassword = await bcrypt.hash(updatedUserData.password, 10);
            updatedUserData.password = hashedPassword;
        }

        const [updatedRowsCount] = await db.Users.update(updatedUserData, {
            where: {
                id: userId
            }
        });

        // เช็ค
        if (updatedRowsCount > 0) {
            res.status(200).json("อัพเดทข้อมูลสมาชิกสำเร็จ");
        } else {
            res.status(404).json("ไม่มีสมาชิกนี้หรือไม่สามารถแก้ไขข้อมูลได้");
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด", error: error.message });
    }
});

//Delete User
router.delete("/delUsers/:id", auth, async (req, res) => {
    try {
        const query  = db.Users.findOne({
            where: {
                id: req.params.id
            }
        });

        if(!query) return res.status(404).json({ success: false, message: "ไม่พบข้อมูล"});

        const result = await db.Users.destroy({
            where: {
                id: req.params.id
            }
        });

        if (result === 1) {
            return res.status(204).json({ success: true, message: "ลบข้อมูลสำเร็จ" });
        } else {
            return res.status(404).json({ success: false, message: "ไม่พบข้อมูล" });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดไม่สามารถลบข้อมูลได้", error: error.message });
    }
}); 

//Reset Password
router.post('/resetPassword', async (req, res) => { 
    try {
        const { email, password } = req.body;
        // เช็ค mail
        const user = await db.Users.findOne({
            where: {
                email: email
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'ไม่พบอีเมล์นี้' });
        }

        // hash the mother fucking password 
        const hashedPassword = await bcrypt.hash(password, 10);

        // แก้ไขการhashก่อนเพิ่มลง DB
        const updatedUser = await db.Users.update(
            { password: hashedPassword },
            {
                where: {
                    email: email
                }
            }
        );

        // เช็ค
        if (updatedUser[0] === 1) {
            return res.status(200).json({ success: true, message: 'รีเซ็ทรหัสผ่านสำเร็จ' });
        } else {
            return res.status(500).json({ success: false, message: 'รีเซ็ตรหัสผ่านไม่สำเร็จ' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดไม่สามารถรีเซ็ทรหัสผ่านได้', error: error.message });
    }
});


module.exports  = router;