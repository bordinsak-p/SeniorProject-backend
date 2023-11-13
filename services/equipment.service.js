const path = require("path");
const fs = require("fs");
const multer = require("multer");
const db = require("../models");
const multerConfig = require("./multer.config");
const upload = multer(multerConfig.config).single(multerConfig.keyUpload);

module.exports = class ShareServices {
    checkImageAndUpdate(req, res, data) {
        upload(req, res, async (next) => {
            const transaction = await db.sequelize.transaction();
            const { locationname, branchinfo, roomnumber, equimentname, description } = req.body

            if (next instanceof multer.MulterError) {
                console.log(`error: ${JSON.stringify(next)}`);
                return res.status(500).json({ message: next });
            }

            /*  
                /*
            */

            // console.log("ไฟล์เก่า :",data.image);

            if (req.file) {
                if (data.image) {
                    await fs.unlink(path.join(__dirname, "../images", data.image), (err) => {
                        if (err) {
                            console.log("ไม่สามารถลบไฟล์ได้ :",err); 
                        } else {
                            console.log("ลบไฟล์สำเร็จ");
                        }
                    })

                    // data.image = req.file.filename
                }
            }

            // console.log("ไฟล์ใหม่ :",data.image);

            try {
                const [updLocation] = await db.Locations.update({
                    location_name: locationname,
                    branch_info: branchinfo,
                    room_number: roomnumber
                }, {
                    where: {
                        id: data.id
                    }
                }, { transaction });

                const [updEequipment] = await db.Equiments.update({
                    equiment_name: equimentname,
                    description: description,
                    image: req.file ? req.file.filename : undefined,
                    buget_year: new Date(),
                }, {
                    where: {
                        id: data.id
                    }
                })

                // Commit transaction
                await transaction.commit();

                if (updEequipment > 0) {
                    const resultUpd = await db.Equiments.findByPk(
                        data.id
                    );
                    res.status(200).json({ success: true, message: "แก้ไขข้อมูลสำเร็จ", results: resultUpd })
                } else {
                    throw new Error("ไม่สามารถแก้ไขข้อมูลได้");
                }

            } catch (error) {
                console.log(error.message);
                await transaction.rollback();
                res.status(500).json({ success: false, message: "ไม่สามารถแก้ไขข้อมูลได้", error: error.message })
            }

            /*   
            res.json({body: req.body, query: data.image});
                */
            //
        });
    }
}