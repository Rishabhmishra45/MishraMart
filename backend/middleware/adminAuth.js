import jwt from 'jsonwebtoken'

const adminAuth = async (req, res, next) => {

    try {
        let { token } = req.cookies

        if (!token) {
            return res.status(400).json({ message: "Not Authorized Login Again" })
        }

        let verifyToken = jwt.verify(token, process.env.JWT_SECRET)

        if (!verifyToken) {
            return res.status(400).json({ message: "Not Authorized Login Again, Invalid token" })
        }
        req.adminEmail = process.env.ADMIN_EMAIL

        next()
    } catch (error) {
        console.error("adminAuth error");
        return res.status(500).json({ message: `adminAuth error ${error}` });
    }
}

export default adminAuth