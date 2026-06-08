const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Set up explicit directory routing directly to this execution folder context layout
app.use(express.static(__dirname));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Production-ready persistent MongoDB engine cluster configuration connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/neighboursphere';
mongoose.connect(MONGO_URI)
  .then(() => console.log('📁 Database Engine Status: Connected to persistent storage ledger cleanly.'))
  .catch(err => console.error('❌ Database Link Failure State Trace: ', err));

// Structural Data Engine Layer Mapping
const MessageSchema = new mongoose.Schema({
    channel: { type: String, required: true, index: true },
    name: { type: String, required: true },
    initials: { type: String, required: true },
    text: { type: String, required: true },
    color: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', MessageSchema);

// REST Extraction Routing Layout Interface
app.get('/api/messages/:channel', async (req, res) => {
    try {
        const { channel } = req.params;
        const history = await Message.find({ channel }).sort({ timestamp: 1 }).limit(100);
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to synchronize cache historical buffers from node structures.' });
    }
});

// Middleware Fallback bypassing the strict Express 5 path compilers entirely
app.use((req, res, next) => {
    // If requests point to a missing API target route let it drop out inside REST errors handlers
    if (req.url.startsWith('/api/')) return next();
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Real-time Event Multi-cast Telemetry Logic Core Pipeline
let runningActiveClientsPool = 0;

io.on('connection', (socket) => {
    runningActiveClientsPool++;
    io.emit('userCountUpdate', runningActiveClientsPool);

    socket.on('sendMessage', async (data) => {
        try {
            const savedMessage = await Message.create({
                channel: data.channel,
                name: data.name,
                initials: data.initials,
                text: data.text,
                color: data.color
            });
            io.emit('messageReceived', savedMessage);
        } catch (err) {
            console.error('Core ledger engine storage failure drop track: ', err);
        }
    });

    socket.on('typing', (data) => {
        socket.broadcast.emit('typingBroadcast', data);
    });

    socket.on('stopTyping', (data) => {
        socket.broadcast.emit('stopTypingBroadcast', data);
    });

    socket.on('disconnect', () => {
        runningActiveClientsPool = Math.max(0, runningActiveClientsPool - 1);
        io.emit('userCountUpdate', runningActiveClientsPool);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 System Online: Access structural dashboard layout at http://localhost:${PORT}`);
});