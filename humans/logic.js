/* my modules */
	const processes = require("../processes");

/* create(name, email, password) */
	function create(name, email, password) {
		var salt = processes.random();
		var human = {
			id: processes.random(),
			name: name,
			email: null,
			status: {
				new_email: email,
				verified: false,
				verification: null,
				lockCount: 0,
				lockTo: 0
			},
			password: processes.hash(password, salt),
			salt: salt,
			created: new Date().getTime(),
			settings: {
				color_scheme: "default",
				font_scheme: "default",
				show_email: "true",
				show_help: "true"
			},
			information: {
				sites: [],
				bio: "...",
			},
			statistics: {
				wins: 0,
				losses: 0,
			},
			tour: [],
			tutorials: [],
			robots: [],
			arenas: []
		}

		return human;
	}

/* update(session, post, callback) */
	function update(session, post, callback) {
		var data = JSON.parse(post.data);
		var before = JSON.stringify(session.human)

		var fields = Object.keys(data);
		var messages = {top: "//changes submitted"};
		
		for (var i = 0; i < fields.length; i++) {
			switch (fields[i]) {
				case "bio":
					if (data.bio === session.human.information.bio) {
						//no change
					}
					else if (data.bio.replace(/<\\? ?br ?\\?>/g,"\n").replace(/(<([^>]+)>)/ig,"").length > 1000) {
						messages.bio = "//bio cannot exceed 1000 characters";
					}
					else {
						session.human.information.bio = data.bio.replace(/<\\? ?br ?\\?>/g,"\n").replace(/(<([^>]+)>)/ig,"");
						messages.bio = "//bio updated";
					}
				break;

				case "sites":
					if (data.sites.replace(/\s/g,"").replace(/\,/g,"") === session.human.information.sites.join()) {
						//no change
					}
					else {
						data.sites = data.sites.replace(/\s/g,"").replace(/(<([^>]+)>)/ig,"").split(",");
						for (var i = 0; i < data.sites.length; i++) {
							if (!(data.sites[i].length > 0)) {
								data.sites.splice(i,1);
								i--;
							}
							else if (!(/^(http\:\/\/|https\:\/\/)/g).test(data.sites[i])) {
								data.sites[i] = "http://" + data.sites[i];
							}
						}
						session.human.information.sites = data.sites;
						messages.sites = "//sites updated";
					}
				break;
			}
		}

		if (before !== JSON.stringify(session.human)) {
			processes.store("humans", {id: session.human.id}, session.human, function(human) {
				if (typeof human.id === "undefined") { human = human[0]; }
				callback({success: true, messages: messages, data: data, human: human});
			});
		}
		else {
			callback({success: true, data: data, messages: {top: "//no changes"}});
		}
	}

/* destroy(session, post, callback) */
	function destroy(session, post, callback) {
		var data = JSON.parse(post.data);

		if ((session.human !== null) && (typeof data.id !== null) && (data.id === session.human.id)) {
			processes.retrieve("humans", {id: session.human.id}, function(human) {
				if (typeof human.id === "undefined") { human = human[0]; }
				
				if ((typeof human === "undefined") || (typeof human.id === "undefined") || (human.id !== session.human.id)) {
					callback({success: false, messages: {top: "//unable to delete human"}});
				}
				else {
					var robots = [];
					for (var i = 0; i < human.robots.length; i++) {
						robots.push(human.robots[i].id);
					}

					processes.store("robots", {id: {$in: robots}}, null, function(robot) {
						processes.store("humans", {id: session.human.id}, null, function(human) {
							processes.store("sessions", {human: session.human.id}, {$set: {human: null}}, function(session) {
								callback({success: true, redirect: "../../../../"});
							});
						});
					});
				}
			});
		}
		else {
			callback({success: false, messages: {top: "//unable to delete human"}});
		}
	}

/* exports */
	module.exports = {
		create: create,
		update: update,
		destroy: destroy
	}
