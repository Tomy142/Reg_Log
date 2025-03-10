import express, { Router } from "express";
import authController from "../controllers/authy_controller.js"; 
import {uploadMusic, uploadProfile} from "../config/multer.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const protect =(req, res, next)=>{
    const token =req.cookies.token;
    if(!token){
        console.log("No se encontró token, redirigiendo al /login");
        return res.redirect("/login");
    }
    try{
        const decoded =jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log("Token valido, usuario:", req.user);
        next();
    }catch(error){
        console.error("Token inválido:", error);
        res.redirect("/login");
    }
};

const protectListener = (req, res, next) => {
    protect(req, res, () => {
        if ( req.user.role !== "listener") {
            return res.status(403).render("403", { error: "Solo los oyentes pueden acceder a esta página."});
        }
        next();
    });
};


router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.get("/add-content", protect, (req, res)=>{
    res.render("add_M");
});
router.post("/add-content", protect, uploadMusic.single("upload_file"), authController.addMusic);
router.post("/add-album", protect, authController.addAlbum);
router.get("/edit-content" , protect, authController.editContent);
router.post("/edit-content" , protect, authController.editContent);
router.get("/dashboard", protect, authController.dashboard);
router.get("/profile", protect, authController.profile);
router.post("/profile", protect, uploadProfile.single("upload_pic"), authController.updateProfile);
router.get("/profile/:username", authController.publicProfile);
router.get("/search", protectListener, authController.search);

export default router;