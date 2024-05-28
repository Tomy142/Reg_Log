const mysql = require('mysql')

// accedo a los metodos de mysql. para crear conexion
const connection = mysql.createConnection({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_DATABASE,
})

connection.connect( (error)=>{
    if(error){
       
    }
    console.log('Conexion exitosa')
})

// para poder utilizar la conexion
module.exports = connection