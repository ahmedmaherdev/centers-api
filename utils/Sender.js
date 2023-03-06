class Sender {
    send(res, statusCode, data, moreData) {
        res.status(statusCode).send({
            status: 'success',
            ...moreData,
            data: data,
        })
    }
}

module.exports = new Sender()
