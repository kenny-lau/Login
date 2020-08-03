const express = require('express')
const User = require('../models/user')
const { auth, renewAuth } = require('../middleware/authorize')

const router = new express.Router()

// Create user
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.getAuthorizationTokens()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

// Login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByUserCredentials(req.body.email, req.body.password)
        const token = await user.getAuthorizationTokens()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send({ error: 'Login failed' })
    }
})

// refresh access token
router.post('/users/token', renewAuth, async (req, res) => {
    try {
        const newToken = req.user.getAccessToken(req.user._id)
        for (i = 0; i < req.user.tokens.length; i++) {
            if (req.user.tokens[i].refreshToken === req.body.token) {
                req.user.tokens[i].token = newToken
                break
            }
        }
        await req.user.save()
        res.status(200).send({ user: req.user, newToken })
    } catch (e) {
        res.status(400).send(e)
    }
})

// Retrieve user profile
router.get('/users/profile', auth, async (req, res) => {
    res.status(200).send(req.user)
})

// Logout
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token   // remove current token and keep the rest
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// Logout all, user may have multiple login with different devices
router.post('/users/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// update user profile
router.patch('/users/profile', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowUpdates = ['name', 'email', 'password', 'dateOfBirth', 'phone', 'gender']
    const isValidUpdate = updates.every((update) => allowUpdates.includes(update))

    if (!isValidUpdate) {
        return res.status(400).send({ error: 'Invalid user update' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Delete user account
router.delete('/users/profile', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router