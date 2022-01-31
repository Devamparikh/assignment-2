const express = require('express')
const multer  = require('multer')
const router = new express.Router()
const { check, insertQuery, searchQuery, updateQuery } = require('../models/inventory')


// add extention to file name
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './Public/data/uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      let extension = file.originalname.split(".").pop()
      cb(null, file.fieldname + '-' + uniqueSuffix + '.' + extension)
    }
  })


// filter only image file
const upload = multer({
    storage: storage,
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(png|jpeg|jpg)$/)){
            return cb(new Error('Please upload an Image.'))
        }
        // console.log(req, file)
        cb(undefined, true)
    }
})
  

// insert data router
router.post('/insertinventory', upload.single('uploaded_file'), async (req, res) => {
    try {

        const valid = await check(req.body)
        console.log(valid)
        if (valid !== true) {
            return res.status(400).send({error: 'Improper data.'})
        }

        const rows = await insertQuery(req.body, req.file)
        console.log("rows in router: ", rows)


        console.log(req.file, req.body)

        // const currentDate = new Date()
        // console.log(currentDate)

        res.send(rows)

        
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
    
    
})


// search data router
router.get('/searchinventory/:search', async (req, res) => {
    try {
        
        const search = req.params.search
        const timezone = req.query.timezone

        if (!timezone) {
            timezone = 'America/Chicago'
        }
        console.log("timezone: ", timezone)

        const rows = await searchQuery(search, timezone)
        console.log("rows in router: ", rows)

        res.send(rows)

        
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
    
    
})


//update data router
router.put('/updateinventory/:id', upload.single('uploaded_file'), async (req, res) => {
    try {
        
        const id = req.params.id

        const valid = await check(req.body)
        if (valid !== true) {
            return res.status(400).send({error: 'Improper data.'})
        }

        const rows = await updateQuery(id, req.body, req.file)
        console.log("rows in router: ", rows)

        res.send(rows)

        
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
    
    
})


module.exports = router
