var router = require('express').Router()


router.post('/profile', (req, res) => {
    let csv = req.body.join('\n')
    res.send(csv)
})

module.exports = router