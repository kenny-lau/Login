const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validator = require('validator')
const config = require('../../config/config')
require('../db/mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
        trim: true
        // validate password to prevent certain words?
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    dateOfBirth: {  //date of birth
        type: String,
        validate(value) {
            if (!validator.isDate(value, 'YYYY/MM/DD')) {
                throw new Error('Invalid birthday format, YYYY/MM/DD expected')
            }
        }
    },
    phone: {
        type: String
    },
    gender: {
        type: String,
        required: true,
        validate(value) {
            if (!'MFLGTQD'.includes(value.toUpperCase())) {
                throw new Error('Invalid gender')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})

// generate bearer token
userSchema.methods.getAuthorizationToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, config.secret, { expiresIn: config.tokenLife })
    // Add to token list for multiple devices login access
    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

// find user for login
userSchema.statics.findByUserCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Login failed')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Login failed')
    }

    return user
}

// check for user password update
userSchema.pre('save', async function (next) {
    const user = this

    // check to see current document's "password" field is modified
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User