//Invocar modulos
const express = require('express')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')

// Invoco clase express y se la asigno a una const
const app = express()

//Seteamos el motor de plantillas
app.set('view engine','ejs')

//Seteamos la carpeta public para archivos staticos
app.use(express.static('public'))

//config node para proceso de datos
app.use(express.urlencoded({extended:true}))
app.use(express.json())

//Setear variables de entorno
dotenv.config({path:'./env/.env'})

//Setear cookies
//app.use(cookieParser)

//Apuntar a una ruta del server
app.get('/',(req, res)=>{
    res.render('index')
})

// Accedo a los metodos con app. y control status server
app.listen(3000, ()=>{
    console.log('SERVER UP running in https://localhost:3000')
})