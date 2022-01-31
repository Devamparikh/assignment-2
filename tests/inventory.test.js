const request = require('supertest')
const app = require('../src/app')
const { check, insertQuery, searchQuery, updateQuery, deleteQuery } = require('../src/models/inventory')
const { data, file, setupDatabase } = require('./fixtures/db')
const pool = require('../src/db/mysql')
const promisePool = pool.promise()


setupDatabase()

test('Should insert data in inventory', async () => {
    const response = await request(app)
        .post('/insertinventory')
        .attach('uploaded_file', 'tests/fixtures/Screenshot.png')
        .field(data)
        .expect(201)


    // const rows = await insertQuery(data, file)
    // expect(rows).not.toBeNull()
    // expect(task.complete).toEqual(false)
    
})

test('Should search data in inventory', async () => {
    // console.log(`/searchinventory/${data.inventoryName}`)
    const response = await request(app)
        .get(`/searchinventory/${data.inventoryName}`)
        .expect(200)


    const rows = await searchQuery(data.inventoryName, 'America/Chicago')
    expect(rows).not.toBeNull()
    // expect(task.complete).toEqual(false)
    
})

test('Should update data in inventory', async () => {
    // console.log(`/searchinventory/${data.inventoryName}`)
    const response = await request(app)
        .put(`/updateinventory/${data.inventoryId}`)
        .attach('uploaded_file', 'tests/fixtures/Screenshot.png')
        .field(data)
        .expect(200)


    // const rows = await updateQuery(data.inventoryId, data, file)
    // expect(rows).not.toBeNull()
    // expect(task.complete).toEqual(false)
    
})

test('Should delete data in inventory', async () => {
    // console.log(`/searchinventory/${data.inventoryName}`)
    const response = await request(app)
        .delete(`/deleteinventory/${data.inventoryName}`)
        .expect(200)

    //     setupDatabase()
    // const rows = await deleteQuery(data.inventoryName)
    // expect(rows).not.toBeNull()
    // expect(task.complete).toEqual(false)
    
})