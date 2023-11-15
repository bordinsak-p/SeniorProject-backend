const jwt = require("jsonwebtoken");
const secretKey = require("../config/token.config.json");

module.exports = function authenticateToken(req, res, next) {
    const authHeader = req.header("Authorization");

    // ตรวจสอบว่ามี Authorization header หรือไม่
    if (!authHeader) {
        return res.status(401).json({ success: false, message: "ไม่สามารถเข้าเข้าสู่ระบบได้ กรุณาเข้าสู่ระบบใหม่อีกครั้ง" });
    }

    // แยก Authorization header เพื่อดึง token ออกมา
    const [bearer, token] = authHeader.split(' ');

    // ตรวจสอบว่าใช้ schema Bearer หรือไม่
    if (!bearer || bearer.toLowerCase() !== 'bearer' || !token) {
        return res.status(401).json({ success: false, message: "รูปแบบ Authorization ไม่ถูกต้อง" });
    }

    // ตรวจสอบ token โดยใช้ jwt.verify
    jwt.verify(token, secretKey['secretKey'], (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: "ไม่สามารถเข้าสู่ระบบได้ กรุณาเข้าสู่ระบบใหม่อีกครั้ง" });
        }
        req.user = user;
        next();
    });
}
