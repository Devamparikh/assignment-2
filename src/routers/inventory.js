const express = require('express')
const multer  = require('multer')
const router = new express.Router()
const logger = require('../logger/logger')
const { check, insertQuery, searchQuery, updateQuery, deleteQuery } = require('../models/inventory')


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
        logger.info('insert data route start.')
        const valid = await check(req.body)
        logger.info('valid data check: ' , valid)
        // console.log(valid)
        if (valid !== true) {
            logger.error('invalid data after check sending response improper data.')
            return res.status(400).send({error: 'Improper data.'})
        }

        logger.info('sending req.body and req.file in insertQuery function')
        const rows = await insertQuery(req.body, req.file)
        // console.log("rows in router: ", rows)
        logger.info('response from insertQuery function in router file: '+ rows)
        logger.info('sending response from router using send')




        console.log(req.file, req.body)

        // const currentDate = new Date()
        // console.log(currentDate)

        res.status(201).send(rows)

        
    } catch (error) {
        console.log(error)
        logger.error('error in insert router: ', error)
        res.status(500).send(error)
    }
    
    
})


// search data router
router.get('/searchinventory/:search', async (req, res) => {
    try {
        logger.info('search data route start.')
        
        const search = req.params.search
        let timezone = ''

        if (!req.query.timezone) {
            timezone = 'America/Chicago'
        }else {
            timezone = req.query.timezone
        }
        // console.log(timezone)
        logger.info('timezone in search data route: ', timezone)
        // console.log("timezone: ", timezone)

        logger.info('sending search and timezone in searchQuery function')
        const rows = await searchQuery(search, timezone)
        // console.log("rows in router: ", rows)
        logger.info('response from searchQuery function in router file: '+ rows)
        logger.info('sending response from router using send')

        res.send(rows)

        
    } catch (error) {
        // console.log(error)
        logger.error('error in search router: ', error)
        res.status(500).send(error)
    }
    
    
})


//update data router
router.put('/updateinventory/:id', upload.single('uploaded_file'), async (req, res) => {
    try {
        logger.info('update data route start.')
        
        const id = req.params.id

        
        const valid = await check(req.body)
        logger.info('valid data check: ' , valid)
        if (valid !== true) {
            logger.error('invalid data after check sending response improper data.')
            return res.status(400).send({error: 'Improper data.'})
        }

        logger.info('sending id, req.body and req.file in updateQuery function')
        const rows = await updateQuery(id, req.body, req.file)
        // console.log("rows in router: ", rows)
        logger.info('response from updateQuery function in router file: '+ rows)
        logger.info('sending response from router using send')

        res.send(rows)

        
    } catch (error) {
        // console.log(error)
        logger.error('error in update router: ', error)
        res.status(500).send(error)
    }
    
    
})



//delete data router
router.delete('/deleteinventory/:search', async (req, res) => {
    try {
        logger.info('delete data route start.')
        
        const search = req.params.search

        logger.info('sending search in deleteQuery function')
        const rows = await deleteQuery(search)
        // console.log("rows in router: ", rows)
        logger.info('response from deleteQuery function in router file: '+ rows)
        logger.info('sending response from router using send')

        res.send(rows)

        
    } catch (error) {
        // console.log(error)
        logger.error('error in delete router: ', error)
        res.status(500).send(error)
    }
    
    
})


module.exports = router
