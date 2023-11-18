app.modules.chat = function(parent) {
	this.parent = parent;
	
	this.active = false;
	this.password = "secret";
	this.passwordShow = false;
	this.myKey = this.random(10);
	this.message = "";
	
	this.userService = createService('GET','/api/account');
	this.usersInfo = createService('GET','/api/chat/info');
	
	this.contAdmin = 0;
}

app.modules.chat.prototype.start = async function() {
	this.user = (await this.userService()).data;
	await this.getUsers();
}

app.modules.chat.prototype.getUsers = async function(loader){
	if(loader){
		$('.loader').fadeIn();
	}
	this.users = (await this.usersInfo()).data;
	if(loader){
		$('.loader').fadeOut();
		this.parent.refresh();
	}
}

app.modules.chat.prototype.setActive = function(){
	if(this.active && !this.server){
		this.connect();
		this.getUsers(true);
	}else if (this.active && this.server){
		this.server.close();
		this.connect();
		this.getUsers(true);
	}else if(!this.active && this.server && confirm('confirme desconección')){
		this.server.close();
		this.getUsers(true);
	}
}

app.modules.chat.prototype.connect = function(){
	if(location.protocol.indexOf('https') > -1){
		this.server = io(location.host, {secure: true});
	}else{
		this.server = io({transports: ['websocket']});
		}
	this.server.on("mtc", (data) => {this.mtc(data)});	
}

app.modules.chat.prototype.keypress = function(event) {
	if (event.originalEvent.which == 13) {
		this.send();
	}
}

app.modules.chat.prototype.send = function() {
	try{
		this.message = this.message.trim();
		if (this.message != "") {
			this.server.emit("mts", {
				msg: $.jCryption.encrypt(btoa(JSON.stringify({
					nickname: this.user.nickname,
					message: this.message,
					key: this.myKey,
				})), this.password)
			});
			this.message = "";
			$('#chat_input_message').focus();
		}
	}catch(e){
		alert(e);
		console.log(e);
		this.message = "";
	}
}

app.modules.chat.prototype.mtc = function(data){
	console.log(data);
	data.msg = $.jCryption.decrypt(data.msg, this.password);
	data.msg = atob(data.msg);
	if (data.msg != "") {
		data.msg = JSON.parse(data.msg);
		const c = document.getElementById("chat_list");
		const li = document.createElement("li");
		if(data.msg.key==this.myKey){
			li.setAttribute("class", "list-group-item pull-right");
		}else{
			li.setAttribute("class", "list-group-item pull-left");
		}
		//CREATED
		const s = document.createElement("small");
		s.innerHTML = moment(new Date(data.time)).format("H:mm");
		
		//NICKNAME
		const b = document.createElement("b");
		b.innerHTML = data.msg.nickname;
		
		//MESSAGE
		const p = document.createElement("p");
		if (data.msg.message) {
			p.innerHTML = data.msg.message;
		}
		
		li.appendChild(s);
		li.appendChild(b);
		li.appendChild(p);
		
		c.appendChild(li);
		
		c.scrollTo(0,c.scrollHeight);
		//$("#list-group").scrollTo(0,$("#list-group").scrollHeight);
		//window.scrollTo(0, document.body.scrollHeight);
	}
}

app.modules.chat.prototype.random = function(length){
	let possibleChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let text = "";
	for (let i = 0; i < length; i++){
		text += possibleChar.charAt(Math.floor(Math.random() * possibleChar.length));
	}
	return text;
}