const {google} = require('googleapis');

const self = function(){
	
	if(process.env.GOOGLE_CLIENTID && process.env.GOOGLE_CLIENTID!=""){
		this.enabled = true;
	}else{
		return;
	}
	
	// Create the google auth object which gives us access to talk to google's apis.
	this.createConnection = function(){
		return new google.auth.OAuth2(
			process.env.GOOGLE_CLIENTID,
			process.env.GOOGLE_SECRET,
			process.env.GOOGLE_REDIRECT
		);
	}

	//Get a url which will open the google sign-in page and request access to the scope provided (such as calendar events).
	this.getConnectionUrl = function(auth){
		return auth.generateAuthUrl({
			access_type: 'offline',
			prompt: 'consent', // access type and approval prompt will force a new refresh token to be made each time signs in
			scope: [
				'https://www.googleapis.com/auth/plus.me',
				'https://www.googleapis.com/auth/userinfo.email',
				//'https://www.googleapis.com/auth/gmail.compose'
			]
		});
	}

	//Helper function to get the library with access to the google plus api.
	this.getGooglePlusApi = function(auth){
		return google.plus({ version: 'v1', auth });
	}
}

self.prototype.getURL = function(){
	try{
		return (this.enabled)?this.getConnectionUrl(this.createConnection()):'';
	}catch(e){
		this.error = e;
		return null;
	}
}

self.prototype.getUserInfo = async function(code){
	try{
		// get the auth "tokens" from the request
		const auth1 = this.createConnection();
		const data = await auth1.getToken(code);
		const tokens = data.tokens;
		
		// add the tokens to the google api so we have access to the account
		const auth = this.createConnection();
		auth.setCredentials(tokens);
		
		// connect to google plus - need this to get the user's email
		const plus = this.getGooglePlusApi(auth);
		const me = await plus.people.get({ userId: 'me' });
		
		me.data.tokens = tokens;
		
		return me.data;
	}catch(e){
		throw(e);
	}
}

self.prototype.sendMemo = async function(tokens,raw){
	try{
		const auth = this.createConnection();
		auth.setCredentials(tokens);
		const plus = this.getGooglePlusApi(auth);
		console.log(plus);
		const res = await plus.users.messages.send({ userId: 'me', requestBody: {raw: raw}});
		return res.data;
	}catch(e){
		throw(e);
	}
}

module.exports = new self();