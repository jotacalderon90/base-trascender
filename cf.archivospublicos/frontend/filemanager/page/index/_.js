const filemanager = function(parent) {
	this.parent = parent;
	this.service_read = createService('GET', ':path:id');
	this.service_folder_collection = createService("GET", ":path:id/collection");
	this.service_file_collection = createService("GET", ":path:id/collection");
}

filemanager.prototype.start = async function() {
	
	this.createFolder(document.getElementById("ul_directory"), "d0", {
		name: "/",
		file: "/api/filemanager/file/",
		folder: "/api/filemanager/folder/",
		path: "/"
	});

	$('.loader').fadeOut();
}

filemanager.prototype.archive = null,
filemanager.prototype.textFiles = ["txt", "html", "css", "js", "json", "csv", "md", "gitignore", "bowerrc"],
filemanager.prototype.mediaFiles = ["jpg", "gif", "png", "ico", "mp3", "mp4", "pdf"],

filemanager.prototype.close = function() {
	$("#ul_directory .selected").removeClass("selected");
	this.archive = null;
};

filemanager.prototype.clean = function() {
	$("#ul_directory .selected").removeClass("selected");
	this.archive = null;
	this.parent.refresh();
};

filemanager.prototype.select = async function(li) {
	try {
		let label = $(li).find("label");
		label.addClass("selected");
		this.archive = li;

		this.isFile = (label.attr("data-type") == "file") ? true : false;
		this.isFolder = (label.attr("data-type") == "folder") ? true : false;

		if (this.isFile) {
			this.name = label.text();
			this.fullname = label.attr("data-api-path");
			this.fullname = decodeURIComponent(this.fullname);
			this.type = this.name.split(".");
			this.type = this.type[this.type.length - 1];
			this.isTextFile = this.textFiles.indexOf(this.type) > -1;
			this.isMediaFile = this.mediaFiles.indexOf(this.type) > -1;
			this.fullnameDOWNLOAD = (label.attr("data-api-file") + btoa(this.fullname) + "/download");
			this.fullnameGET = (label.attr("data-api-file") + btoa(this.fullname) + "/getfile");
			if (this.isTextFile) {
				$(".loader").fadeIn();
				this.fileContent = await this.service_read({
					id: btoa(this.fullname),
					path: label.attr("data-api-file")
				});
				this.fileContent = this.fileContent.data;
				$(".loader").fadeOut();
			} else if (this.isMediaFile) {
				let child = null;
				switch (this.type) {
					case "jpg":
						child = document.createElement("img");
						child.setAttribute("src", this.fullnameGET);
						break;
					case "png":
						child = document.createElement("img");
						child.setAttribute("src", this.fullnameGET);
						break;
					case "gif":
						child = document.createElement("img");
						child.setAttribute("src", this.fullnameGET);
						break;
					case "ico":
						child = document.createElement("img");
						child.setAttribute("src", this.fullnameGET);
						break;
					case "mp3":
						child = document.createElement("audio");
						child.setAttribute("controls", "");
						child.setAttribute("src", this.fullnameGET);
						break;
					case "mp4":
						child = document.createElement("video");
						child.setAttribute("controls", "");
						child.setAttribute("src", this.fullnameGET);
						break;
					case "pdf":
						child = document.createElement("object");
						child.setAttribute("data", this.fullnameGET);
						child.setAttribute("type", "application/pdf");
						break;
				}
				$(".dv-visualcontent").html(child);
			}
		} else {
			this.name = label.text();
			this.fullname = label.attr("data-api-path");
			this.fullname = decodeURIComponent(this.fullname);

			let n = label.attr("data-api-path");
			n = label.attr("data-api-file") + btoa(n) + "/uploader";

			$("#fileupload").attr("action", n);
		}
	} catch (e) {
		console.log(e);
	}
	this.parent.refresh();
};

filemanager.prototype.createFolder = function(ulParent, id, directory) {
	const li = document.createElement("li");
	const input = document.createElement("input");
	input.type = "checkbox";
	input.id = id;
	input.onchange = async (element) => {
		this.clean();
		if (element.srcElement.checked) {
			this.select(element.srcElement.parentNode);
			const labelParent = $(element.srcElement.parentNode).find("label");
			let coll;
			const newid = btoa(encodeURIComponent(labelParent.attr("data-api-path")));

			coll = await this.service_folder_collection({
				id: newid,
				path: labelParent.attr("data-api-folder")
			});
			for (let i = 0; i < coll.data.length; i++) {
				this.createFolder(element.srcElement.parentNode.lastChild, element.srcElement.getAttribute("id") + "d" + i, {
					file: directory.file,
					folder: directory.folder,
					path: labelParent.attr("data-api-path") + coll.data[i] + "/",
					name: coll.data[i]
				});
			}

			coll = await this.service_file_collection({
				id: newid,
				path: labelParent.attr("data-api-file")
			});
			for (let i = 0; i < coll.data.length; i++) {
				const label = document.createElement("label");

				label.setAttribute("data-api-file", labelParent.attr("data-api-file"));
				label.setAttribute("data-api-folder", labelParent.attr("data-api-folder"));
				label.setAttribute("data-api-path", labelParent.attr("data-api-path") + coll.data[i]);
				label.setAttribute("data-type", "file");

				label.innerHTML = coll.data[i];

				const li = document.createElement("li");
				li.appendChild(label);
				li.onclick = (element) => {
					this.clean();
					this.select(element.srcElement.parentNode);
				}
				element.srcElement.parentNode.lastChild.appendChild(li);
			}
		} else {
			element.srcElement.parentNode.lastChild.innerHTML = "";
		}
	};
	li.appendChild(input);

	const label = document.createElement("label");
	label.setAttribute("for", id);
	label.setAttribute("class", "folder");

	label.setAttribute("data-api-file", directory.file);
	label.setAttribute("data-api-folder", directory.folder);
	label.setAttribute("data-api-path", directory.path);
	label.setAttribute("data-type", "folder");

	label.innerHTML = directory.name;
	li.appendChild(label);

	const ul = document.createElement("ul");
	ul.setAttribute("class", "inside");
	li.appendChild(ul);

	ulParent.appendChild(li);
};

app.modules.filemanager = filemanager;