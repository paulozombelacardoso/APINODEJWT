import express from 'express'
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/listar-usuarios', async (req , res) =>
{
    try {
        const user = await prisma.user.findMany();

        res.status(300).json({message: "Listados com sucesso!", user});
    } catch (error) {
        res.status(500).json({message: "Falha no server"});
    }
});

export default router;
