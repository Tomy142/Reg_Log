import db from "../config/db.js";
import bcrypt from "bcryptjs";

const createUser = async(username, password, email, role)=>{
    const hashedPassword = await bcrypt.hash(password, 10);
    const[result] = await db.execute(
        "INSERT INTO users ( username, password, email, role) VALUES (?,?,?,?)", 
        [username, hashedPassword, email, role]
    );
    return result.insertId;
};

const findUserByEmail = async(email) =>{
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0];
};

const findUserByUsername = async(username)=>{
    const [rows] = await db.execute("SELECT * FROM users  WHERE username = ?",[username]);
    return rows[0];
}

export default {createUser, findUserByEmail, findUserByUsername};