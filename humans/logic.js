/* my modules */
	const processes = require("../assets/logic");

/* create(name, email, password) */
	function create(name, email, password) {
		var salt = processes.random();
		var human = {
			id: processes.random(),
			created: new Date().getTime(),
			updated: new Date().getTime(),
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
			favorites: {
				humans: {},
				robots: {}
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
						for (var j = 0; j < data.sites.length; j++) {
							if (!(data.sites[j].length > 0)) {
								data.sites.splice(j,1);
								j--;
							}
							else if (!(/^(http\:\/\/|https\:\/\/)/g).test(data.sites[j])) {
								data.sites[j] = "http://" + data.sites[j];
							}
						}
						session.human.information.sites = data.sites;
						messages.sites = "//sites updated";
					}
				break;
			}
		}

		console.log(data.bio);
		console.log(session.human.information.bio);

		if (before === JSON.stringify(session.human)) {
			callback({success: false, data: data, messages: {top: "//no changes"}});
		}
		else {
			processes.store("humans", {id: session.human.id}, {$set: {information: session.human.information, updated: new Date().getTime()}}, {}, function (human) {
				callback({success: true, messages: messages, data: data, human: human});
			});
		}
	}

/* destroy(session, post, callback) */
	function destroy(session, post, callback) {
		var data = JSON.parse(post.data);

		if ((session.human === null) || (typeof data.id === "undefined") || (data.id !== session.human.id)) {
			callback({success: false, messages: {top: "//not authorized"}});
		}
		else if ((typeof post.current_password === "undefined") || (post.current_password.length < 8)) {
			callback({success: false, messages: {email: "//enter your current password"}});
		}
		else {
			processes.retrieve("humans", {id: session.human.id, password: processes.hash(post.current_password, session.human.salt)}, {}, function (human) {		
				if (!human) {
					callback({success: false, messages: {top: "//invalid password"}});
				}
				else {
					var robots = [];
					for (var i = 0; i < human.robots.length; i++) {
						robots.push(human.robots[i].id);
					}

					processes.store("robots", {id: {$in: robots}}, null, {$multi: true}, function (robots) {
						processes.store("humans", {id: session.human.id}, null, {}, function (human) {
							processes.store("sessions", {human: session.human.id}, {$set: {human: null, updated: new Date().getTime()}}, {}, function (session) {
								callback({success: true, redirect: "../../../../"});
							});
						});
					});
				}
			});
		}
	}

/* favorite(session, post, callback) */
	function favorite(session, post, callback) {
		var data = JSON.parse(post.data) || null;

		if (!session.human) {
			callback({success: false, messages: {top: "//not authorized"}});
		}
		else if (!data.favorite_id) {
			callback({success: false, messages: {top: "//invalid request"}});
		}
		else if ((!data.favorite_type) || ((data.favorite_type !== "humans") && (data.favorite_type !== "robots"))) {
			callback({success: false, messages: {top: "//invalid request"}});
		}
		else {
			processes.retrieve(data.favorite_type, {id: data.favorite_id}, {}, function (favorite) {
				if (!favorite) {
					callback({success: false, messages: {top: "//" + data.favorite_type.substring(0,data.favorite_type.length - 1) + " not found"}});
				} 
				else if (post.action === "add_favorite") {
					var set = {};
					set["favorites." + data.favorite_type + "." + data.favorite_id] = favorite.name;
					set.updated = new Date().getTime();          

					processes.store("humans", {id: session.human.id}, {$set: set}, {}, function (human) {
						callback({success: true, messages: {top: "//added favorite"}, favorite: {id: favorite.id, name: favorite.name}});
					});
				}
				else if (post.action === "remove_favorite") {
					var unset = {};
					unset["favorites." + data.favorite_type + "." + data.favorite_id] = null;

					processes.store("humans", {id: session.human.id}, {$unset: unset, $set: {updated: new Date().getTime()}}, {}, function (human) {
						callback({success: true, messages: {top: "//removed favorite"}, favorite: {id: favorite.id, name: favorite.name}});
					});
				}
			});
		}

	}

/* exports */
	module.exports = {
		create: create,
		update: update,
		destroy: destroy,
		favorite: favorite
	}
