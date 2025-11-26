const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",    // no XAMPP a senha é vazia
    database: "Login",
    port: 3306
});

pool.getConnection()
    .then(() => {
        console.log("Conexão com MySQL (XAMPP) estabelecida");
    })
    .catch(err => {
        console.log("Erro ao conectar no MySQL:", err);
    });

module.exports = pool;
