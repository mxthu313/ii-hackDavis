const express = require('express')
const multer = require('multer')
const InterpreterProfile = require('../models/interpreterProfile')
const auth = require('../middleware/auth')
const { saveiProfile } = require('../utils/algolia')
const { accumulateRatings } = require('../utils/interpreterProfile')

const router = new express.Router()

// UPDATE THESE ROUTES

// creating a profile
// idk on what screen this will live
router.post('/iProfile', async (req, res) => {
    var iProfile = new InterpreterProfile(req.body)
    try {
        // interpreter coordinates are generated from location string
        await iProfile.generateCoordinates(req)
        await iProfile.save()
        const token = await iProfile.generateAuthToken()
        saveiProfile(iProfile)
        res.status(201).send(iProfile)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

// interpreters can update their own profiles
router.patch('/iProfile/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['location', 'iLangFluency', 'eLangFluency', 'certification']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        // from being logged in
        const profile = await InterpreterProfile.findOne({ owner: req.user._id })

        updates.forEach((update) => profile[update] = req.body[update])
        await profile.save() // where middleware gets executed

        if (!profile) {
            return res.status(404).send()
        }
        res.status(201).send(profile)
    } catch (e) {
        res.status(400).send(e)
    }
})

// upload certification
// test this part
const upload = multer({
    limits: {
        fileSize: 100000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(doc|docx|pdf)$/)) {
            return cb(new Error('Please upload a doc, docx, or pdf file'))
        }

        cb(undefined, true)
    }
})

// Adds a Certification to the user
router.post('/users/me/certificates', auth, upload.single('certificate'), async (req, res) => {
    //creates new certificate from req
    const newCertificate = {
        certification: req.body.certificateName,
        file: req.file.buffer
    }
    req.user.certifications = req.user.certifications.concat(newCertificate)

    await req.user.save()
    res.status(200).send(req.user)
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

// TODO: delete only one certificate
router.delete('/users/me/certificates', auth, async (req, res) => {
    try {
        // deletes all for now
        req.user.certificates = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.send(500).send()
    }
})

// TODO: fix the context type thing
router.get('/users/:id/certificates', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || user.certificates.length === 0) {
            throw new Error()
        }

        // res.set('Content-Type', 'application/pdf')
        res.send(user.certificates)
    } catch (e) {
        res.status(404).send()
    }
})

// fetch all reviews for user
router.get('/iProfile/:id/details', async (req, res) => {
    try {
        const interpreter = await InterpreterProfile.findById(req.params.id)
        const reviews = interpreter.reviews.map(review => {
            const rev = review.toObject()
            delete rev._id
            return rev
        })
        const details = {
            rating: interpreter.rating,
            reviews: reviews
        }
        res.status(200).send(details)
    } catch (e) {
        console.log('error', e)
        res.status(404).send()
    }
})

// add review by user to db
router.post('/iProfile/:id/review', async (req, res) => {
    try {
        const interpreter = await InterpreterProfile.findById(req.params.id)
        if (!interpreter.rating) {
            interpreter.rating = req.body.rating
        } else {
            interpreter.rating = accumulateRatings(req.body.rating, interpreter.rating, interpreter.reviews.length)
        }
        const review = {
            rating: req.body.rating,
            userName: req.body.name,
            comment: req.body.comment,
            date: new Date()
        }
        interpreter.reviews.push(review)
        interpreter.save()
        res.status(200).send()
    } catch (e) {
        console.log('error', e)
        res.status(404).send()
    }
})

module.exports = router
