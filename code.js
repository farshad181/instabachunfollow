// Unfollow script

function placeControls() {
	var div = document.getElementById("fi-controls");
	if (div != null) div.remove();
	
	div = document.createElement("div");
	div.innerHTML = '<div id="fi-controls" style="position: fixed;left: 0px;top: 0px;z-index: 10;display: inline; padding: 10px; border: 1px solid lightgray; background-color: white;"><div><label>Users to Unfollow:<br><textarea id="fi-to-follow" cols="20" rows="20" placeholder="pase to unfollow list"></textarea></label><button class="_0mzm- sqdOP L3NKy" onclick="startUnfollowUsers()">Start Unfollow All</button></div></div>';
	document.getElementsByTagName("body")[0].prepend(div);
}

function twoDigitNum(t) {
	return t < 10 ? t = "0" + t : t;
}

function log(message) {
	var today = new Date();
	var h = twoDigitNum(today.getHours());
	var m = twoDigitNum(today.getMinutes());
	var s = twoDigitNum(today.getSeconds());
	
	console.log("["+h+":"+m+":"+s+"] "+message);
}

function unfollowNextUser() {
	if (running) unfollowUserById(ids[i]);
}

function unfollowUserById(userid) {
	var xhttp = new XMLHttpRequest();
	
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4) {
			if (this.status == 200) {
				document.title = ++i + " of " + ids.length + " user unfollowed!";
				log("User: " + userid + " (" + i + "/" + ids.length + ") unfollowed.");
				round++;
				updateIdList();
				
				if ((i < ids.length) && running) {
					if(round == round_count) { // wait 1min more at 40
						round = 0;
						log("Round finished, waiting " + next_wait + " min...");
						setTimeout(unfollowNextUser, next_wait * 1000 * (60 - delay));
					} else {
						setTimeout(unfollowNextUser, 1000 * delay);
					}
				} else {
					log("following process finished.");
				}
			} else if ((this.status == 400) || (this.status == 403) || (this.status == 500)) {
				//document.title = "Error " + this.status + " at " + i;
				id = ids[i];
				ids.splice(i, 1);
				ids.push(id);
				updateIdList(true);
				log(i+"/"+ids.length+" failed! added to end of list.");
				
				log("Error recovery. Trying again " + error_wait + " min later.");
				setTimeout(unfollowNextUser, error_wait * 60000);
			}
		}
	};
	
	xhttp.open("POST", "https://www.instagram.com/web/friendships/" + userid + "/unfollow/", true);
	xhttp.setRequestHeader('x-csrftoken', window._sharedData.config.csrf_token);
	xhttp.send();
}

function updateIdList(movedToEnd = false) {
	if (!movedToEnd) {
		newIds = ids.slice(i);
	}
	
	document.getElementById('fi-to-follow').value = newIds.join("\n");
}

function stop() {
	running = false;
	log("Unfollowing process stopped.");
}

function startUnfollowUsers() {
	ids = document.getElementById('fi-to-follow').value.split("\n");

	if (ids.length > 0) {
		log("Starting to unfollow "+ids.length+" users...");
		
		i = 0;
		round = 0;
		running = true;
		unfollowUserById(ids[i]);
	}
}

error_wait = 1; // [min]
next_wait = 1; // [min]
round_count = 15;
delay = 44; // [sec]
running = true;

placeControls();
