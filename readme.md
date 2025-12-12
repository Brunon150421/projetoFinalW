Documentação Completa - Sistema Examoteca
VISÃO GERAL
O Examoteca é um sistema web completo para gerenciamento de exames médicos de idosos, desenvolvido para cuidadores e familiares com interface intuitiva e segurança de dados.

PRÉ-REQUISITOS
Software Necessário:
XAMPP (Apache + MySQL)

Node.js versão 14+

NPM

Navegador web

INSTALAÇÃO PASSO A PASSO
1. INSTALAR XAMPP
Baixe em: https://www.apachefriends.org/

Instale marcando Apache, MySQL e phpMyAdmin

Inicie o XAMPP Control Panel

Inicie Apache e MySQL (deve ficar verde)

2. INSTALAR NODE.JS
Baixe em: https://nodejs.org/ (versão LTS)

Verifique instalação no terminal:

bash
node --version
npm --version
3. CRIAR BANCO DE DADOS
Acesse: http://localhost/phpmyadmin

Clique em "Novo"

Nome do banco: examoteca

Cole e execute este SQL:

sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    perfil ENUM('cuidador', 'familiar') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE idosos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    data_nascimento DATE,
    idade INT,
    condicoes_medicas TEXT,
    informacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exames (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_idoso INT NOT NULL,
    nome_exame VARCHAR(255) NOT NULL,
    categoria ENUM('sangue', 'imagem', 'consulta', 'ressonancia', 'tomografia') NOT NULL,
    data_exame DATE NOT NULL,
    especialidade_medica VARCHAR(100),
    informacoes_adicionais TEXT,
    nome_arquivo VARCHAR(255) NOT NULL,
    caminho_arquivo VARCHAR(500) NOT NULL,
    data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_vencimento DATE,
    FOREIGN KEY (id_idoso) REFERENCES idosos(id) ON DELETE CASCADE
);
4. ESTRUTURA DE PASTAS
Crie esta estrutura na pasta do projeto:

text
examoteca/
├── uploads/           (pasta para arquivos)
├── views/             (telas do sistema)
├── public/            (CSS e imagens)
├── server.js          (arquivo principal)
└── package.json       (configuração)
5. ARQUIVOS NECESSÁRIOS
package.json:

json
{
  "name": "examoteca",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "ejs": "^3.1.9",
    "mysql2": "^3.6.5",
    "bcrypt": "^5.1.1",
    "multer": "^1.4.5"
  }
}
configuracaoBancoDeDados.js:

javascript
const mysql = require('mysql2');
const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'examoteca',
  connectionLimit: 10
});
module.exports = connection.promise();
server.js: (use o código completo corrigido que foi fornecido anteriormente)

6. INSTALAR DEPENDÊNCIAS
Abra terminal na pasta do projeto e execute:

bash
npm install
EXECUTANDO O SISTEMA
INICIAR SERVIDORES (SEMPRE NESTA ORDEM):
XAMPP:

Abra XAMPP Control Panel

Inicie Apache e MySQL

Mantenha aberto

SISTEMA EXAMOTECA:

bash
cd caminho/para/examoteca
npm start
Deve aparecer: "Server Running on port: 5000"

ACESSAR SISTEMA:

Abra navegador

Acesse: http://localhost:5000

FLUXO DE USO
Primeiro Acesso:

Cadastre-se como cuidador ou familiar

Faça login

Cadastro de Idoso:

Clique em "Cadastrar Idoso"

Preencha dados básicos

Enviar Exames:

Clique em "Enviar Exames"

Selecione o idoso

Faça upload do arquivo (PDF, JPEG, PNG)

Preencha informações do exame

Gerenciar Exames:

Clique em "Visualizar Exames"

Veja todos os exames cadastrados

Use botões "Editar" ou "Excluir"

Clique "Ver Arquivo" para visualizar

FUNCIONALIDADES IMPLEMENTADAS
✅ Cadastro de usuário - Com perfil (cuidador/familiar)
✅ Login seguro - Com autenticação
✅ Cadastro de idosos - Dados completos
✅ Upload de exames - PDF, imagens, vinculado a idoso
✅ Classificação - Por tipo, data, especialidade
✅ Visualização - Lista com filtros
✅ Edição - Alterar dados do exame
✅ Exclusão - Com confirmação de segurança
✅ Segurança - Senhas criptografadas, validações

SOLUÇÃO DE PROBLEMAS COMUNS
Erro de porta:

Altere no server.js: const port = 5001

Erro de banco de dados:

Verifique se MySQL está rodando no XAMPP

Confirme nome do banco: "examoteca"

Arquivo não sobe:

Verifique se pasta "uploads" existe

Confirme formato (PDF, JPEG, PNG)

Página não carrega:

Verifique se Node.js está executando (npm start)

Confirme se Apache está rodando no XAMPP

BACKUP E MANUTENÇÃO
Backup do banco:

Acesse phpMyAdmin

Selecione banco "examoteca"

Clique em "Exportar" → SQL → Executar

Logs do sistema:

Verifique terminal onde Node.js está rodando

Todos os erros aparecem em tempo real

SEGURANÇA IMPLEMENTADA
Senhas criptografadas com bcrypt

Validação de tipos de arquivo

Autenticação obrigatória

Proteção contra SQL injection

Validação de dados de entrada

CONTATOS E SUPORTE
Mantenha sempre:

XAMPP aberto e funcionando

Terminal Node.js executando

Navegador aberto no localhost:5000

Sistema desenvolvido para melhor gestão da saúde de idosos! 🚀

