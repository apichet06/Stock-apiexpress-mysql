var express = require('express');
const { body, validationResult } = require('express-validator');
var router = express.Router();
var moment = require('moment');
var { User } = require('../../../models')
var excel = require('exceljs');

// PASSPORT 
const passport = require('passport');
const requireJwt = passport.authenticate('jwt', { session: false });


// MULTER | UPLOAD FILES
var multer = require('multer')
var path = require('path')
var shell = require('shelljs');

var strorageFile = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = `uploads/profile/${moment().format("YYYYMM")}`;
    shell.mkdir('-p', dir)
    cb(null, dir);
  },
  filename: (req, file, cb) => {

    cb(null, Date.now() + path.extname(file.originalname));
  }
})

var uploadProfileImage = multer({
  storage: strorageFile, fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("import รูปได้เฉพาะ .jpg .png .jpeg เท่านั้น!"))
    }
  }
})

/* GET users listing. */
router.get('/', requireJwt, function (req, res, next) {
  let { page = 1, limit = 10, sort = "id", order = "asc", ...filter } = req.query
  page = parseInt(page)
  limit = parseInt(limit)
  let offset = (page - 1) * limit

  User.findAll({
    where: filter,
    offset,
    limit: limit <= 0 ? undefined : limit,
    order: [[sort, order]]
  }).then(data => {
    res.send(data);
  }).catch((err) => {
    const { original: { code, sqlMessage } } = err;
    res.status(400).send({ error: { name: code, message: sqlMessage } });
  })
});

router.get('/:id', requireJwt, function (req, res, next) {
  User.findByPk(req.params.id).then(data => {
    if (data) {
      res.send(data);
    } else {
      res.status(400).send({ error: { name: "DataNotFound", message: "DataNotFound" } })
    }
  })
})

router.post('/', uploadProfileImage.single('file'),
  body('Firstname').if(body('Firstname').exists()).not().isEmpty().trim().escape(),
  body('Lastname').if(body('Lastname').exists()).not().isEmpty().trim().escape(),
  body('Email').if(body('Email').exists()).not().isEmpty().isEmail().normalizeEmail(),
  body('Password').if(body('Password').exists()).not().isEmpty().isLength({ min: 4, max: 20 }).trim().withMessage("must be at 4 to 20 characters long"),
  body('Birthdate').if(body('Birthdate').exists()).isDate(),
  (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).send({ error: { errors: errors.array() } })
    } else {

      if (req.file !== undefined && req.file !== null) {
        req.body.ProfileImage = req.file.path;

      }
      User.create(req.body).then(data => {
        res.send({ success: { message: "Insert Successfully.", result: data } });

      }).catch((err) => {
        const { original: { code, sqlMessage } } = err;
        res.status(400).send({ error: { name: code, message: sqlMessage } })
      })
    }
  });

router.put('/:id', requireJwt, uploadProfileImage.single('file'),
  body('Firstname').if(body('Firstname').exists()).not().isEmpty().trim().escape(),
  body('Lastname').if(body('Lastname').exists()).not().isEmpty().trim().escape(),
  body('Email').if(body('Email').exists()).not().isEmpty().isEmail().normalizeEmail(),
  body('Password').if(body('Password').exists()).not().isEmpty().isLength({ min: 4, max: 20 }).trim().withMessage("must be at 4 to 20 characters long"),
  body('Birthdate').if(body('Birthdate').exists()).isDate(),
  (req, res, next) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {

      res.status(400).send({ error: { errors: errors.array() } })

    } else {
      if (req.file !== undefined || req.file !== null) {
        req.body.ProfileImage = req.file.path;

      }
      User.update(req.body, { where: { id: req.params.id } }).then(data => {
        if (data[0] > 0) {
          User.findByPk(req.params.id).then(data => {
            res.send({ success: { message: "Updated Successfully.", result: data } })
          })
        } else {
          res.status(400).send({ error: { name: "DataNotFound", message: "DataNotFound" } })
        }
      }).catch((err) => {
        const { original: { code, sqlMessage } } = err;
        res.status(400).send({ error: { name: code, message: sqlMessage } })
      })

    }


  })

router.patch('/:id', requireJwt,
  // body('Firstname').if(body('Firstname').exists()).not().isEmpty().trim().escape(),
  // body('Lastname').if(body('Lastname').exists()).not().isEmpty().trim().escape(),
  // body('Email').if(body('Email').exists()).not().isEmpty().isEmail().normalizeEmail(),
  // body('Password').if(body('Password').exists()).not().isEmpty().isLength({ min: 4, max: 20 }).trim().withMessage("must be at 4 to 20 characters long"),
  // body('Birthdate').if(body('Birthdate').exists()).isDate(),
  (req, res, next) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {

      res.status(400).send({ error: { errors: errors.array() } })

    } else {

      if (req.file !== undefined || req.file !== null) {
        req.body.ProfileImage = req.file.path;

      }

      User.update(req.body, { where: { id: req.params.id } }).then(data => {
        if (data[0] > 0) {
          User.findByPk(req.params.id).then(data => {
            res.send({ success: { message: "Updated Successfully.", result: data } })
          })
        } else {
          res.status(400).send({ error: { name: "DataNotFound", message: "DataNotFound" } })
        }
      }).catch((err) => {
        const { errors: [ValidationErrorItem], original } = err;
        res.status(400).send({
          error: {
            name: original ? original.code : ValidationErrorItem.type,
            message: original ? original.sqlMessage : ValidationErrorItem.message
          }
        })
      })

    }


  })


router.delete('/:id', requireJwt, (req, res, next) => {
  User.findByPk(req.params.id).then(data => {
    if (data != null) {
      data.destroy().then(result => {
        res.send({ success: { message: "Deleted successfully.", result: data } })
      })
    } else {
      res.status(400).send({ error: { name: "DataNotFound", message: "DataNotFound" } })
    }
  })
});


//EXPORT EXCEL xlsx
router.get('/report/excel', requireJwt, (req, res, next) => {
  let { page = 1, limit = 10, sort = "id", order = "asc", ...filter } = req.query
  page = parseInt(page)
  limit = parseInt(limit)
  let offset = (page - 1) * limit
  User.findAll({
    where: filter,
    offset,
    limit: limit <= 0 ? undefined : limit,
    order: [[sort, order]]
  }).then(data => {
    //Exec
    var workbook = new excel.Workbook();
    var worksheet = workbook.addWorksheet("USERS")
    //HEADERS
    res.setHeader('Content-Type', 'application/vnd.openxmlformats')
    res.setHeader('Content-Disposition', 'attachment; filename =' + 'users' + Date.now() + '.xlsx')
    //EXCEL:HREADER
    let columns = [];
    let paths = ['Firstname', 'Lastname', 'Email', 'ProfileImage', 'Birthdate'];
    paths.forEach(path => {
      columns.push({ header: path, key: path })
    })
    // column
    worksheet.columns = columns;
    worksheet.columns.forEach(column => { column.width = 20; })
    // AUTOFILTER
    worksheet.autoFilter = { from: { row: 1, column: 1, column: 1 }, to: { row: 1, column: worksheet.actualColumnCount } }
    // STYLES
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      cell.font = { bold: true, color: { argb: "FFFFFFF" } };
      cell.border = {
        top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" }
      }
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "ffsdccce" } };
      cell.alignment = { vertical: "top", wrapText: true };
    });
    //  BODY
    data.forEach(row => {
      const row_ = worksheet.addRow(row);
      row_.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } }
        cell.alignment = { vertical: "top", wrapText: true };
      })
    })

    // WRITE EXCEL FILE ADN SEND เขียนไฟล์ EXCEL และส่งไฟล์
    workbook.xlsx.write(res).then(() => {
      res.end();
    })

  }).catch((err) => {
    const { original: { code, sqlMessage } } = err;
    res.status(400).send({ error: { name: code, message: sqlMessage } });
  })
})

//EXPORT CSV

router.get('/report/csv', requireJwt, (req, res, next) => {
  let { page = 1, limit = 10, sort = "id", order = "asc", ...filter } = req.query
  page = parseInt(page)
  limit = parseInt(limit)
  let offset = (page - 1) * limit
  User.findAll({
    where: filter,
    offset,
    limit: limit <= 0 ? undefined : limit,
    order: [[sort, order]]
  }).then(data => {
    //Exec
    var workbook = new excel.Workbook();
    var worksheet = workbook.addWorksheet("USERS")
    //HEADERS
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename =' + 'users' + Date.now() + '.csv')
    //EXCEL:HREADER
    let columns = [];
    let paths = ['Firstname', 'Lastname', 'Email', 'ProfileImage', 'Birthdate'];
    paths.forEach(path => {
      columns.push({ header: path, key: path })
    })
    // column
    worksheet.columns = columns;
    worksheet.columns.forEach(column => { column.width = 20; })
    // AUTOFILTER
    worksheet.autoFilter = { from: { row: 1, column: 1, column: 1 }, to: { row: 1, column: worksheet.actualColumnCount } }

    //  BODY
    data.forEach(row => {
      worksheet.addRow(row);
    })

    // WRITE EXCEL FILE ADN SEND เขียนไฟล์ EXCEL และส่งไฟล์
    workbook.csv.write(res).then(() => {
      res.end();
    })

  }).catch((err) => {
    const { original: { code, sqlMessage } } = err;
    res.status(400).send({ error: { name: code, message: sqlMessage } });
  })
})


module.exports = router;
