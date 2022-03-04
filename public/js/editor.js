const URL_VARS = getUrlVars();

$("#editorFrame")[0].addEventListener("load", function() {
	$("#editorFrame")[0].contentWindow.postMessage("connection");
});

// Editor URL Params controller
if(URL_VARS["mapid"]) {
	$("#editorFrame").attr("src", "/map_editor/" + makeID() + "?mapid=" + URL_VARS["mapid"]);
} else if(URL_VARS["r"]) {
	$("#editorFrame").attr("src", "/map_editor/" + URL_VARS["r"]);
} else {
	$("#editorFrame").attr("src", "/map_editor/" + makeID());
}

window.addEventListener("message", event => {
	// console.log(event)
}, false);

function makeID() {
	return (Math.random().toString(36) + Math.random().toString(36).slice(2)).slice(2, 18);
}

function getUrlVars(){
	let vars = [], hash;
	let hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

	for(let i = 0; i < hashes.length; i++){
		hash = hashes[i].split('=');
		hash[1] = unescape(hash[1]);
		vars.push(hash[0]);
		vars[hash[0]] = hash[1];
	}

	return vars;
}