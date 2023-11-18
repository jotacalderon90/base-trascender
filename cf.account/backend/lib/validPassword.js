module.exports = function(contrasena){
	const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
	if (regex.test(contrasena)) {
		return true;
	} else {
		return false;
	}
}