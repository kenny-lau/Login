const jwt = require('jsonwebtoken')
const User = require('../models/user')

// middleware to check access authorization
const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization')
        const token = authHeader && authHeader.split(' ')[1]
        // const token = req.header('Authorization').replace('Bearer ', '')
        if (!token) {
            throw new Error()
        }
        const decode = jwt.verify(token, process.env.TOKEN_SECRET)
        const user = await User.findOne({ _id: decode._id, 'tokens.token': token })

        if (!user) {
            throw new Error()
        }

        req.user = user
        req.token = token
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate!', message: e })
    }

}

// generate new access token as long as the refresh token is valid
const renewAuth = async (req, res, next) => {
    try {
        const refreshToken = req.body.token
        if (!refreshToken) { throw new Error() }
        const decode = jwt.verify(refreshToken, process.env.REFRESHTOKEN_SECRET)
        if (!decode._id) { throw new Error() }
        const user = await User.findOne({ _id: decode._id, 'tokens.refreshToken': refreshToken })
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please login!', message: e })
    }
}

module.exports = { auth, renewAuth }