import express from "express";
//Arreglar dirname
import path from 'path';
import { fileURLToPath } from "url";
import { methods as authentication} from "./public/Controllers/authy_controller.js";
//exec node: npm run dev
const __dirname= path.dirname(fileURLToPath(import.meta.url));

//Server
const app = express();
app.set("port", 4000);
app.listen(app.get("port"));
console.log("Servidor corriendo en puerto", app.get("port"));

//Configuracion
app.use(express.static(path.join(__dirname,'public' )));
app.use(express.json());

//Motor de plantillas
//app.set('view engine', 'ejs');

//


//Rutas

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/Register/HTML/register.html'));
});

// Ruta para /login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/Login/HTML/login.html'));
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/Welcome/HTML/welcome.html'));
});



/*app.get("/", (req, res) => res.sendFile(path.join(__dirname, 'pages', 'Welcome', 'HTML', 'welcome.html')));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, 'pages', 'Login', 'HTML', 'login.html')));
app.post("/api/login",authentication.login);
app.get("/register", (req, res) => res.sendFile(path.join(__dirname, 'pages', 'Register', 'HTML', 'register.html')));
app.post("/api/register",authentication.register);
app.get("/dashboard", (req, res) => res.sendFile(path.join(__dirname, 'pages', 'Dashboard', 'HTML', 'dashboard.html')));*/