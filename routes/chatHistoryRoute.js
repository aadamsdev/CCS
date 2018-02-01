const ChatHistoryDao = require('../dao/chatHistoryDao')

module.exports = function (app, db) {

    app.get('/chatHistory/page', (req, res) => {
        if (req.query.chatRoomName && req.query.lastMessageInChat) {
            const chatRoomName = req.query.chatRoomName
            const lastMessageInChat = req.query.lastMessageInChat

            console.log(chatRoomName)
            ChatHistoryDao.getForChatRoomByPage(db, chatRoomName, lastMessageInChat, (messages) => {
                res.status(200).send(messages)
            }, (err) => {
                res.status(500).send(err)
            })    
        } else {
            res.status(404).send(null)
        }
    })
};