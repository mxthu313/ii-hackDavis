const express = require('express')
const Interpreter = require('../models/interpreterProfile')

const router = new express.Router()

router.get('/home', async (req, res) => {
    try {
        const quote = {
            authorName: 'Moomin Azkaban',
            avatar: 'https://cdn.dribbble.com/users/862175/screenshots/5818050/4_illustrations_january_marta.jpg',
            quote: 'Thanks to Indigenous Interpreters, I found just the help that I needed.',
            location: 'Davis, CA'
        }
        const interpreters = await Interpreter.aggregate([
            { $match: { 'certifications.isValidated': true, 'certifications.isRejected': false, rating: { $gt: 2 } } },
            { $sample: { size: 10 } }
        ])
        const parsedInterpreters = interpreters.map(interpreter => {
            const languages = interpreter.iLangFluencies.map(lang => lang.iLangFluency)
            return {
                name: interpreter.name,
                // avatar: interpreter.avatar,
                avatar: 'https://cdn.dribbble.com/users/862175/screenshots/5818050/4_illustrations_january_marta.jpg',
                languages: languages,
                email: interpreter.email,
                location: interpreter.location.locationString,
                rating: interpreter.rating
            }
        })
        res.status(200).send({
            interpreters: parsedInterpreters,
            quote: quote
        })
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router
