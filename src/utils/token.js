import jwt from 'jsonwebtoken'

export const generateToken = (id, role) => {
    try {
        return jwt.sign({id, role}, process.env.SECRET_KEY, {expiresIn: '7d'})
    } catch (error) {
        console.log(error);
    }
}