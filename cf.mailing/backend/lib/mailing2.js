"use strict";

const mailer = require("nodemailer");
const transport = require("nodemailer-smtp-transport");

const self = function(){
	
}

self.prototype.send = function(config,body){
	
	return new Promise((resolve,reject)=>{
		
		body.bcc = config.bcc;
		body.from = config.from;
		
		mailer.createTransport(transport({
			host : config.host,
			secureConnection : config.secureconnection,
			port: config.port,
			auth : {
				user : config.user, 
				pass : config.password
			}
		})).sendMail(body, (error, response) => {
			if(error){
				return reject(error);
			}else{
				resolve(response);
			}
		});
	});
	
}

module.exports = new self();