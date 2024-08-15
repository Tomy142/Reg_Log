const express = require('express')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')

const app = express()

// setear motor de plantillas
app.set('view engine', 'ejs')

//setear carpeta public archivos estaticos
app.use(express.static('public'))

//para procesar datos enviados desde forms
app.use(express.urlencoded({extended:true}))
app.use(express.json())

//seteamos las variables de entorno
dotenv.config({path:'./env/.env'})

//para poder usar las cookies
//app.use(cookieParser)

app.use('/', require('./routes/router'))


app.listen(3000, ()=>{

    console.log('SERVER UP running in http://localhost:3000')
})