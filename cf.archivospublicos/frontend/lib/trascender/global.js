
const app = angular.module('myApp', []);
app.modules = {};

const createService = function(METHOD, URL, HEADERS) {
    METHOD = METHOD.toUpperCase();

    const URIBuild = function(uri, params) {
        for (let attr in params) {
            uri = uri.replace(":" + attr, params[attr]);
        }
        return uri;
    }

    const execute = function(method, url, body, HEADERS) {
        return new Promise(function(resolve, reject) {
            const xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (xhttp.readyState == 4) {
                    if (xhttp.status == 401) {
                        location.reload();
                    }
                    try {
                        xhttp.json = JSON.parse(xhttp.responseText);
                        resolve(xhttp.json);
                    } catch (e) {
                        reject({
                            error: e,
                            xhttp: xhttp
                        });
                    }
                }
            };
            xhttp.open(method, url);

            xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            if (HEADERS) {
                for (attr in HEADERS) {
                    xhttp.setRequestHeader(attr, HEADERS[attr]);
                }
            }

            if (body != undefined) {
                if (typeof body != "string") {
                    body = JSON.stringify(body);
                }
                xhttp.send(body);
            } else {
                xhttp.send();
            }
        });
    }

    if (METHOD == "GET" || METHOD == "DELETE") {
        return function(params) {
            return execute(METHOD, URIBuild(URL, params), undefined, HEADERS);
        }
    } else if (METHOD == "POST" || METHOD == "PUT") {
        return function(params, body) {
            return execute(METHOD, URIBuild(URL, params), body, HEADERS);
        }
    }
}

const createServices = function(baseurl){
	return {
		total:		createService('GET', baseurl + '/total?query=:query'),
		collection: createService('GET', baseurl + '/collection?query=:query&options=:options'),
		tag:		createService('GET', baseurl + '/tag/collection'),
		create:		createService('POST', baseurl),
		read:		createService('GET', baseurl + '/:id'),
		update:		createService('PUT', baseurl + '/:id'),
		delete:		createService('DELETE', baseurl + '/:id')
	};
}

const basicGetter = async function(field,service,get,body){
	//try{
		const response = await service(get,body,);
		if(response.error){
			throw(response.message);
		}else if(response.resultado!=1){
			throw(response.descripcion);
		}else{
			this[field] = response.contenido
		}
	//}catch(e){
	//	myError("Error al obtener info", e.error || e.toString());
	//	console.log(e);
	//}	
}

const formatRowToFilter = function(r){
	let s = "";
	for(attr in r){
		s+=(r[attr]!=null)?r[attr].toString().toLowerCase():"";
	}
	return s;
}

const SOABF = function(coll,field){
	return coll.sort(function (a, b) {
		if (a[field] > b[field]) {
			return 1;
		}
		if (a[field] < b[field]) {
			return -1;
		}
		return 0;
	});
}

const sortCollection = function(c, f){
	this['sortInfo'] = c + '_' + f;
	if(!this['sort_' + c]){
		this['sort_' + c] = f;
		this[c] = this[c].reverse();
		this['isUpSorted'] = false;
	}else if(this['sort_' + c] === f){
		this[c] = this[c].reverse();
		this['isUpSorted'] = !this['isUpSorted'];
	}else{
		this['sort_' + c] = f;
		this[c] = SOABF(this[c],f);
		this['isUpSorted'] = true;
	}
}

const getSortClass = function(f,t){
	return (this.sortInfo === ('coll_' + f) && (this.isUpSorted == t))?'sortIconSelected':'';
}

const uniqueArray = function(row){
	return row.filter((value, index, self)=>{
		return self.indexOf(value) === index
	});
}

/*************/
/* PAGINATOR */
/*************/

const paginator = function(c,r){
	this.rowsByPage = r | 5;
	this.restart(c);
}

paginator.prototype.restart = function(c){
	this.coll = c;
	this.collDisplay = [];
	this.cant = c.length;
	this.setPages();
	this.gotoFirstPage();
}

paginator.prototype.setPages = function(){
	this.totalpages = Math.ceil(this.cant / this.rowsByPage);
	this.pages = [];
	for(var i=1;i<=this.totalpages;i++){
		this.pages.push(i);
	}
	this.selectedPage = 1;
}
	
paginator.prototype.gotoFirstPage = function(){
	//this.obtained = (1*this.rowsByPage) - this.rowsByPage;
	//this.getCollection();
	this.selectedPage = 1;
	this.setCollDisplay();
}
	
paginator.prototype.gotoPage = function(page){
	//this.obtained = (page*this.rowsByPage) - this.rowsByPage;
	//this.getCollection();
	this.selectedPage = page;
	this.setCollDisplay();
}
	
paginator.prototype.gotoLastPage = function(){
	//this.obtained = (this.pages[this.pages.length-1]*this.rowsByPage)-this.rowsByPage;
	//this.getCollection();
	this.selectedPage = this.pages.length;
	this.setCollDisplay();
}

paginator.prototype.gotoPrev = function(){
	if(this.selectedPage!=1){
		this.gotoPage(this.selectedPage-1);
	}
}
	
paginator.prototype.gotoNext = function(){
	if(this.pages.length>this.selectedPage){
		this.gotoPage(this.selectedPage+1);
	}
}

paginator.prototype.isSelected = function(page){
	return (page==this.selectedPage)?"active":"";
}
	
paginator.prototype.getPages = function(){
	if(this.pages.length <= 6){
		return this.pages;
	}else{
		if(this.selectedPage<=3){
			return this.pages.slice(0,6);
		}else{
			return this.pages.slice(this.selectedPage-3,this.selectedPage-3+6);
		}
	}
}

paginator.prototype.setCollDisplay = function(){
	const from = (this.selectedPage * this.rowsByPage) - this.rowsByPage;
	const to = (this.selectedPage * this.rowsByPage);
	this.collDisplay = this.coll.slice(from,to);
}

paginator.prototype.getCollection = function(){
	return this.collDisplay;
}

/*******************************/
/*PAGINATOR 2: SERVER PAGINADOR*/
/*******************************/
	
const ServerPaginator = function(cant,rowsByPage,parent){
	this.offset = 0;
	this.cant = cant;
	this.rowsByPage = rowsByPage || 10;
	this.parent = parent;
	this.setPages();
}
	
ServerPaginator.prototype.setPages = function(){
	this.totalpages = Math.ceil(this.cant / this.rowsByPage);
	this.pages = [];
	for(var i=1;i<=this.totalpages;i++){
		this.pages.push(i);
	}
	this.selectedPage = 1;
}

ServerPaginator.prototype.gotoFirstPage = function(){
	this.offset = (1*this.rowsByPage) - this.rowsByPage;
	this.parent.getCollection(true);
	this.selectedPage = 1;
}
	
ServerPaginator.prototype.gotoPage = function(page){
	this.offset = (page*this.rowsByPage) - this.rowsByPage;
	this.parent.getCollection(true);
	this.selectedPage = page;
}
	
ServerPaginator.prototype.gotoLastPage = function(){
	this.offset = (this.pages[this.pages.length-1]*this.rowsByPage)-this.rowsByPage;
	this.parent.getCollection(true);
	this.selectedPage = this.pages.length;
}

ServerPaginator.prototype.gotoPrev = function(){
	if(this.selectedPage!=1){
		this.gotoPage(this.selectedPage-1);
	}
}
	
ServerPaginator.prototype.gotoNext = function(){
	if(this.pages.length>this.selectedPage){
		this.gotoPage(this.selectedPage+1);
	}
}

ServerPaginator.prototype.isSelected = function(page){
	return (page==this.selectedPage)?"active":"";
}
	
ServerPaginator.prototype.getPages = function(){
	if(this.pages.length <= 10){
		return this.pages;
	}else{
		if(this.selectedPage<=5){
			return this.pages.slice(0,10);
		}else{
			return this.pages.slice(this.selectedPage-5,this.selectedPage-5+10);
		}
	}
}

/********/
/* SWAL */
/********/

const myConfirm = function(title){
	return new Promise(function(resolve, reject) {
		Swal.fire({
			title: title,
			showDenyButton: false,
		  	showCancelButton: true,
		  	confirmButtonText: 'Aceptar',
		  	cancelButtonText: 'Cancelar',
		}).then((result) => {
		  	if (result.isConfirmed) {
				resolve(true);
		  	}else{
				resolve(false);
			}
		});
	});
}

const myError = function(title, msg){
	Swal.fire({
		icon: 'error',
	  	title: title,
	  	text: msg
	});
}

/************ */
/* GET PARAMS */
/************ */
const urlParams = new URLSearchParams(window.location.search);

/******* */
/*RANDOM */
/******* */
const newRandom = function(length){
	const possibleChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let text = "";
	for (let i = 0; i < length; i++){
		text += possibleChar.charAt(Math.floor(Math.random() * possibleChar.length));
	}
	return text;
}

/** BASE 64 */
const getBase64 = function(file) {
	return new Promise(function(resolve, reject) {
		try{
			console.log(file);
		   	const reader = new FileReader();
		   	reader.fileName = file.name
		   	reader.readAsDataURL(file);
		   	reader.onload = function () {
				const doc = new Object();
				doc.filename = newRandom(10) + '.jpg';//file.name
				doc.fileB64 = reader.result.split(',')[1];
				resolve({data: doc});
			};
			reader.onerror = function (error) {
				resolve({data: null, error: error});
			};
		}catch(error){
			resolve({data: null, error: error});
		}
	});
}

/*********************** */
/**VALIDA RUT XXXXXXXX-X */
/*********************** */
const Rut = {
	valida : function (rutCompleto) {
		rutCompleto = rutCompleto.replace(/\./g, '')
		if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test( rutCompleto ))
			return false;
		const tmp = rutCompleto.split('-');
		const digv = tmp[1].toLowerCase(); 
		const rut = tmp[0];
		return (Rut.dv(rut) == digv );
	},
	dv : function(T){
		var M=0,S=1;
		for(;T;T=Math.floor(T/10))
			S=(S+T%10*(9-M++%6))%11;
		return S?S-1:'k';
	},
	obtenerRut : function (rutCompleto) {
		return rutCompleto.replace(/\./g, '').split('-')[0];
	}
}

const validaMail = function(email){	
	if(!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)){
		return false;
	}
	return true;
}
			

/****************** */
/**GET FECHA MOMENT */
/****************** */
const getFecha = function(data, type, row)  {
	if(!data) return '';
	if ( arguments.length === 1 ) type = 'display';
	var m = moment(data,'YYYY-MM-DD HH:mm:ss.S');
	return m.format( type === 'sort' || type === 'type' ? 'x' : 'DD-MM-YYYY HH:mm' );
}


/*** */
/*CSV*/
/*** */
const downloadCSV = function(data, filename) {
    const csvFile = new Blob([data], {type: "text/csv;charset=utf8"});
	const downloadLink = document.createElement("a");
	downloadLink.download = filename;
	downloadLink.href = window.URL.createObjectURL(csvFile);
	downloadLink.style.display = "none";
	document.body.appendChild(downloadLink);
	downloadLink.click();
}

const downloadXLSX = function(data,filename) {
	console.log(data);
	var workbook = XLSX.utils.book_new(),
    worksheet = XLSX.utils.aoa_to_sheet(data);
	workbook.SheetNames.push("First");
	workbook.Sheets["First"] = worksheet;
	XLSX.writeFile(workbook, filename + '.xlsx');
}

/*******/
/*TOUCH*/
/*******/
const addTouchEvent = function(element,parent,callback){
	
	let xDown,yDown,detectSwipe;
	
	const getTouches = function(evt){
		return evt.touches || // browser API
		evt.originalEvent.touches; // jQuery
	}
	
	const handleTouchStart = function(evt) {
		const firstTouch = getTouches(evt)[0];                                      
		xDown = firstTouch.clientX;                                      
		yDown = firstTouch.clientY;                                      
	}
	
	const handleTouchMove = function(evt) {
		if ( ! xDown || ! yDown ) {
			return;
		}
		var xUp = evt.touches[0].clientX;                                    
		var yUp = evt.touches[0].clientY;
		var xDiff = xDown - xUp;
		var yDiff = yDown - yUp;
		if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
			if ( xDiff > 0 ) {
				detectSwipe = 'left';
			} else {
				detectSwipe = 'right';
			}                       
		} else {
			if ( yDiff > 0 ) {
				detectSwipe = 'up';
			} else { 
				detectSwipe = 'down';
			}                                                                 
		}
		/* reset values */
		xDown = null;
		yDown = null;                             
	}
	
	document.querySelector(element).addEventListener('touchstart', (evt)=>{handleTouchStart(evt)});
	document.querySelector(element).addEventListener('touchmove', (evt)=>{handleTouchMove(evt)});
	document.querySelector(element).addEventListener('touchend', ()=>{parent[callback](detectSwipe);detectSwipe = null;});
		
}

/******/
/*COPY*/
/******/
const copy = function(content) {
	const aux = document.createElement("input");
	content = content.split("\n").join("");
	aux.setAttribute("value", content);
	document.body.appendChild(aux);
	aux.select();
	document.execCommand("copy");
	document.body.removeChild(aux);
}

/************/
/*SORT ARRAY*/
/************/
const sortArrayByField = function(coll,field){
	return coll.sort(function (a, b) {
		if (a[field] > b[field]) {
			return 1;
		}
		if (a[field] < b[field]) {
			return -1;
		}
		return 0;
	});
}

/**********/
/*TEXTAREA*/
/**********/
const textareaTab = function(e){
	var keyCode = e.keyCode || e.which;
	if (keyCode == 9) {
		e.preventDefault();
		var start = this.selectionStart;
		var end = this.selectionEnd;
		// set textarea value to: text before caret + tab + text after caret
		$(this).val($(this).val().substring(0, start) + "\t" + $(this).val().substring(end));
		// put caret at right position again
		this.selectionStart =
		this.selectionEnd = start + 1;
	}
}

/******/
/*WAIT*/
/******/
const wait = function(TIME){
	return new Promise(function(resolve, reject) {
		setTimeout(function(){
			resolve();
		}, TIME);
	});
}