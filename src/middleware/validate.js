const formidable = require('formidable')
const validate = (req, res, next) => {
    const form = formidable({ multiples: true })
  
    form.parse(req, (err, fields, files) => {
      if (err) {
        next(err)
        return
      }
      console.log("req.body from middleware function:", req)
      console.log({ fields, files })
      next()
    })
  }

module.exports = validate
