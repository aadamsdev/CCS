'use strict'

module.exports = {
    name: 'communities core services',
    version: '0.0.1',
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    db: {
        name: 'CCS',
        uri: 'mongodb://localhost:27017',
        collections: {
            chatHistory: 'chat_history'
        }
    },
}