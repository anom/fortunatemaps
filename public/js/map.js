const markdownEditor = new SimpleMDE({ element: document.getElementById("commentInput") });

let lastAuthorSearchInput = "";

let tagInput = new TagInput({
	displayElem: $("#tagsDisplay"),
	input: $("#tagsInput"),
	addButton: $("#addTagBtn"),
	defaultType: 1,
	colorKey: SETTINGS.SITE.TAGS
});

let authorInput = new TagInput({
	displayElem: $("#authorsDisplay"),
	input: $("#authorsInput"),
	addButton: $("#addAuthorBtn"),
	defaultType: 1,
	colorKey: null,
	addTagConditionFunction: input => {
		return input.length === 24;
	}
});

updateComments();

updateProfileLinks();

tagInput.init(window.MAP_DATA.tags);
authorInput.init(window.MAP_DATA.authorIDs.map(a => ({name: a})));

$("#descriptionText").val(window.MAP_DATA.description);

$("#tagsGroup .dropdown-item").click(function(e){
	tagInput.addTag($(this).attr("data-type"), null);
});

setInterval(() => {
	let authorSearchInput = $("#authorsInput").val().slice(0, 24);

	if(authorSearchInput !== lastAuthorSearchInput) {
		if(authorSearchInput.length > 2 && authorSearchInput.length < 24) {
			fetch("/author_id/" + authorSearchInput).then(a => a.json()).then(data => {
				$("#authorSearchList").empty();
				if(data.users.length === 0) return $("#authorSearchList").append(`<li><b>No Results</b></li>`);

				data.users.forEach(item => {
					$("#authorSearchList").append(`<li data-id="${item.id}"><b>${item.username}</b> / <code>${item.id}</code></li>`);
				});

				resetAuthorHandlers();
			});
		} else {
			$("#authorSearchList").empty();
		}
	}

	lastAuthorSearchInput = authorSearchInput;
}, 300);

$("#saveMapSettings").click(() => {
	fetch("/update_map", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			mapID: window.MAP_DATA.mapID,
			tags: tagInput.tags,
			description: $("#descriptionText").val().trim(),
			authors: authorInput.tags.map(a => a.name),
			unlisted: $("#unlistedCheck").prop("checked")
		})
	}).then(a =>a.json()).then(json => {
		if(json.err) return alert("Error: " + json.err);
		if(!json.success) return alert("Error: Failed");

		location.reload();
	});
});

$("#submitCommentBtn").click(() => {
	fetch("/comment", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			mapID: window.MAP_DATA.mapID,
			body: markdownEditor.value()
		})
	}).then(a =>a.json()).then(json => {
		if(json.err) return alert("Error: " + json.err);
		if(!json.success) return alert("Error: Failed");

		location.reload();
	});
});

function updateComments() {
	$("#commentsContainer").empty();
	window.MAP_DATA.comments.forEach(comment => {
		let renderedMarkdown = marked(comment.body);
		let cleanMarkdown = DOMPurify.sanitize(renderedMarkdown);

		$("#commentsContainer").append(`
			<div class="card mb-2">
				<div class="card-body">
					<div class="media comment">
						<img class="avatar" src="/assets/user.png" class="mr-3">
						<div class="media-body ml-3">
							<div class="username">
								<b class="mt-0">
									<a class="profile-link" href="/profile/${comment.authorID}" target="_blank">${comment.authorID}</a>
								</b><br>
							</div>
							<span>${cleanMarkdown}</span>
						</div>
					</div>
				</div>
			</div>
		`);
	});
}

function resetAuthorHandlers() {
	$("#authorSearchList li").click(function(){
		let authorID = $(this).attr("data-id");

		$("#authorsInput").val(authorID);
	});
}

function updateProfileLinks() {
	let ids = [];
	$(".profile-link").each(function(idx){
		ids.push($(this).attr("href").split("/")[2]);
	});

	fetch("/author_names/" + ids.join(",")).then(a => a.json()).then(json => {
		$(".profile-link").each(function(idx){
			let id = $(this).attr("href").split("/")[2];
			$(this).text(json.usernames[id]);
		});
	});
}