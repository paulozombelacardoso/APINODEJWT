import express from 'express'
import publicRoutes from './routes/public.js'
import privateRoutes from './routes/private.js'

const app = express();

app.use(express.json());

/* 
    3 Rotas 
        Publicas: Cadastro e login
        Privadas: Listar Usuarios
*/

app.use('/', publicRoutes);
app.use('/', privateRoutes);

// PORTA do server
const PORT = 3000;
app.listen(PORT, (error) =>
{
    if (error)
    {
        console.log(`Something happen wrong in server`);
    }
    console.log(`Server Rodando Na Porta ${PORT}`);
});