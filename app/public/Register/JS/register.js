document.getElementById("form_s").addEventListener("submit",async(e)=>{
    e.preventDefault();//previene que al apretar el submit se recargue la pagina
    console.log(e.target.children.user.value)
    try{
        const res = await fetch("http://localhost:4000/api/register",{
            method: "POST",
            headers:{
                "Content-Type": "appliaction/json"
            },
            body: JSON.stringify({
                user: e.target.children.user.value,
                email: e.target.children.email.value,
                password: e.target.children.password.value,
                role: e.target.children.role.value,
            })
        });
        if(!res.ok){
            throw new Error("Error al registrar el usuario");
        }
        
        const data = await res.json();
        console.log("Registro exitoso", data);
    }catch(error){
        console.error("Error", error);
        alert("Hubo un problema al registrarse. Por Favor intente de nuevo");
    }
});
        
    
        

