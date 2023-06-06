var express = require('express');
var router = express.Router();
var { product_type } = require('../../../models')

router.get('/', (req, res, next) => {
    product_type.findAll().then(data => {
        res.send({ row: data });
    }).catch((err) => {
        const { original: { code, sqlMessage } } = err;
        res.status(400).send({ error: { name: code, message: sqlMessage } });
    })

});



//สร้าง Max ID ให้ Run ต่อไปเรื่อยๆ  
async function generateID() {
    const lastProductType = await product_type.findOne({
        order: [['type_id', 'DESC']]
    });

    if (lastProductType) {
        const lastID = lastProductType.type_id;
        const newID = 'TYP' + (parseInt(lastID.slice(3)) + 1).toString().padStart(2, '0');
        return newID;
    } else {
        return 'TYP01';
    }
}

router.post('/', async (req, res, next) => {

    const newID = await generateID();
    req.body.type_id = newID;
    product_type.create(req.body).then((data) => {
        res.send({ success: { massege: "Insert Successfully.", result: data } })
    }).catch((err) => {

        const { original: { code, sqlMessage } } = err;
        res.status(400).send({ error: { name: code, message: sqlMessage } });
    })
});

router.put('/:id', (req, res, next) => {

    product_type.update(req.body, { where: { id: req.params.id } }).then(data => {

        if (data[0] > 0) {
            product_type.findByPk(req.params.id).then((data) => {
                res.send({ success: { message: "Update Successfully", result: data } })
            })

        } else {
            res.status(400).send({ error: { name: "DataNotFound", message: "DataNotFound" } });
        }


    }).catch((err) => {
        const { original: { code, sqlMessage } } = err;
        res.status(400).send({ error: { name: code, message: sqlMessage } });
    })

})

router.delete('/:id', (req, res, next) => {
    product_type.findByPk(req.params.id).then(data => {

        if (data != null) {

            data.destroy().then(result => {
                res.send({ success: { message: "Delete Successfully", result: data } });
            })
        } else {
            res.status(400).send({ error: { name: "DataNotFound", message: "DataNotFound" } });
        }

    }).catch((err) => {
        const { original: { code, sqlMessage } } = err
        res.status(400).send({ error: { name: code, message: sqlMessage } })

    })

})

module.exports = router;



