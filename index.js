// Import Required modules
const express = require('express');
const Chat = require('./models/chat');
const mongo = require('mongodb').MongoClient;
const io = require('socket.io').listen(4000).sockets;
const app = express();

// MiddleWare
app.use(bodyparser.json());
app.use(express.static('public'));


// Connect to mongo
mongo.connect('mongodb://root:root@ds119070.mlab.com:19070/web-socket-chat', (err, db) => {
    if (err) {
        throw err;
    }

    console.log('Connected to port 3001, Fractured but whole');

    // Connect to Socket.io
    io.on('connection', (socket) => {
        let chat = db.collection('chats');

        // Create function to send status
        sendStatus = (s) => {
            socket.emit('status', s);
        }

        // Get chats from mongo collection
        chat.find().limit(100).sort({ _id: 1 }).toArray((err, res) => {
            if (err) {
                throw err;
            }

            // Emit the messages
            socket.emit('output', res);
        });

        // Handle input events
        socket.on('input',  (data) => {
            let name = data.name;
            let message = data.message;

            // Check for name and message
            if (name == '' || message == '') {
                // Send error status
                sendStatus('Please enter a name and message');
            } else {
                // Insert message
                chat.insert({ name: name, message: message }, () => {
                    io.emit('output', [data]);

                    // Send status object
                    sendStatus({
                        message: 'Message sent',
                        clear: true
                    });
                });
            }
        });

        // Handle clear
        socket.on('clear',  (data) => {
            // Remove all chats from collection
            chat.remove({},  () => {
                // Emit cleared
                socket.emit('cleared');
            });
        });
    });
});

app.listen(3000, () => {console.log('Connected port 3000...');});