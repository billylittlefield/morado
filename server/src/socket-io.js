import server from 'express-server';
import socketIO from 'socket.io';

export default socketIO(server);
