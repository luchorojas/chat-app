const generateMessage = (text, userName) => {
    return {
        text,
        userName,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (location, userName) => {
    return {
        url: `https://google.com/maps/?q=${location.latitude},${location.longitude}`,
        userName,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}