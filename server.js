const express = require('express')
const app = express()
const cors = require('cors')

// middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin: ["http://localhost:4200"], // กำหนดโดเมนที่ได้รับอนุญาต
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // กำหนด HTTP methods ที่อนุญาต
    credentials: true, // อนุญาตการส่งค่า Cookie ร่วมกับ requests
    optionsSuccessStatus: 204, // กำหนด HTTP status code สำหรับการ preflight request
    allowedHeaders: "Content-Type,Authorization", // กำหนด HTTP headers ที่อนุญาต
}))

// route
// authen
app.use(require('./controllers/auth_users.controller'))

// equipemnt
app.use(require('./controllers/equipment.controller'))

// repairs
app.use(require('./controllers/repairs.controller'))


// start on port
const PORT = process.env.PORT || 8080
app.listen(PORT, () =>  {
    const env = `${process.env.NODE_ENV || 'development'}`
    console.log(`App listening on port ${PORT}`);
    console.log(`App listening on env ${env}`);
    console.log(`Press Ctrl+C to quit.`);
});