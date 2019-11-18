var router = require('express').Router()

router.use(require('./profile'))
router.get(('/'), (req, res) => {
    res.render('../views/index.html')
})
router.get('*', (req, res) => {
    res.redirect('/')
})

module.exports = router