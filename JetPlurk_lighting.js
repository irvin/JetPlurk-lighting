var loginStr = {
	username: '＊Plurk帳號＊',
	password: '＊Plurk密碼＊',
	api_key: '＊請於 http://www.plurk.com/API 取得 API Key 並填入＊'
};

var myStorage = {
	ReadOffset: null
};

var sliderObj = $(document); // Save slide object
var NewOffset = Date.parse(new Date()); // To remember latest refresh time
if (myStorage.ReadOffset == null) {
	myStorage.ReadOffset = Date.parse("January 1, 1975 00:00:00");
}
var JetPlurkVer = '030';
var ReadOffset = myStorage.ReadOffset; // Latest read plurk post time
var OldOffset = Date.parse(new Date()); // Oldest loaded plurk timestamp
var filterKind = "filterAll";
console.log('JetPlurk ' + JetPlurkVer + ' Start: NewOffset ' + NewOffset + ' OldOffset ' + OldOffset + ' ReadOffset ' + ReadOffset);

sliderObj.ready(function() {  
	// When document ready, preform reFreshPlurk()
	reFreshPlurk();
	
	// Show version of JetPlurk
	var content = "<div id='jetplurkmeta'>" + JetPlurkVer + "</div>";
	sliderObj.find('div#jetplurkmeta').replaceWith(content);
				
	// Add click event listener on all tab to refresh
	sliderObj.find('#filterAll').click(function(event) {
		  reFreshPlurk();
		  event.preventDefault();
		  event.stopPropagation(); // Stop event bubble
	  });

/*
	// Add click event listener on loadmore button
	sliderObj.find('#loadmore').click(function(event) {
		loadMorePlurk();
		event.preventDefault();
		event.stopPropagation(); // Stop event bubble
	});

	// Add click event listener on "Plurk" button for send plurk
	sliderObj.find("input.button").click(function(event) {
		sendPlurk();
		event.preventDefault();
		event.stopPropagation(); // Stop event bubble
	});

	// textarea auto resize
	sliderObj.find("#sendform textarea.txtarea").keypress(function (event) {
		var len = this.value.length + this.value.split(/[\x20-\x7e]/).join("").length;
		var H = Math.max(Math.ceil(len / 24) * 25, 25);
		$(this).css("height", H);
	}).keyup(function () {
		$(this).trigger("keypress");
	});
	
	// Plurk filter
	sliderObj.find("#filterPlurk div").click(function () {
		$(sliderObj).find("#filterPlurk div").removeClass("select");
		$(this).addClass("select");
		filterKind = $(this).attr("id");
		reFreshPlurk();
	});
*/
});

function reFreshPlurk() {
	// When reFreshPlurk, preform login and get newest plurk

	OldOffset = Date.parse(new Date());
	
	API.call('/Users/login', {                                            
			username:   loginStr.username,                     
			password:   loginStr.password,                    
			ssl:        true,                                         
		},                                                            
		function(jsObject) {
			console.log(jsObject)

			// Wipe out old msg
			sliderObj.find("msgs").fadeOut('medium', function() {
				$(sliderObj.contentDocument).find("msgs").remove();
				var content = "<msgs></msgs>";
				sliderObj.find('#loadmore').before(content);
				// ShowNewPlurk(jsObject);
				loadMorePlurk();
			});
			NewOffset = Date.parse(new Date()); // Remember refresh time
			console.log('JetPlurk refresh: NewOffset ' + NewOffset + ' OldOffset ' + OldOffset + ' ReadOffset ' + ReadOffset);

			// Show user meta
			var avatarurl = '';
			user_displayname = jsObject.user_info.display_name;
			if ((jsObject.user_info.has_profile_image == 1) && (jsObject.user_info.avatar == 0)) {
				avatarurl = 'http://avatars.plurk.com/' + jsObject.user_info.uid + '-medium.gif';
			}
			else if ((jsObject.user_info.has_profile_image == 1) &&
			(jsObject.user_info.avatar > 0)) {
				avatarurl = 'http://avatars.plurk.com/' + jsObject.user_info.uid + '-medium' + jsObject.user_info.avatar + '.gif';
			}
			else if (jsObject.user_info.has_profile_image == 0) {
				avatarurl = 'http://www.plurk.com/static/default_medium.gif';
			}

			var content = "<div id='usermeta'><a href='http://www.plurk.com'><div class='avatar' style='background: url(" + avatarurl + ")'></div></a><span class='displayname'>" + user_displayname + "</span> <span class='karma'>Karma:" + jsObject.user_info.karma + "</span></div>";
			sliderObj.find("#usermeta").replaceWith(content);
			
		},                                
		function(xhr, textStatus, errorThrown) {
			// Login error
			console.log('Login error: ' + xhr.status + ' ' + xhr.responseText);
		}                                    
	);
};
/*
function sendPlurk() {
	var sendFormObj = $(sliderObj.contentDocument).find('form#sendform');

	// when click sendplurk form submit button, check textarea, and submit plurk
	var response_txt = $(sendFormObj).find("textarea").val();
	if (response_txt != "") {
		$.ajax({
			url: "http://www.plurk.com/API/Timeline/plurkAdd",
			data: ({
				'api_key': loginStr.api_key,
				'content': response_txt,
				'qualifier': ':'
			}),
			success: function(json) {
				// Display new response
				reFreshPlurk();
				$(sendFormObj).find("textarea").attr('value', "").trigger("keypress");
			},
			error: function(xhr, textStatus, errorThrown) {
				console.log('Plurk error: ' + xhr.status + ' ' + xhr.responseText);
			}
		});
		
	}
}
*/
function ISODateString(d) {
	// ISO 8601 formatted dates example
	// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Date
	function pad(n) {
		return n < 10 ? '0' + n : n
	}
	return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds())
}

function postTime(d) {
	// Return str post time until now ()
	var timediff = ((Date.parse(new Date()) - Date.parse(d)) / 1000 / 60); // 1min
	if (timediff < 1) {
		return 'just posted';
	}
	else if (timediff < 60) {
		return (parseInt(timediff) + ' mins ago');
	}
	else if (timediff < 120) {
		return '1 hour ago';
	}
	else if (timediff < 1440) {
		return (parseInt(timediff / 60) + ' hours ago');
	}
	else if (timediff < 2880) {
		return '1 day ago';
	}
	else if (timediff < 10080) {
		return (parseInt(timediff / 1440) + ' days ago');
	}
	else if (timediff < 20160) {
		return '1 week ago';
	}
	else {
		return (parseInt(timediff / 10080) + ' weeks ago');
	}

}

function loadMorePlurk() {
	// When loadMorePlurk, get old plurks from OldOffset
	API.call('/Timeline/getPlurks', {
			offset: ISODateString(new Date(OldOffset)),
		},
		function(jsObject) {	// Success
			// Throw the loaded plurk to show plurk function
			// var jsObject = JSON.parse(json);
			// correct plurk api bugs
			jsObject.plurks_users = jsObject.plurk_users;
			// console.log(json)
			ShowNewPlurk(jsObject);
			console.log('JetPlurk Load More: NewOffset ' + NewOffset + ' OldOffset ' + OldOffset + ' ReadOffset ' + ReadOffset);
		},                                
		function(xhr, textStatus, errorThrown) {
			// Login error
			console.log('Login error: ' + xhr.status + ' ' + xhr.responseText);
		}
	);
	
	/*
	switch (filterKind) {
		case "filterUnRead":
			objData.url = "https://www.plurk.com/API/Timeline/getUnreadPlurks";
			objData.data["limit"] = 20;
			break;
		case "filterPrivate":
			objData.data["filter"] = "only_private";
			break;
		case "filterUser":
			objData.data["filter"] = "only_user";
			break;
		case "filterResponded":
			objData.data["filter"] = "only_responded";
			break;
	}
	$.ajax(objData);
	*/
};

function ShowNewPlurk(jsObject) {
	// Display each plurk

	$(jsObject.plurks).each(function(i) {
		var owner_id = jsObject.plurks[i].owner_id;
		var nick_name = jsObject.plurks_users[owner_id].nick_name;
		if (jsObject.plurks_users[owner_id].display_name != null) {
			var owner_display_name = jsObject.plurks_users[owner_id].display_name;
		}
		else {
			var owner_display_name = jsObject.plurks_users[owner_id].nick_name
		}
		var avatarurl = "http://www.plurk.com/static/default_medium.gif";
		if (jsObject.plurks_users[owner_id].has_profile_image == 1) {
			if (jsObject.plurks_users[owner_id].avatar <= 0) {
				avatarurl = 'http://avatars.plurk.com/' + owner_id + '-medium.gif';
			} else {
				avatarurl = 'http://avatars.plurk.com/' + owner_id + '-medium' + jsObject.plurks_users[owner_id].avatar + '.gif';
			}
		}

		if (jsObject.plurks[i].qualifier_translated != null) {
			// English qualifier
			var qualifier = jsObject.plurks[i].qualifier_translated;
		}
		else {
			var qualifier = jsObject.plurks[i].qualifier;
		}
		var premalink = jsObject.plurks[i].plurk_id.toString(36);
		var read = jsObject.plurks[i].is_unread;
		var response_count = jsObject.plurks[i].response_count;
		var responses_seen = jsObject.plurks[i].responses_seen;
		var postedtime = jsObject.plurks[i].posted;
		var timestr = postTime(jsObject.plurks[i].posted);
		var content = "<msg id='" + jsObject.plurks[i].plurk_id + "' postime='" + postedtime + "'";

		if ((read == 1) || ((ReadOffset < Date.parse(postedtime)) && (response_count == 0))) {
			// If message is unread
			content += " class='unread'>";
		}
		else if (responses_seen < response_count) {
			// If message response num. higher than seen-responses number
			content += " class='unreadresponse'>";
		}
		else {
			// Message is read
			content += ">";
		}

		content += "<content>";
		content += "<div class='avatar' style='background: url(" + avatarurl + ")'></div>";
		content += "<span class='plurker' value='" + nick_name + "'>" + owner_display_name + "</span> ";
		if (" :".indexOf(qualifier) < 0) {
			content += "[" + qualifier + "] ";
		}
		content += transContent(jsObject.plurks[i].content);
		content += "</content>";
		content += "<span class='meta'><timestr>" + timestr + "</timestr>";

		// Mute / unMute from @softcup
		if (jsObject.plurks[i].is_unread == 2) {
			content += " - <a class='mute' value='0'>unMute</a>";
		} else {
			content += " - <a class='mute' value='2'>Mute</a>";
		}
		// like / unlike from @softcup
		if (jsObject.plurks[i].favorite) {
			content += " - <a class='like' value='0'>unlike</a>";
		} else {
			content += " - <a class='like' value='1'>like</a>";
		}
		// RePlurk
		content += " - <a class='replurk'>RePlurk</a>";
		// Link
		content += " - <a class='permalink' href='http://www.plurk.com/m/p/" + premalink + "'>link</a>";

		if (response_count > 0) { // If has response
			content += "<responseNum>" + response_count + "</responseNum>";
		}
		content += "</span></msg>";
		// console.log('read ' + read + ' response_count ' + response_count + ' responses_seen ' + responses_seen + ' ' + content);
		
		sliderObj.find("msgs").append(content);
		OldOffset = Date.parse(postedtime); // Remember oldest loaded plurk time

		// Add hover event listener on each msg
		sliderObj.find("msg:last")
		.hover(
			function() {
				MsgHover($(this));
			},
			function() {
				// console.log("unHOVER!");
			}
		).click(function(event) {
			// Add click event listener on each msg
			// Click msg to show response form & responses
			// if (event.originalTarget.nodeName == "A") return;
			MsgClick($(this));
		})
		.attr('content_raw', jsObject.plurks[i].content_raw)
		.attr('nick_name', nick_name)
		.attr('link', 'http://www.plurk.com/p/' + premalink);

		// RePlurk
		sliderObj.find("msg:last a.replurk").click(function(event) {
			event.preventDefault();
			event.stopPropagation(); // Stop event bubble

			var pnode = $(this).parent().parent();
			var txt = pnode.attr('link') + " ([ReP]) " + "@" + pnode.attr("nick_name") + ": " + pnode.attr("content_raw");
			$(sliderObj.contentDocument).find("#sendform textarea.txtarea").val(txt).trigger("keypress");
		});

		// Mute
		sliderObj.find("msg:last a.mute").click(function(event) {
			event.preventDefault();
			event.stopPropagation(); // Stop event bubble

			var mute = this;
			var pnode = $(this).parent().parent();
			$.ajax({
				type: "POST",
				url : "http://www.plurk.com/TimeLine/setMutePlurk",
				data: "plurk_id=" + pnode.attr("id") + "&value=" + $(mute).attr("value"),
				success: function() {
					if ($(mute).attr("value") == 2) {
						$(mute).html("unMute");
						$(mute).attr("value", 0);
					} else {
						$(mute).html("Mute");
						$(mute).attr("value", 2);
					}
				}
			});
		});

		// Favorite
		sliderObj.find("msg:last a.like").click(function(event) {
			event.preventDefault();
			event.stopPropagation(); // Stop event bubble

			var like = this
			var val = ($(this).attr("value") == 1) ? "true" : "false";
			var pnode = $(this).parent().parent();
			$.ajax({
				type: "POST",
				url : "http://www.plurk.com/Favorites/set",
				data: "plurk_id=" + pnode.attr("id") + "&favorite=" + val + "&token=" + loginStr.api_key,
				success: function() {
					if ($(like).attr("value") == 1) {
						$(like).html("unlike");
						$(like).attr("value", 0);
					} else {
						$(like).html("like");
						$(like).attr("value", 1);
					}
				}
			});
		});

		// Re someone:
		sliderObj.find("msg:last span.plurker").click(function (event) {
			event.preventDefault();
			event.stopPropagation(); // Stop event bubble

			
			var pnode = $(this).parent().parent();
			if (pnode.find("responses").length > 0) {
				var txt = "@" + $(this).attr("value") + ": " + pnode.find("textarea").val();
				pnode.find("textarea").val(txt).focus().trigger("keypress");
			} else {
				var txt = "@" + $(this).attr("value") + ": ";
				$(sliderObj.contentDocument).find("#sendform textarea.txtarea").val(txt).focus().trigger("keypress");
			}

			return;
		});
	});

	//Set font size of display content
	/*
	$(sliderObj.contentDocument).find('msg content').css("font-size",set.fontsize/10 +"em");
	$(sliderObj.contentDocument).find('msg content').css("line-height",set.fontsize/10*1.1 +"em");
	*/
}

function MsgHover(hoverMsg) {
	// Called from ShowNewPlurk(jsObject)
	var selectPlurkID = parseInt(hoverMsg.attr("id"));
	var selectPlurkRead = hoverMsg.attr("class");
	var selectPlurkTimestamp = hoverMsg.attr("postime");
	// console.log('Hover: ' + selectPlurkID + ' Read [' + selectPlurkRead + '] Plurk time: ' + selectPlurkTimestamp + Date.parse(selectPlurkTimestamp) + ' ReadOffset ' + ReadOffset);

	if ((selectPlurkRead == 'unread') || (selectPlurkRead == 'unreadresponse')) {
		// if unread or unreadresponse, set to read when hover
		var boTrue = new Boolean(true);
		$.ajax({
			url: "http://www.plurk.com/API/Timeline/markAsRead",
			data: ({
				'api_key': loginStr.api_key,
				'ids': JSON.stringify([selectPlurkID]),
				'note_position': true
			}),
			success: function(json) {
				// console.log('Set read: ' + json);
				$(hoverMsg).removeClass("unread").removeClass("unreadresponse");
				if (Date.parse(selectPlurkTimestamp) > ReadOffset) {
					ReadOffset = Date.parse(selectPlurkTimestamp);
					myStorage.ReadOffset = ReadOffset;
					// console.log('myStorage.ReadOffset update: ' + myStorage.ReadOffset);
				}
			},
			error: function(xhr, textStatus, errorThrown) {
				console.log('Set read error: ' + xhr.status + ' ' + xhr.responseText);
			}
		});
	}
}

function MsgClick(clickMsg){
	// Called from ShowNewPlurk(jsObject)
	var selectPlurkID = parseInt(clickMsg.attr("id"));
	var selectPlurkResponseNum = clickMsg.find("responseNum").text();
	// console.log('Click: ' + selectPlurkID + ' responseNum ' + selectPlurkResponseNum);

	// If click msg has not showing response form, showing now
	if ($(clickMsg).find("responses").length <= 0) {

		$(clickMsg).append('<responses></responses>');
		// Show response form
		var content = "<form id='responseform' class='" + selectPlurkID + "'><textarea name='content' class='txtarea' rows='1'></textarea>" + "<input id='response_button' class='button' type='submit' value='Reponse' /></form>";
		$(clickMsg).find("responses").append(content);

		if (selectPlurkResponseNum != "") {
			// If click msg has response, get response
			MsgShowResponse(clickMsg, selectPlurkID);
		}

		$(clickMsg).find("textarea.txtarea").keypress(function (event) {
			var len = this.value.length + this.value.split(/[\x20-\x7e]/).join("").length;
			var H = Math.max(Math.ceil(len / 28) * 25, 25);
			$(this).css("height", H);
		}).keyup(function () {
			$(this).trigger("keypress");
		});

		// Add click event to response form, stop click to hide responses event
		$(clickMsg).find("form#responseform").click(function(event) {
			event.preventDefault();
			event.stopPropagation(); // Stop event bubble
		});
		$(clickMsg).find(":submit").click(function(event) {
			// when click response form submit button, check textarea, and submit response
			var response_txt = $(clickMsg).find("textarea").val();
			if (response_txt != "") {
				SubmitResponse(clickMsg, selectPlurkID, response_txt);
			}
			event.preventDefault();
			event.stopPropagation(); // Stop event bubble
		});

	}
	else {
		// If showing <responses> now, remove it
		$(clickMsg).find("responses").fadeOut('fast', function() {
			$(clickMsg).find("responses").remove();
		});
	}
}

function MsgShowResponse(clickMsg, selectPlurkID) {
	// Called from MsgClick(clickMsg)
	$.ajax({
		url: "http://www.plurk.com/API/Responses/get",
		data: ({
			'api_key': loginStr.api_key,
			'plurk_id': selectPlurkID,
			'from_response': 0
		}),
		success: function(json) {
			// console.log('Get response: ' + json);
			var jsObject = JSON.parse(json);

			// Display each response
			$(jsObject.responses).each(function(i) {
				var responser_id = jsObject.responses[i].user_id;
				var nick_name = jsObject.friends[responser_id].nick_name;
				if (jsObject.friends[responser_id].display_name != '') {
					var responser_display_name = jsObject.friends[responser_id].display_name;
				}
				else {
					var responser_display_name = nick_name;
				}
				var avatarurl = "http://www.plurk.com/static/default_small.gif";
				if (jsObject.friends[responser_id].has_profile_image == 1) {
					if (jsObject.friends[responser_id].avatar <= 0) {
						avatarurl = 'http://avatars.plurk.com/' + responser_id + '-small.gif';
					} else {
						avatarurl = 'http://avatars.plurk.com/' + responser_id + '-small' + jsObject.friends[responser_id].avatar + '.gif';
					}
				}
				var postedtime = jsObject.responses[i].posted;
				var timestr = postTime(jsObject.responses[i].posted);
				if (jsObject.responses[i].qualifier_translated != null) {
					// English qualifier
					var qualifier = jsObject.responses[i].qualifier_translated;
				}
				else {
					var qualifier = jsObject.responses[i].qualifier;
				}
				var content = "<response>";
				// content += '<div class="avatar" style="background: url(' + avatarurl + ')"></div>';
				content += "<span class='plurker' value='" + nick_name + "'>" + responser_display_name + "</span> ";
				if (" :".indexOf(qualifier) < 0) {
					content += "[" + qualifier + "] ";
				}
				content += transContent(jsObject.responses[i].content);
				content += " <span class='meta'><timestr>" + timestr + "</timestr></span></response>";
				// console.log(content);
				$(clickMsg).find("form#responseform").before(content);

				// Re someone
				$(clickMsg).find("response span.plurker").click(function (event) {
					event.preventDefault();
					event.stopPropagation(); // Stop event bubble

					var txt = "@" + $(this).attr("value") + ": " + $(clickMsg).find("textarea").val();
					$(clickMsg).find("textarea").val(txt).focus().trigger("keypress");
					return;
				});
			});
			/*
			$(clickMsg).find('response').css("font-size",set.fontsize/10.5 +"em");
			$(clickMsg).find('response').css("line-height",set.fontsize/10.5 * 1.1 +"em");
			*/
			// console.log($(clickMsg).html());
		},
		error: function(xhr, textStatus, errorThrown) {
			console.log('Get response error: ' + xhr.status + ' ' + xhr.responseText);
		}
	});
}

/*

function SubmitResponse(clickMsg, selectPlurkID, response_txt) {
	// Called from MsgClick(clickMsg)
	$.ajax({
		url: "http://www.plurk.com/API/Responses/responseAdd",
		data: ({
			'api_key': loginStr.api_key,
			'plurk_id': selectPlurkID,
			'content': response_txt,
			'qualifier': ':'
		}),
		success: function(json) {
			// console.log('Responsed: ' + json);
			// Display new response

			var reObject = JSON.parse(json);
			var responser_id = reObject.user_id;
			responser_display_name = user_displayname;

			var postedtime = reObject.posted;
			var timestr = postTime(reObject.posted);
			if (reObject.qualifier_translated != null) {
				// English qualifier
				var qualifier = reObject.qualifier_translated;
			}
			else {
				var qualifier = reObject.qualifier;
			}
			var content = "<response>" + responser_display_name + " ";
			if (qualifier != '') {
				content += "[" + qualifier + "] ";
			}
			content += reObject.content + " <span class='meta'><timestr>" + timestr + "</timestr></span></response>";
			// console.log(content);
			$(clickMsg).find("form#responseform").before(content);
			$(clickMsg).find("form#responseform").get(0).reset();
			$(clickMsg).find("textarea.txtarea").trigger("keypress");
		}
	});
}
*/
function transContent(txt) {
	return txt.replace(
		/<a([^>]*)href="([^>"]+)"([^>]*)>([^<]*)<\/a>/ig,
		function ($0, $1, $2, $3, $4) {
			if ($2.match(/\.(png|jpg|gif|jpeg|bmp)$/ig) == null) {
				return $0;
			}
			if ($4.toLowerCase().indexOf("<img") >= 0) {
				return $0;
			}
	
			return '<a' + $1 + 'href="' + $2 + '"' + $3 + '><img src="' + $2 + '" height="30" width="40"></a>';
		}
	);
}