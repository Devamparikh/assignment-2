const mysql = require('mysql2')

// create the connection to database
// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     database: 'inventorymanagementsystem'
//   })

  // Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'inventorymanagementsystem',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  })

module.exports = pool