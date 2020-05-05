import Peer from "peerjs";

class PeerHost {
    constructor() {
        this.peer = null;
        this.connections = [];
        this.players = [];
    }

    start(peerConfig) {
        return new Promise((resolve, reject) => {
            this.peer = new Peer(peerConfig);
            this.peer.on('open', id => {
                resolve(id);
            });
            this.peer.on('connection', connection => {
                this.handleNewConnection(connection);
            });
            this.peer.on('disconnected', () => {
                console.log('Peer server disconnected');
                this.peer.reconnect();
            })
        })
    }

    handleNewConnection(connection) {
        this.connections.push(connection);
        connection.on('data', data => {
            if (data.request) {
                this.handleRequest(connection, data.request, data.data);
            }
            if (data.action) {
                this.handleAction(connection, data.action, data.data);
            }
        });
        connection.on('close', () => {
            this.handleConnectionClosure(connection);
        })
    }

    handleConnectionClosure(connection) {
        this.connections.splice(this.connections.indexOf(connection));
    }

    handleRequest(connection, type, data) {
        switch(type) {
            default:
                console.error(`No request with type: ${type}`);
        }
    }

    handleAction(connection, type, data) {
        switch(type) {
            default:
                console.error(`No action with type: ${type}`);
        }
    }
}

let hostInstance;

export function getPeerHost() {
    if (!hostInstance) {
        hostInstance = new PeerHost();
    }
    return hostInstance;
}