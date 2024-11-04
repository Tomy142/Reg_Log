import bcryptjs from "bcryptjs";

async function login(req,res){

}

async function register(req,res){
    try{
        console.log(req.body)
        const user = req.body.user;
        const password = req.body.password;
        const email = req.body.email;
        const role = req.body.role;

        if(!user || !password || !email || !role){
            return res.status(400).json({error: "Todos los campos son obligatorios"});
        }
    }catch(error){
        console.error("Error al registrar usuario: ", error);
        return res.status(500).json({error: "Hubo un error al registrar el usuario"})
    }
    //agregar validacion con la DB

    //proceso para encriptar mas la contraseña
    const salt = bcryptjs.genSalt(5);
    const hashPassword = bcryptjs.hash(password, salt);

    // crear nuevo usuario
}

export const methods = {
    login, 
    register
}