const express = require('express');
const mongoose = require('mongoose');
const mongo = require('mongodb');
const bodyparser = require('body-parser');
const io = require('socket.io').listen(3000, () => { console.log('Port 3000, Fractured but whole...');}).sockets;

const app = express();

app.use(bodyparser.json());

app.use(express.static('public'));

// Connect to Database.
mongo.connect("mongodb://root:root@ds119070.mlab.com:19070/web-socket-chat", (err, db) => {
    if (err) {
        throw err;
    }

    io.on('connection', (socket) => {
        console.log('made socket connection', socket.id);
        let chat = db.collection('chats');
        sendStatus = (s) => {
            socket.emit('status', s);
        }

        chat.find().limit(100).sort({_id:1}).toArray((err, res) => {
            if (err) {
                throw err;
            }
            socket.emit('output');
        });

        socket.on('input', (data) => {
            let name = data.name;
            let message = data.message;

            if (name == '' || message == '') {
                sendStatus('Please enter a message name and message!');
            } else {
                chat.insert({
                    name: name,
                    message: message
                }, () =>{
                    io.emit(output, [data]);

                    sendStatus({
                        message: 'Message send',
                        clear: true
                    });
                });
            }
        });

        socket.on('clear', (data) => {
            chat.remove({}, () => {
                socket.emit('cleared');
            });
        });
    });
});