const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom, getAllUsers} = require('./utils/users')
const userAdminName = 'Admin'


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT

//Configuracion de express paths
const publicPath = path.join(__dirname, '../public')

//Set carpeta static donde el servidor publica
app.use(express.static(publicPath))

app.get('', (req, res) => {
    res.render('index')
})

io.on('connection', (socket) => {

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        if (!user) {
            return callback(`The user don't exist`)
        }

        io.to(user.room).emit('message', generateMessage(message, user.username))
        callback()
    })

    socket.on('sendLocation', (coord, callback) => {
        const user = getUser(socket.id)
        if (!user) {
            return callback(`The user don't exist`)
        }
        io.to(user.room).emit('locationMessage', generateLocationMessage(coord, user.username))
        callback('Location Shared')
    })

    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message', generateMessage(`Bienvenido ${user.username}`, userAdminName) )
        socket.broadcast.to(user.room).emit('message', generateMessage(`Se unió ${user.username}`, userAdminName))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} se fue!`, userAdminName))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

})

server.listen(port, () => {
    console.log(`El servidor esta funcionando en el puerto ${port}`)
}) 

//ver 17-24