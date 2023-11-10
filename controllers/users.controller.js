const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");

// จัดการส่งข้อมูลแบบ formdata
const multer = require("multer");

// import model เรียกใช้งาน การ conncect database
const db = require("../models");

router.post("/register", async (req, res) => {
  const hashPassword = await bcrypt.hash(req.body.password, 10);

  const userBean = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    username: req.body.username,
    password: hashPassword,
    role: req.body.role,
  };

  const haveEmail = await db.Users.findOne({
    where: { email: userBean.email },
  });
  if (haveEmail)
    return res
      .status(400)
      .json({ success: false, message: "อีเมลถูกใช้งานแล้ว" });

  try {
    const result = await db.Users.create(userBean);
    res.status(201).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.Users.findOne({ where: { email: email } });
    if (!user)
      return res
        .status(401)
        .json({ success: false, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return res
        .status(401)
        .json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });

    res.status(200).json({ success: true, message: "เข้าสู่ระบบสำเสร็จ" });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ success: false, error: "ไม่สามารถเข้าสู่ระบบได้ ติดต่อผู้ดูแลระบบ" });
  }
});

module.exports = router;
