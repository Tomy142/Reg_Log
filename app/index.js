import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from "./routes/auth.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";


const app = express();

// Obtener la ruta del directorio actual (donde está el archivo index.js)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"../views/pages"));

const protect =(req, res, next)=>{
    const token =req.cookies.token;
    if(!token){
        console.log("No se encontro token, redirigiendo al /login");
        return res.redirect("/login");
    }
    try{
        const decoded =jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log("Token valido, usuario:", req.user);
        next();
    }catch(error){
        console.error("Token invalido:", error);
        res.redirect("/login");
    }
};

app.use("/", authRoutes);

app.get("/",(req, res)=>{
    res.render("welcome");
});

app.get("/register",(req, res)=>{
    res.render("register");
});

app.get("/login",(req, res)=>{
    res.render("login");
});

app.get("/dashboard", protect,(req, res)=>{
    res.render("dashboard",{user: req.user});
});

app.get("/edit-content", protect,(req, res)=>{
    res.render("edit_content");
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
