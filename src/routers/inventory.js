const express = require('express')
const multer  = require('multer')
const router = new express.Router()
const logger = require('../logger/logger')
const { check, insertQuery, searchQuery, updateQuery, deleteQuery } = require('../models/inventory')
const validate = require('../middleware/validate')


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
        // console.log("req.body form upload function: " , req)
        // console.log(req.manufacturingTime)
        // console.log(req.inventoryCategory)

        // console.log("file form upload function: " , file)
        if(!file.originalname.match(/\.(png|jpeg|jpg)$/)){
            return cb(new Error('invalid file type'))
        }
        // console.log(req, file)
        cb(undefined, true)
    }
})
  


// insert data router
router.post('/inventory', upload.single('uploadedFile'), async (req, res) => {
    try {
        // console.log(unknowIdentify)
        logger.info('insert data route start.')
        // console.log("req.body form post function: ",req.body)
        // console.log(req.file, req.body)

        const valid = await check(req.body)
        if(!req.file.filename){
            logger.error('invalid data after check sending response improper data.')
            return res.status(400).send({error: 'Improper data.', message: 'filename required', ok: false})
        }
        console.log("valid: " , valid)
        logger.info('valid data check: ' , valid)
        // console.log(valid)
        if (valid !== true) {
            logger.error('invalid data after check sending response improper data.')
            return res.status(400).send({error: 'Improper data.', message: valid.message, ok: false})
        }

        logger.info('sending req.body and req.file in insertQuery function')
        const rows = await insertQuery(req.body, req.file)
        // console.log("rows in router: ", rows)
        logger.info('response from insertQuery function in router file: '+ rows)
        logger.info('sending response from router using send')





        // const currentDate = new Date()
        // console.log(currentDate)

        res.status(201).send(rows)

        
    } catch (error) {
        // console.log(error)
        logger.error('error in insert router: ', error)
        res.status(500).send({error: error.message, ok: false})
    }
    
    
})


// search data router
router.get('/inventory/:search', async (req, res) => {
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
        res.status(500).send({error: error.message, ok: false})
    }
    
    
})


//update data router
router.patch('/inventory', async (req, res) => {
    try {
        logger.info('update data route start.')
        
        const id = req.body.id
        const quantity = req.body.quantity

        if(!quantity || !id){
            logger.error('invalid data after check sending response improper data.')
            return res.status(400).send({error: 'quantity or id not specified!', ok: false})
        }


        logger.info('sending id, req.body and req.file in updateQuery function')
        const rows = await updateQuery(id, quantity)
        // console.log("rows in router: ", rows)
        logger.info('response from updateQuery function in router file: '+ rows)
        logger.info('sending response from router using send')

        res.status(200).send({massage: 'quantity updated successfully!', ok: true})

        
    } catch (error) {
        // console.log(error)
        logger.error('error in update router: ', error)
        res.status(500).send({error: error.message, error: error, ok: false})
    }
    
    
})



//delete data router
router.delete('/inventory/:search', async (req, res) => {
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
        res.status(500).send({error: error.message, ok: false})
    }
    
    
})


module.exports = router
