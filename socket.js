const socketIo = require('socket.io');
const Rider = require('./models/rider.models');
const Driver = require('./models/driver.model');

let io;

function initializeSocket(server) {
    io = socketIo(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        socket.on('update-location-captain', async (data) => {
            const { userId, location } = data;

            if (!location || !location.ltd || !location.lng) {
                return socket.emit('error', { message: 'Invalid location data' });
            }

            await captainModel.findByIdAndUpdate(userId, {
                location: {
                    ltd: location.ltd,
                    lng: location.lng
                }
            });
        });

        socket.on("joinRoom", async ({ userId, userType, role }) => {
            const room = role === "driver" ? `driver_${userId}` : `rider_${userId}`;
            socket.join(room);
            console.log("socket data join receive", userType, userId, role)

            if (userType === 'user') {
                await Rider.findByIdAndUpdate(userId, { socket_id: socket.id });
                console.log("rider updated")
            } else if (userType === 'captain') {
                await Driver.findByIdAndUpdate(userId, { socket_id: socket.id });
                console.log("driver updated");
            }
            console.log(`${socket.id} joined room: ${room}`);
        });

        socket.on("locationUpdate", ({ userId, role, location }) => {
            const room = role === "driver" ? `rider_${userId}` : `driver_${userId}`;
            io.to(room).emit("locationUpdate", { userId, location });

            console.log(`Location update from ${role}:`, location);
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    io.on("disconnect", (socket) => {
        console.log(`Client disconnected: ${socket.id}`);
    });
}

const sendMessageToSocketId = (socketId, messageObject) => {

    console.log(messageObject);

    if (io) {
        io.to(socketId).emit(messageObject.event, messageObject.data);
    } else {
        console.log('Socket.io not initialized.');
    }
}

module.exports = { initializeSocket, sendMessageToSocketId };