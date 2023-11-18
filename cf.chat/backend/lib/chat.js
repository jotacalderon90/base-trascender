"use strict";

const io = require("socket.io");
const logger = require('cl.jotacalderon.cf.framework/lib/log')('lib.chat');

const self = function(){
	this.sockets = [];
}

self.prototype.load = function(server){
	this.server = io(server);
	this.server.on("connection", (socket)=>{this.connection(socket)});
}

self.prototype.connection = function(socket){
	const id = socket.request.connection._peername.address + socket.request.connection._peername.family + socket.request.connection._peername.port;
	socket._id = id;
	socket.on("mts", (data)=>{this.mts(data)});
	socket.on("disconnect", ()=>{this.disconnect(id)});
	
	this.sockets.push(socket);
	
	logger.info(socket.request.connection.remoteAddress + ' connected (' + this.sockets.length + ')');
	
}

self.prototype.mts = function(data){
	let d = {};
	try{
		d.msg = data.msg;
		d.time = new Date();
		this.server.sockets.emit("mtc", d);
	}catch(e){
		logger.info('mts');
		logger.info(e);
	}
}

self.prototype.disconnect = function(id){
	const index = this.sockets.findIndex(r=>{
		return r._id===id;
	});
	if(index >- 1){
		this.sockets.splice(index,1);
		logger.info(index + "disconnected");
	}
}

module.exports = new self();