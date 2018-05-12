const mongo = require('mongodb').MongoClient    ;
const Schema = mongo.Schema;

// Chat Schema
var ChatSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    coordinates: {
        type: String,
        required: true
    }
});


const Chat = mongo.model('chat', ChatSchema);

module.exports = chat;