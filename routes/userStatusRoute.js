const UserStatusDao = require('../dao/userStatusDao')

module.exports = function (app, db) {
    app.get('/userStatus/all', (req, res) => {
        const query = req.query
        if (query && query.chatRoomName) {
            console.log(query)
            const chatRoomName = query.chatRoomName

            UserStatusDao.getUserStatusForChatRoom(db, null, chatRoomName, (statuses) => {
                res.status(200).send(statuses)
            }, (err) => {
                res.status(500).send(err)
            })

        } else {

        }
    })
};