var router = require('express').Router()

router.get(('/'), (req, res) => {
    res.render('index.html')
})
router.get('*', (req, res) => {
    res.redirect('/')
})

module.exports = router