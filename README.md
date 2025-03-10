Proyecto UnMardeMusicas

    Configuracion:

        -Una vez creada la carpeta principal, usamos la terminal o cmd para verificar si tenemos instalado nodeJS en nuestro sistema: node -v
            En caso de no tenerlo instalado consutar: https://nodejs.org/en/download

            Ya instalado, hay que inicializar node en el proyecto : npm init -y
                En caso de presentar error de ejecucion de scripts consultar este link:
                    https://www.youtube.com/watch?v=9HYQsCjKAmg

        -Luego para añadir las librerias ejecutamos en la consola:  npm i dotenv express bcryptjs cookie-parser jsonwebtoken

        -Instalamos la dependencia de desarrollo: npm i nodemon --save-dev
            Dentro del package.json en scripts pegamos este script:
                "dev": "nodemon --exec node app/index.js"
        -Instalamos:
            npm install mysql2
            npm install multer
            npm install ejs