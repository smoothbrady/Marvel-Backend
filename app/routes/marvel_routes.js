// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for examples
const Marvel = require('../models/marvels')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

//Index
// /marvels
router.get('/marvels', requireToken, (req, res, next) => {
    Marvel.find()
        .then(marvels => {
            return marvels.map(marvel => marvel)
        })
        .then(marvels => {
            res.status(200).json({marvels: marvels})
        })
        .catch(next)
})

//Show
// /marvels/:id
router.get('/marvels/:id', requireToken, (req, res, next) => {
    Marvel.findById(req.params.id)
    .then(handle404)
    .then(marvel => {
        res.status(200).json({ marvel: marvel })
    })
    .catch(next)

})

// Create
// /marvel
router.post('/marvels', requireToken, (req, res, next) => {
    console.log('creatingmarvel', req.body.marvel)
    req.body.marvel.owner = req.user.id

    // one the front end I HAVE TO SEND a marvel as the top level key
    // marvel: {name: '', type: ''}
    Marvel.create(req.body.marvel)
    .then(marvel => {
        res.status(201).json({ marvel: marvel })
    })
    .catch(next)
    // .catch(error => next(error))

})

// Update
// /marvels/:id
router.patch('/marvels/:id', requireToken, removeBlanks, (req, res, next) => {
    delete req.body.marvel.owner

    Marvel.findById(req.params.id)
    .then(handle404)
    .then(marvel => {
        requireOwnership(req, marvel)

        return marvel.updateOne(req.body.marvel)
    })
    .then(() => res.sendStatus(204))
    .catch(next)

})

// DESTROY
// DELETE 
router.delete('/marvels/:id', requireToken, (req, res, next) => {
    Marvel.findById(req.params.id)
        .then(handle404)
        .then((marvel) => {
            requireOwnership(req, marvel)
            marvel.deleteOne()
        })
        .then(() => res.sendStatus(204))
        .catch(next)
})

module.exports = router