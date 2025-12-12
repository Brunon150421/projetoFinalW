const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const db = require("./configuracaoBancoDeDados");
const multer = require('multer');
const fs = require('fs').promises;

const app = express();

/*
Configuração do envio de arquivos (Parte de enviar exames pdf,jpeg e png)
*/
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Permitir receber dados do formulário
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuração do EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// Envia os arquivos para a pasta uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 
// Rotas GET
// 

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
    const success = req.query.success === 'true';
    res.render("cadastrarIdoso", { success: success });
});

// Enviar exames
app.get("/enviarExames", async (req, res) => {
    try {
        const [idosos] = await db.execute('SELECT id, nome, data_nascimento, idade FROM idosos ORDER BY nome');
        res.render("enviarExames", { idosos: idosos || [] });
    } catch (error) {
        console.error('❌ Erro ao buscar idosos:', error);
        res.render("enviarExames", { idosos: [] });
    }
});

// Visualizar exame 
app.get("/visualizarExames", async (req, res) => {
    try {
        console.log('✅ Buscando exames do banco...');
        
        const [exames] = await db.execute(`
            SELECT e.*, i.nome as nome_idoso 
            FROM exames e 
            INNER JOIN idosos i ON e.id_idoso = i.id 
            ORDER BY e.data_upload DESC
        `);
        
        console.log('✅ Exames encontrados:', exames);
        console.log('✅ Quantidade de exames:', exames.length);
        
        res.render("visualizarExames", { exames: exames || [] });
    } catch (error) {
        console.error('❌ Erro ao buscar exames:', error);
        res.render("visualizarExames", { exames: [] });
    }
});

// pagina de edição 
app.get("/editar-exame/:id", async (req, res) => {
    try {
        const exameId = req.params.id;
        
        const [exame] = await db.execute(`
            SELECT e.*, i.nome as nome_idoso 
            FROM exames e 
            INNER JOIN idosos i ON e.id_idoso = i.id 
            WHERE e.id = ?
        `, [exameId]);
        
        const [idosos] = await db.execute('SELECT id, nome FROM idosos ORDER BY nome');
        
        if (exame.length === 0) {
            return res.status(404).send("Exame não encontrado");
        }
        
        res.render("editarExame", { 
            exame: exame[0], 
            idosos: idosos || [] 
        });
        
    } catch (error) {
        console.error('❌ Erro ao carregar exame para edição:', error);
        res.status(500).send("Erro interno do servidor");
    }
});

//
// envio de cadastro de usuario COM VALIDAÇÃO DE EMAIL ÚNICO
//
app.post("/cadastro", async (req, res) => {
    const email = req.body.email;
    const senhaPura = req.body.password;

    try {
        //validação de email
        const [existingUsers] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        
        if (existingUsers.length > 0) {
            return res.status(400).send("Este email já está cadastrado!");
        }

        const senhaCriptografada = await bcrypt.hash(senhaPura, 10);

        const sql = "INSERT INTO users (email, password) VALUES (?, ?)";
        const [result] = await db.execute(sql, [email, senhaCriptografada]);
        console.log("Usuário inserido:", result);
        res.redirect("/");
    } catch (err) {
        console.log("Erro ao salvar usuário:", err);
        res.status(500).send("Erro no cadastro");
    }
});

//
// Login
//
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

        return res.render("telaInicial");

    } catch (err) {
        console.log("Erro no login:", err);
        res.send("Erro ao tentar logar");
    }
});

// 
// Cadastro do idoso
// 
app.post("/cadastrar-idoso", async (req, res) => {
    try {
        const { nome, data_nascimento, idade, informacoes } = req.body;

        if (!nome) {
            return res.status(400).send("Nome do idoso é obrigatório!");
        }

        const query = `
            INSERT INTO idosos (nome, data_nascimento, idade, informacoes) 
            VALUES (?, ?, ?, ?)
        `;
        
        const [result] = await db.execute(query, [
            nome,
            data_nascimento || null,
            idade || null,
            informacoes || ''
        ]);

        console.log("Idoso cadastrado com ID:", result.insertId);
        
        res.redirect("/cadastrarIdoso?success=true");

    } catch (error) {
        console.error('Erro ao cadastrar idoso:', error);
        res.status(500).send("Erro ao cadastrar idoso");
    }
});

// 
// Envido de exames, método Post (cudiado ao mexer) parte de envio de arrquivo
// 
app.post("/upload-exame", upload.array('arquivos'), async (req, res) => {
    try {
        const { idIdoso, nomeExame, categoria, dataExame, infoAd } = req.body;
        const arquivos = req.files;

        console.log('Dados recebidos:', { idIdoso, nomeExame, categoria, dataExame, infoAd });
        console.log('Arquivos:', arquivos);

        if (!idIdoso || !nomeExame || !categoria || !dataExame || !arquivos || arquivos.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Preencha todos os campos obrigatórios!' 
            });
        }

        for (const arquivo of arquivos) {
            const query = `
                INSERT INTO exames 
                (id_idoso, nome_exame, categoria, data_exame, informacoes_adicionais, nome_arquivo, caminho_arquivo) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            
            await db.execute(query, [
                idIdoso,
                nomeExame,
                categoria,
                dataExame,
                infoAd || '',
                arquivo.originalname,
                arquivo.filename
            ]);
        }

        res.json({ 
            success: true, 
            message: 'Exame(s) salvo(s) com sucesso!' 
        });

    } catch (error) {
        console.error('Erro ao salvar exame:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// ✅ NOVA ROTA: Edição de exames (RF08)
app.post("/editar-exame/:id", async (req, res) => {
    try {
        const exameId = req.params.id;
        const { idIdoso, nomeExame, categoria, dataExame, infoAd } = req.body;

        if (!idIdoso || !nomeExame || !categoria || !dataExame) {
            return res.status(400).json({ 
                success: false, 
                message: 'Preencha todos os campos obrigatórios!' 
            });
        }

        const query = `
            UPDATE exames 
            SET id_idoso = ?, nome_exame = ?, categoria = ?, data_exame = ?, informacoes_adicionais = ?
            WHERE id = ?
        `;
        
        await db.execute(query, [
            idIdoso,
            nomeExame,
            categoria,
            dataExame,
            infoAd || '',
            exameId
        ]);

        res.json({ 
            success: true, 
            message: 'Exame atualizado com sucesso!' 
        });

    } catch (error) {
        console.error('❌ Erro ao editar exame:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// rota de exclusão 
app.delete("/excluir-exame/:id", async (req, res) => {
    try {
        const exameId = req.params.id;

        // 1. Buscar informações do exame para excluir o arquivo
        const [exame] = await db.execute('SELECT caminho_arquivo FROM exames WHERE id = ?', [exameId]);
        
        if (exame.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Exame não encontrado' 
            });
        }

        // Excluir arquivo físico
        const caminhoArquivo = path.join(__dirname, '../uploads', exame[0].caminho_arquivo);
        try {
            await fs.unlink(caminhoArquivo);
            console.log('✅ Arquivo excluído:', caminhoArquivo);
        } catch (fileError) {
            console.warn('⚠️ Arquivo não encontrado para exclusão:', caminhoArquivo);
        }

        // Excluir registro do banco
        await db.execute('DELETE FROM exames WHERE id = ?', [exameId]);

        res.json({ 
            success: true, 
            message: 'Exame excluído com sucesso!' 
        });

    } catch (error) {
        console.error('❌ Erro ao excluir exame:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

/**
 * Parte estatica ligação com a pasta public que liga a parte de estilização
 **/
app.use(express.static("./public"));

/**
 * porta do localhost - escrever "localhost:5000" para abrir o servidor
 */
const port = 5000;
app.listen(port, () => {
    console.log(`Server Running on port: ${port}`);
});