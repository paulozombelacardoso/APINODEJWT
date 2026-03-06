import express from 'express';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;


//Cadastro
router.post('/cadastro', async (req, res) => {
    try {
        const user = req.body;

        // Validação dos campos obrigatórios
        if (!user.name || !user.email || !user.password) {
            return res.status(400).json({ message: "Campos obrigatórios em falta: name, email, password" });
        }

        //Trabalhando com bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(user.password, salt);
        const userDB = await prisma.user.create({
            data: {
                email: user.email,
                name: user.name,
                password: hashPassword,
            }
        });
        res.status(201).json({ message: "user Cadastrado com Sucesso", data: userDB });
    }
    catch (error) {
        console.error("Erro no /cadastro:", error);
        res.status(500).json({ message: "Erro no servidor, tente novamente" });
    }
});

// LOGIN (JWT => AUTENTICACAO)
/* 
    funcionamento 
    O servidor verifica se as credenciais estão corretas na base de dados. Se forem válidas,
    O servidor gera um JWT composto por três partes codificadas em Base64: 
    Header: Indica o tipo de token e o algoritmo de criptografia (ex: HS256).
    Payload: Contém os dados do utilizador (claims), como o ID ou o nome, e o tempo de expiração.
    Signature: Uma assinatura digital criada com uma chave secreta guardada apenas no servidor. 
    Esta assinatura garante que o token não foi alterado por terceiros. 
*/

router.post('/login' , async (req, res) =>
{
    try {
        const userInfo = req.body;

        // Busca user do banco de dados
        const user = await prisma.user.findUnique({
            where: {email: userInfo.email},
        });

        // verifica se o user esta dentro do banco de dados
        if (!user)
            res.status(404).json({message: "usuario nao encontrado!"});

        // compara a senha do banco com a que o user digitou
        const isMatch = await bcrypt.compare(userInfo.password, user.password);
        if (!isMatch)
            res.status(400).json({message: "Senha Invalida"}); 

        // gerar o jwt (jsonwebtoken);
        const token = jwt.sign({id: user.id}, JWT_SECRET, {expiresIn: '1m'});
        res.status(200).json(token);
    } catch (error) {
        console.error("Erro no /login:", error);
        res.status(500).json({ message: "Erro no servidor, tente novamente" });
    }
});

export default router;