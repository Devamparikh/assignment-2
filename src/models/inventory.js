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
        convert: true

    },
    quantity: { type: "number", convert: true},
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

    const [rows, fields] = await promisePool.execute("INSERT INTO `inventory`(`inventory_name`, `inventory_category`, `expiry_time`, `inventory_quantity`, `manufacturing_time`, `inventory_image`) VALUES (?,?,?,?,?,?)", [data.inventoryName, data.inventoryCategory, data.expiryTime, data.quantity, data.manufacturingTime, file.filename])
    if (rows.length == 0){
        logger.warn('no such data in database insert query executed')
        return {error: 'no such data in database.', ok: false}
    }
    console.log(rows)
    logger.info('insert query executed successfully: ' + rows )
    return {id: rows.insertId, massage: 'insert query executed successfully', ok: true}

}



//search query and return results
const searchQuery = async (search, timezone) => {
    logger.info('data arrived at searchQuery function: ', search, timezone )


    const [rows, fields] = await promisePool.execute("SELECT `inventory_id`, `inventory_name`, `inventory_category`, `expiry_time`, `inventory_quantity`, `inventory_image` FROM `inventory` WHERE `is_deleted` = 0 AND (`inventory_name` LIKE ? OR `inventory_category` LIKE ?)", [search, search])
    if (rows.length == 0){
        logger.warn('no such data in database search query executed')
        return {error: 'no such data in database.', ok: false}
    }
    logger.info('search query executed successfully: ' + rows )

    rows.forEach((row) => {
        if((row.expiry_time == '0000-00-00 00:00:00') || (moment.tz(row.expiry_time, timezone).format() > moment.tz(new Date(), timezone).format()) ) {
            row.is_exprired = false
        }else {
            row.is_exprired = true
        }

        row.inventory_image = 'D:/Programming/Projects/marutiTechlabAssignment/marutiTechlabAssignment/assignment-2/Public/data/uploads/' + row.inventory_image
        row.expiry_time = moment.tz(row.expiry_time, timezone).format()
        // console.log(row.expiry_time)

    })
    console.log(rows)
    return rows

}



//update query 
const updateQuery = async (id, quantity) => {
    logger.info('data arrived at updateQuery function: ', id )

    const [rows, fields] = await promisePool.execute("UPDATE `inventory` SET `inventory_quantity`=? WHERE`is_deleted` = 0 AND  `inventory_id`=?", [ quantity, id])
    if (rows.length == 0){
        logger.warn('no such data in database update query executed')
        return {error: 'no such data in database.', ok: false}
    }
    logger.info('update query executed successfully: ' + rows )
    return {massage: 'quantity updated successfully', ok: true}

}



//delete query 
const deleteQuery = async (search) => {

    logger.info('data arrived at updateQuery function: ', search )

    const [rows, fields] = await promisePool.execute("SELECT * FROM `inventory` WHERE `is_deleted` = 0 AND (`inventory_name` LIKE ? OR `inventory_category` LIKE ?)", [search, search])
    if (rows.length == 0){
        logger.warn('no such data in database delete query executed')
        return {error: 'no such data in database.', ok: false}
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
        
        
        

        logger.info('successfully data deleted for id: ', row.inventory_id )
    })
    const [deleteStatus] = await promisePool.execute("UPDATE `inventory` SET `is_deleted`= ?, `inventory_image`=? WHERE `is_deleted` = 0 AND (`inventory_name` LIKE ? OR `inventory_category` LIKE ?)", [ 1 , NULL, search, search])
    if (deleteStatus.length == 0){
        logger.warn('no such data in database delete query executed')
        return {error: 'no such data in database.', ok: false}
    }
    logger.info('delete query executed successfully')
    return {massage: 'delete query executed successfully', ok: true}

}


module.exports = { check, insertQuery, searchQuery, updateQuery, deleteQuery } 