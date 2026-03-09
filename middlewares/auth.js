import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

const auth = (req, res, next) =>
{
    const token = req.headers.authorization;
    if (!token)
        return res.status(401).json({message: "Acesso Negado!"});
    try {
        const tokenReplace = token.replace('Bearer ', '');
        const decoded = jwt.verify(tokenReplace, process.env.JWT_SECRET);
        //console.log(decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({message: "token Invalido"});
    }
}

export default auth;