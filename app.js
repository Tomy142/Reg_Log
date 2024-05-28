//Invocar modulos
const express = require('express')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
// Invoco clase express y se la asigno a una const
const app = express()
// Accedo a los metodos con app. y levanto server
app.listen(3000, ()=>{
    console.log('SERVER UP running in https://localhost:3000')
})