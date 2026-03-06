import express from 'express';
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

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

export default router;