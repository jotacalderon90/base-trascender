"use strict";

const mailer = require("nodemailer");
const transport = require("nodemailer-smtp-transport");

const self = function(){
	if(process.env.SMTP_ACTIVE!=1){
		return;
	}
	this.createTransport = function(){
		//attachments : [{filename: 'text3.txt',path: 'Your File path'}]
		return mailer.createTransport(transport({
			host : process.env.SMTP_HOST,
			secureConnection : (process.env.SMTP_SECURECONNECTION)?true:false,
			port: process.env.SMTP_PORT,
			auth : {
				user : process.env.SMTP_USER, 
				pass : process.env.SMTP_PASS
			}
		}));
	}
}

self.prototype.send = function(body){
	if(process.env.SMTP_ACTIVE!=1){
		return;
	}
	return new Promise((resolve,reject)=>{
		body.bcc = process.env.ADMIN;
		body.from = (process.env.SMTP_FROM!=undefined && process.env.SMTP_FROM.trim()!="")?process.env.SMTP_FROM:process.env.SMTP_USER;
		this.createTransport().sendMail(body, function(e, response){
			if(e){
				return reject(e);
			}else{
				resolve(response);
			}
		});
	});
}

module.exports = new self();