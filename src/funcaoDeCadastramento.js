const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const db = require("./configuracaoBancoDeDados");

const app = express();

// Permitir receber dados do formulário
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuração do EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // <<< IMPORTANTE

// ---------------------------
// ROTAS GET
// ---------------------------

// Página inicial = login
app.get("/", (req, res) => {
    res.render("login");
});

// Página de cadastro
app.get("/cadastro", (req, res) => {
    res.render("cadastro");
});

// Tela inicial após login
app.get("/telaInicial", (req, res) => {
    res.render("telaInicial");
});

// Cadastrar idoso
app.get("/cadastrarIdoso", (req, res) => {
    res.render("cadastrarIdoso");
});

// Enviar exames
app.get("/enviarExames", (req, res) => {
    res.render("enviarExames");
});

// Visualizar exames
app.get("/visualizarExames", (req, res) => {
    res.render("visualizarExames");
});

// ---------------------------
// CADASTRO (POST)
// ---------------------------
app.post("/cadastro", async (req, res) => {

    const email = req.body.email;
    const senhaPura = req.body.password;

    const senhaCriptografada = await bcrypt.hash(senhaPura, 10);

    try {
        const sql = "INSERT INTO users (email, password) VALUES (?, ?)";
        const [result] = await db.execute(sql, [email, senhaCriptografada]);

        console.log("Usuário inserido:", result);

        res.redirect("/");
    } catch (err) {
        console.log("Erro ao salvar usuário:", err);
        res.send("Erro no cadastro");
    }
});

// ---------------------------
// LOGIN (POST)
// ---------------------------
app.post("/login", async (req, res) => {

    const email = req.body.email;
    const senha = req.body.password;

    try {
        const sql = "SELECT * FROM users WHERE email = ?";
        const [rows] = await db.execute(sql, [email]);

        if (rows.length === 0) {
            return res.send("Usuário não encontrado");
        }

        const usuario = rows[0];

        const senhaOk = await bcrypt.compare(senha, usuario.password);

        if (!senhaOk) {
            return res.send("Senha incorreta");
        }

        // Login OK → enviar para tela inicial
        return res.render("telaInicial");

    } catch (err) {
        console.log("Erro no login:", err);
        res.send("Erro ao tentar logar");
    }
});

// ---------------------------
// ARQUIVOS ESTÁTICOS
// ---------------------------
app.use(express.static("public"));

// ---------------------------
// SERVIDOR
// ---------------------------
const port = 5000;
app.listen(port, () => {
    console.log(`Server Running on port: ${port}`);
});
