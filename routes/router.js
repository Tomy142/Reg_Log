// Definir las rutas para las vistas y rutas para llamar al controlador
const express = require('express')
const router = express.Router() 

const connection = require('../database/db')
//Apuntar a una ruta del server
router.get('/',(req, res)=>{
   
    res.render('index')
})

//Ruta para el login
router.get('/login',(req, res)=>{
    res.render('login')

    
})

router.get('/register',(req, res)=>{
    res.render('register')

    
})

module.exports = router