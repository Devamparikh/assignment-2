const fs = require('fs')
const Validator = require("fastest-validator")
const moment = require('moment-timezone')

const logger = require('../logger/logger')
const pool = require('../db/mysql')
const promisePool = pool.promise()


const v = new Validator()

const schemaCreateInventory = {
    inventoryName: { type: "string" },
    inventoryCategory: { type: "string"},
    expiryTime: {
        type: "date", 
        optional: true,
        convert: true,
        default: '0000-00-00 00:00:00'

    },
    quantity: { type: "number", default: 1, convert: true},
    manufacturingTime: { 
        type: "date",
        convert: true
    }
}
const check = v.compile(schemaCreateInventory)


// execute will internally call prepare and query
const insertQuery = async (data, file) => {
    logger.info('data arrived at insertQuery function: ' )

    // console.log("data: ", data)

    // convert to CST time
    data.manufacturingTime = moment.tz(data.manufacturingTime, "America/Chicago").format()
    data.expiryTime = moment.tz(data.expiryTime, "America/Chicago").format()

    //check whether exp date is then mnf date
    if(data.expiryTime < data.manufacturingTime){
        logger.warn('ERROR IN DATE')
        // console.log("ERROR IN DATE")
        throw new Error("Wrong dates!")
    }

    const [rows, fields] = await promisePool.execute("INSERT INTO `inventory`(`inventory_name`, `inventory_category`, `expiry_time`, `inventory_quantity`, `manufacturing_time`, `inventory_image`, `inventory_user_id`) VALUES (?,?,?,?,?,?,?)", [data.inventoryName, data.inventoryCategory, data.expiryTime, data.quantity, data.manufacturingTime, file.filename, 0])
    if (rows.length == 0){
        logger.warn('no such data in database insert query executed')
        return 'no such data in database.'
    }
    logger.info('insert query executed successfully: ' + rows )
    return rows

}



//search query and return results
const searchQuery = async (search, timezone) => {
    logger.info('data arrived at searchQuery function: ', search, timezone )


    const [rows, fields] = await promisePool.execute("SELECT `inventory_id`, `inventory_name`, `inventory_category`, `expiry_time`, `inventory_quantity`, `inventory_image` FROM `inventory` WHERE `inventory_name` LIKE ? OR `inventory_category` LIKE ?", [search, search])
    if (rows.length == 0){
        logger.warn('no such data in database search query executed')
        return 'no such data in database.'
    }
    logger.info('search query executed successfully: ' + rows )

    rows.forEach((row) => {
        if((row.expiry_time == '0000-00-00 00:00:00') || (row.expiry_time > new Date()) ) {
            row.is_exprired = false
        }else {
            row.is_exprired = true
        }

        row.inventory_image = 'Public/data/uploads/' + row.inventory_image
        row.expiryTime = moment.tz(row.expiryTime, timezone).format()

    })

    return rows

}



//update query 
const updateQuery = async (id, data, file) => {
    logger.info('data arrived at updateQuery function: ', id, data, file )
    // convert to CST time
    data.manufacturingTime = moment.tz(data.manufacturingTime, "America/Chicago").format()
    data.expiryTime = moment.tz(data.expiryTime, "America/Chicago").format()


    //check whether exp date is then mnf date
    if((data.expiryTime !== '0000-00-00 00:00:00') && (data.expiryTime < data.manufacturingTime)){
        // console.log("ERROR IN DATE")
        logger.warn('ERROR IN DATE')
        throw new Error("Wrong dates!")
    }


    const [rows, fields] = await promisePool.execute("UPDATE `inventory` SET `inventory_name`=?,`inventory_category`=?,`expiry_time`=?,`inventory_quantity`=?,`manufacturing_time`=?,`inventory_image`=? WHERE `inventory_id`=?", [data.inventoryName, data.inventoryCategory, data.expiryTime, data.quantity, data.manufacturingTime, file.filename, id])
    if (rows.length == 0){
        logger.warn('no such data in database update query executed')
        return 'no such data in database.'
    }
    logger.info('update query executed successfully: ' + rows )
    return rows

}



//delete query 
const deleteQuery = async (search) => {

    logger.info('data arrived at updateQuery function: ', search )

    const [rows, fields] = await promisePool.execute("SELECT * FROM `inventory` WHERE `inventory_name` LIKE ? OR `inventory_category` LIKE ?", [search, search])
    if (rows.length == 0){
        logger.warn('no such data in database delete query executed')
        return 'no such data in database.'
    }
    rows.forEach(async(row) =>{

        if(row.inventory_image == ''){
            console.log('no image present')
        }else {
            fs.unlink('Public/data/uploads/' + row.inventory_image, (error) => {
                if (error) throw error;
                logger.info('successfully unlink image data' )
                // console.log('successfully deleted image.')
            })
        }
        
        
        const [deletestatus, fields] = await promisePool.execute("UPDATE `inventory` SET `is_deleted`= ?, `inventory_image`=? WHERE `inventory_id` = ?", [ 'true' , null, row.inventory_id])
        if (deletestatus.length == 0){
        logger.warn('no such data in database delete query executed')
        return 'no such data in database.'
        }

        logger.info('successfully data deleted for id: ', row.inventory_id )
    })
    logger.info('delete query executed successfully')
    const [currentrows] = await promisePool.execute("SELECT * FROM `inventory` WHERE `inventory_name` LIKE ? OR `inventory_category` LIKE ?", [search, search])
    if (rows.length == 0){
        logger.warn('no such data in database delete query executed')
        return 'no such data in database.'
    }
    return currentrows

}


module.exports = { check, insertQuery, searchQuery, updateQuery, deleteQuery } 