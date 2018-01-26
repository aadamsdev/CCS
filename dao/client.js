'use strict'

class Client {
    constructor(clientInfo) {
        this.username = clientInfo.username
        this.id = clientInfo.id
        this.latitude = clientInfo.latitude
        this.longitude = clientInfo.longitude
    }
}

module.exports = Client
