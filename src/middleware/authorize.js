const jwt = require('jsonwebtoken')
const config = require('../../config/config')
const User = require('../models/user')

// middleware to check access authorization
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decode = jwt.verify(token, config.secret)
        const user = await User.findOne({ _id: decode._id, 'tokens.token': token })

        if (!user) {
            throw new Error()
        }

        req.user = user
        req.token = token
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate!' })
    }

}

module.exports = auth