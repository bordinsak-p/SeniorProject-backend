const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secretKey = require("../config/token.config.json");

// import model เรียกใช้งานการ conncect database
const db = require("../models");

// ================ register ================
router.post("/register", async (req, res) => {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const setUsersData = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        username: req.body.username,
        password: hashPassword,
        role: req.body.role,
    };

    const haveEmail = await db.Users.findOne({
        where: { email: setUsersData.email },
    });
    if (haveEmail)
        return res
            .status(400)
            .json({ success: false, message: "อีเมลถูกใช้งานแล้ว" });

    try {
        const result = await db.Users.create(setUsersData);
        res.status(201).json({ success: true, result });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error,
            message: "ไม่สามารถเข้าสู่ระบบได้ ติดต่อผู้ดูแลระบบ",
        });
    }
});

// ================ login ================
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // select email
        const user = await db.Users.findOne({ where: { email: email } });

        // ถ้าไม่เจอข้อมูล
        if (!user)
            return res
                .status(401)
                .json({ success: false, message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });

        // decode password จาก req กับ db
        const isValidPassword = await bcrypt.compare(password, user["password"]);
        if (!isValidPassword)
            return res.status(401).json({ success: false, message: "รหัสผ่านไม่ถูกต้อง" });

        // check username in db
        const isValidUsername = await db.Users.findOne({
            where: { username: user["username"] },
        });
        if (!isValidUsername)
            return res.status(401).json({ success: false, message: "ไม่พบชื่อผู้ใช้ของท่าน" });

        // สร้าง jwt token
        const { id, username, role } = user;
        const token = jwt.sign({ id, username, role }, secretKey["secretKey"], {
            expiresIn: "2h",
        });

        res
            .status(200)
            .json({ success: true, message: "เข้าสู่ระบบสำเสร็จ", token: token });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "ไม่สามารถเข้าสู่ระบบได้ ติดต่อผู้ดูแลระบบ",
            error: error.message
        });
    }
});

module.exports = router;
