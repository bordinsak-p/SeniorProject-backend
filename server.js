const express = require('express')
const app = express()
const cors = require('cors')

// middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(cors())


app.use(require('./controllers/users.controller'))


const PORT = process.env.PORT || 8080
app.listen(PORT, () =>  {
    const env = `${process.env.NODE_ENV || 'development'}`
    console.log(`App listening on port ${PORT}`);
    console.log(`App listening on env ${env}`);
    console.log(`Press Ctrl+C to quit.`);
});