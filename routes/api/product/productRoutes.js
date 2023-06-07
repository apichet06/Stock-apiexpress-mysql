var express = require('express');
var router = express.Router()
const sequelize = require('sequelize');
var { Products, Picture_Pro, product_type } = require('../../../models')
var moment = require('moment');

// PASSPORT 
const passport = require('passport');
const requireJwt = passport.authenticate('jwt', { session: false });


//สร้าง Max ID ให้ Run ต่อไปเรื่อยๆ   
async function generateID() {
    const lastProduct = await Products.findOne({
        order: [['pro_id', 'DESC']]
    });

    if (lastProduct) {
        const lastID = lastProduct.pro_id;
        const newIDNumber = parseInt(lastID.slice(3)) + 1;
        const newID = 'PRO' + newIDNumber.toString().padStart(8, '0');
        return newID;
    } else {
        return 'PRO10000001';
    }
}

// MULTER | UPLOAD FILES
var multer = require('multer')
var path = require('path')
var shell = require('shelljs');

var strorageFile = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = `uploads/picture_product/${moment().format("YYYYMM")}`;
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

// router.get('/', requireJwt, (req, res, next) => {
//     Products.findAll().then(data => {
// const picturePromises = data.map(item => {
//     return Picture_Pro.findAll({
//         where: {
//             pro_id: item.pro_id
//         }
//     });
// });

// Promise.all(picturePromises).then(pictureData => {
//     res.send({ row: data, picture: pictureData });
// });
//     }).catch((err) => {
//         const { original: { code, sqlMessage } } = err
//         res.status(404).send({ error: { name: code, message: sqlMessage } })
//     })
// });



// โค้ดอื่นๆ
// Products.belongsTo(product_type, { foreignKey: 'type_id' });
// product_type.hasMany(Products, { foreignKey: 'type_id' });
// router.get('/', requireJwt, (req, res, next) => {
//     Products.findAll({
//         include: [
//             {
//                 model: product_type,
//                 on: {
//                     type_id: sequelize.col('Products.type_id')
//                 }
//             }
//         ]
//     }).then((results) => {
//         res.send(results)

//     }).catch((err) => {
//         const { original: { code, sqlMessage } } = err;
//         res.status(404).send({ error: { name: code, message: sqlMessage } });

//     });
// });



Products.belongsTo(product_type, { foreignKey: 'type_id', as: 'productType' });
product_type.hasMany(Products, { foreignKey: 'type_id', as: 'products' });

router.get('/', requireJwt, (req, res, next) => {

    Products.findAll({
        include: [
            {
                model: product_type,
                as: 'productType'
            }
        ]
    }).then((results) => {
        const data = results.map((result) => ({
            id: result.id,
            pro_id: result.pro_id,
            pro_name: result.pro_name,
            pro_cost_price: result.pro_cost_price,
            pro_price: result.pro_price,
            pro_qty: result.pro_qty,
            type_id: result.type_id,
            pro_status: result.pro_status,
            pro_date: result.pro_date,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt
        }));

        const picturePromises = results.map(item => {
            return Picture_Pro.findAll({
                where: {
                    pro_id: item.pro_id
                }
            });
        });

        Promise.all(picturePromises).then(pictureData => {
            res.send({ row: data, picture: pictureData });
        });


        // res.send(sanitizedResults);
    }).catch((err) => {
        const { original: { code, sqlMessage } } = err;
        res.status(404).send({ error: { name: code, message: sqlMessage } });
    });
});

router.get('/:id', requireJwt, (req, res, next) => {
    Products.findAll({
        where: { id: req.params.id },
        include: [
            {
                model: product_type,
                as: 'productType'
            }
        ]
    }).then((results) => {
        const data = results.map((result) => ({
            id: result.id,
            pro_id: result.pro_id,
            pro_name: result.pro_name,
            pro_cost_price: result.pro_cost_price,
            pro_price: result.pro_price,
            pro_qty: result.pro_qty,
            type_id: result.type_id,
            pro_status: result.pro_status,
            pro_date: result.pro_date,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt
        }));

        const picturePromises = results.map(item => {
            return Picture_Pro.findAll({
                where: {
                    pro_id: item.pro_id
                }
            });
        });

        Promise.all(picturePromises).then(pictureData => {
            res.send({ row: data, picture: pictureData });
        });


        // res.send(sanitizedResults);
    }).catch((err) => {
        const { original: { code, sqlMessage } } = err;
        res.status(404).send({ error: { name: code, message: sqlMessage } });
    });
});


router.post('/', requireJwt, uploadProfileImage.array('file'), async (req, res, next) => {
    try {
        const MaxID = await generateID();
        req.body.pro_id = MaxID;

        Products.create(req.body).then(async (data) => {
            if (req.files != null || req.files != undefined) {
                const imagePromises = req.files.map((file) => {
                    req.body.pic_name = file.path;
                    return Picture_Pro.create(req.body);
                });

                await Promise.all(imagePromises);
            }

            res.send({ success: { message: "Insert Successfully.", result: data } });
        }).catch((err) => {
            const { original: { code, sqlMessage } } = err;
            res.status(404).send({ error: { name: code, message: sqlMessage } });
        });
    } catch (error) {
        res.status(500).send({ error: { message: "Internal Server Error" } });
    }
});

router.put('/:id', requireJwt, (req, res, next) => {

    Products.update(req.body, { where: { id: req.params.id } }).then(data => {
        if (data[0] > 0) {
            Products.findByPk(req.params.id).then(data => {
                res.send({ success: { message: "Update Successfully.", result: data } });
            })
        } else {
            res.status(404).send({ error: { name: "DataNotFound", message: "DataNotFound" } })
        }
    }).catch((err) => {
        const { original: { code, sqlMessage } } = err;
        res.status(400).send({ error: { name: code, message: sqlMessage } })
    })
});

router.delete("/:id", requireJwt, (req, res, next) => {
    Products.findByPk(req.params.id).then(data => {
        if (data !== null) {
            data.destroy().then(result => {
                res.send({ success: { message: "Delete Successfully  ", result: data } });
            })
        } else {
            res.status(404).send({ error: { name: "DataNotFound", message: "DataNotFound" } })
        }

    }).catch((err) => {
        const { original: { code, sqlMessage } } = err;
        res.status(400).send({ error: { name: code, message: sqlMessage } })
    })

})

module.exports = router

