var router = require('express').Router(),
    fs = require('fs')

const pathsDir = (process.env.TRAJECTORY_DIR || 'db') + '/paths.json'

function log(msg) {
    console.log(`save.js ${msg}`)
}

router.post('/save', (req, res) => {
    fs.readFile(pathsDir, (err, data) => {
        if (err) return log(`Failed to read trajectory file!\n${err}`)
        data[req.body.trajectory.name] = req.body.trajectory
        fs.writeFile(pathsDir, data, 'utf8', (err) => {
            if (err) return log(`Failed to save trajectory!\n${err}`)
            log('Trajectory saved')
            res.redirect('/')
        })
    })
})

router.post('/delete', (req, res) => {
    fs.readFile(pathsDir, (err, data) => {
        if (err) return log(`Failed to read trajectory file!\n${err}`)
        delete data[req.body.trajectory.name]
        fs.writeFile(pathsDir, data, 'utf8', (err) => {
            if (err) return log(`Failed to write trajectory deletion!\n${err}`)
            res.redirect('/')
        })
    })
})

router.post('/read', (req, res) => {
    fs.readFile(pathsDir, (err, data) => {
        if (err) return log(`Failed to read trajectory file!\n${err}`)
        res.redirect('/')
    })
})