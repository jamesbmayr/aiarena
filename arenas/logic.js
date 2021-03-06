/* my modules */
	const processes = require("../assets/logic");
	const vm = require("vm");

/* create(session, post, callback) */
	function create(session, post, callback) {
		var parameters = JSON.parse(post.data) || null;
		var preset = parameters.preset || "custom";

		if (preset !== "custom") {
			switch (preset) {
				case "default":
					parameters = {
						players: {
							minimum: 2,
							maximum: 6,
							workshopDuration: 300000,
							workshopPeriod: 10
						},
						cubes: {
							colors: ["red", "orange", "yellow", "green", "blue", "purple"],
							startCount: 1,
							maximum: 255,
							spawnRate: 1,
							spawnMemory: 2,
							dissolveRate: 0,
							dissolveIndex: "oldest"
						},
						robots: {
							startPower: 1,
							maxPower: 255,
							powerRate: 1,
							tieBreaker: "cascade",
							actions: ["power","take","sleep"]
						},
						victory: {
							conditions: ["1of6","2of3","6of1"],
							tieBreaker: "efficient",
							multiplier: 1
						}
					}
				break;

				case "simple":
					parameters = {
						players: {
							minimum: 2,
							maximum: 4,
							workshopDuration: 300000,
							workshopPeriod: 10
						},
						cubes: {
							colors: ["red", "yellow", "blue"],
							startCount: 0,
							maximum: 255,
							spawnRate: 1,
							spawnMemory: 0,
							dissolveRate: 1,
							dissolveIndex: "newest"
						},
						robots: {
							startPower: 1,
							maxPower: 255,
							powerRate: 1,
							tieBreaker: "dissolve",
							actions: ["power","take","sleep"]
						},
						victory: {
							conditions: ["2of3","6of1"],
							tieBreaker: "tie",
							multiplier: 1
						}
					}
				break;

				case "deathmatch":
					parameters = {
						players: {
							minimum: 2,
							maximum: 2,
							workshopDuration: 300000,
							workshopPeriod: 5
						},
						cubes: {
							colors: ["red", "orange", "yellow", "green", "blue", "purple"],
							startCount: 1,
							maximum: 24,
							spawnRate: 2,
							spawnMemory: 3,
							dissolveRate: 0,
							dissolveIndex: "none"
						},
						robots: {
							startPower: 10,
							maxPower: 20,
							powerRate: 2,
							tieBreaker: "leave",
							actions: ["power","take","sleep","sap","halftake"]
						},
						victory: {
							conditions: ["1of6","2of3","6of1"],
							tieBreaker: "efficient",
							multiplier: 1
						}
					}
				break;

				case "advanced":
					parameters = {
						players: {
							minimum: 2,
							maximum: 6,
							workshopDuration: 300000,
							workshopPeriod: 10
						},
						cubes: {
							colors: ["red", "orange", "yellow", "green", "blue", "purple"],
							startCount: 2,
							maximum: 48,
							spawnRate: 2,
							spawnMemory: 4,
							dissolveRate: 1,
							dissolveIndex: "oldest"
						},
						robots: {
							startPower: 3,
							maxPower: 20,
							powerRate: 3,
							tieBreaker: "leave",
							actions: ["power","take","sleep","sap","halftake","fliptake"]
						},
						victory: {
							conditions: ["1of6","2of3","3of2","6of1"],
							tieBreaker: "greedy",
							multiplier: 2
						}
					}
				break;

				case "intense":
					parameters = {
						players: {
							minimum: 6,
							maximum: 6,
							workshopDuration: 120000,
							workshopPeriod: 20
						},
						cubes: {
							colors: ["red", "orange", "yellow", "green", "blue", "purple"],
							startCount: 0,
							maximum: 48,
							spawnRate: 4,
							spawnMemory: 2,
							dissolveRate: 2,
							dissolveIndex: "newest"
						},
						robots: {
							startPower: 10,
							maxPower: 255,
							powerRate: 10,
							tieBreaker: "catchup",
							actions: ["power","take","sleep","sap","shock","burn","halftake","swaptake","fliptake"]
						},
						victory: {
							conditions: ["1of6","2of3","3of2","6of1"],
							tieBreaker: "efficient",
							multiplier: 4
						}
					}
				break;

				case "scarcity":
					parameters = {
						players: {
							minimum: 4,
							maximum: 6,
							workshopDuration: 120000,
							workshopPeriod: 10
						},
						cubes: {
							colors: ["red", "orange", "yellow", "green", "blue", "purple"],
							startCount: 2,
							maximum: 255,
							spawnRate: 1,
							spawnMemory: 4,
							dissolveRate: 0,
							dissolveIndex: "none"
						},
						robots: {
							startPower: 255,
							maxPower: 255,
							powerRate: 10,
							tieBreaker: "leave",
							actions: ["sleep","sap","shock","burn","halftake","swaptake","fliptake"]
						},
						victory: {
							conditions: ["1of6","6of1"],
							tieBreaker: "greedy",
							multiplier: 1
						}
					}
				break;

				case "random":
					parameters = {
						players: {
							minimum: 3,
							maximum: 6,
							workshopDuration: 60000,
							workshopPeriod: 20
						},
						cubes: {
							colors: ["red", "orange", "yellow", "green", "blue", "purple"],
							startCount: 1,
							maximum: 255,
							spawnRate: 2,
							spawnMemory: 0,
							dissolveRate: 1,
							dissolveIndex: "random"
						},
						robots: {
							startPower: 2,
							maxPower: 255,
							powerRate: 2,
							tieBreaker: "random",
							actions: ["power","take","sleep","sap","shock","fliptake"]
						},
						victory: {
							conditions: ["1of6","3of2","6of1"],
							tieBreaker: "random",
							multiplier: 3
						}
					}
				break;

				case "custom":
				default:
					//
				break;
			}
		}

		if (((session.human == null) || (((session.human.statistics.wins * 5) + session.human.statistics.losses) < 25)) && ((parameters.robots.actions.indexOf("sap") > -1) || (parameters.robots.actions.indexOf("halftake") > -1) || (parameters.robots.actions.indexOf("fliptake") > -1))) {
			callback({success: false, messages: {top: "//unable to create arena; actions too advanced"}});
		}
		else if (((session.human == null) || (((session.human.statistics.wins * 5) + session.human.statistics.losses) < 50)) && ((parameters.robots.actions.indexOf("shock") > -1) || (parameters.robots.actions.indexOf("burn") > -1) || (parameters.robots.actions.indexOf("swaptake") > -1))) {
			callback({success: false, messages: {top: "//unable to create arena; actions too expert"}});
		}
		else {
			var arena = {
				id: processes.random(4),
				created: new Date().getTime(),
				updated: new Date().getTime(),
				humans: null,
				entrants: {},
				state: {
					start: null,
					locked: true,
					pauseFrom: null,
					pauseTo: null,
					end: null,
					victors: [],
					preset: preset,
					maker_wins: null,
					maker_losses: null
				},
				rules: {
					players: {
						minimum: Number(parameters.players.minimum) || 2,
						maximum: Number(parameters.players.maximum) || 6,
						workshopDuration: Number(parameters.players.workshopDuration) || (5 * 60 * 1000),
						workshopPeriod: Number(parameters.players.workshopPeriod) || 10,
					},
					cubes: {
						colors: parameters.cubes.colors || ["red", "orange", "yellow", "green", "blue", "purple"],
						startCount: Number(parameters.cubes.startCount) || 1,
						maximum: Number(parameters.cubes.maximum) || 255,
						spawnRate: Number(parameters.cubes.spawnRate) || 1,
						spawnMemory: Number(parameters.cubes.spawnMemory) || 2,
						dissolveRate: Number(parameters.cubes.dissolveRate) || 0,
						dissolveIndex: parameters.cubes.dissolveIndex || "none",
					},
					robots: {
						startPower: Number(parameters.robots.startPower) || 1,
						maxPower: Number(parameters.robots.maxPower) || 255,
						powerRate: Number(parameters.robots.powerRate) || 1,
						tieBreaker: parameters.robots.tieBreaker || "cascade",
						actions: parameters.robots.actions || ["power", "take", "sleep"],
					},
					victory: {
						conditions: parameters.victory.conditions || ["6of1", "2of3", "1of6"],
						tieBreaker: parameters.victory.tieBreaker || "efficient",
						multiplier: Number(parameters.victory.multiplier) || 1,
					}
				},	
				rounds: [],
			}

			if (session.human !== null) { //create arena signed in
				if (post.action === "random_arena") { //if this arena is created as a random arena
					arena.humans = [0, session.human.id]; //the creator should be 0, not the human
					arena.state.start = new Date().getTime() + (2 * 60 * 1000); //set it to automatically start in 2 minutes
				}
				else { //if this arena is created normally
					arena.humans = [session.human.id];
					arena.state.start = null;
				}

				arena.state.maker_wins = session.human.statistics.wins;
				arena.state.maker_losses = session.human.statistics.losses;

				processes.store("humans", {id: session.human.id}, {$push: {arenas: arena.id}, $set: {updated: new Date().getTime()}}, {}, function (human) {
					processes.store("arenas", null, arena, {}, function (results) {
						callback({success: true, redirect: "../../../../arenas/" + arena.id});
					});
				});
			}
			else { //create arena signed out
				arena.humans = [0, "session_" + session.id]; //the creator should be 0, not the human
				arena.state.start = new Date().getTime() + (2 * 60 * 1000); //set it to automatically start in 2 minutes

				arena.state.maker_wins = 10;
				arena.state.maker_losses = 10;

				processes.store("arenas", null, arena, {}, function (results) {
					callback({success: true, redirect: "../../../../arenas/" + arena.id});
				});
			}
		}
	}

/* destroy(session, post, callback) */
	function destroy(session, post, callback) {
		var data = JSON.parse(post.data);

		processes.retrieve("arenas", {id: data.arena_id}, {}, function (arena) {	
			if (!arena) {
				callback({success: false, messages: {top: "//unable to retrieve arena"}});
			}
			else if (arena.humans[0] !== session.human.id) {
				callback({success: false, messages: {top: "//not authorized"}});
			}
			else if (arena.state.end !== null) {
				callback({success: false, messages: {top: "//arena already concluded"}});
			}
			else if (arena.rounds.length > 0) {
				callback({success: false, messages: {top: "//arena already started"}});	
			}
			else {
				processes.store("humans", {id: {$in: arena.humans}}, {$pull: {arenas: arena.id}, $set: {updated: new Date().getTime()}}, {$multi: true}, function (humans) {
					processes.store("arenas", {id: arena.id}, null, {}, function (results) {
						callback({success: true, messages: {top: "//arena deleted"}, redirect: "../../../../arenas"});
					});
				});
			}
		});
	}

/* joinin(session, post, callback) */
	function joinin(session, post, callback) {
		var data = JSON.parse(post.data);

		if ((typeof data.arena_id === "undefined") || (data.arena_id.length !== 4)) {
			callback({success: false, messages: {top: "//invalid arena id"}});
		}
		else {
			processes.retrieve("arenas", {id: data.arena_id.toLowerCase()}, {$multi: true}, function (arenas) {
				if (!arenas) {
					callback({success: false, messages: {top: "//invalid arena id"}});
				}
				else {
					var arena = arenas[0];
				}

				if ((typeof arena == "undefined") || (!arena)) {
					callback({success: false, messages: {top: "//invalid arena id"}});
				}
				else if (arena.humans.length >= arena.rules.players.maximum) {
					callback({success: false, messages: {top: "//unable to join arena; human maximum exceeded"}});
				}
				else if ((arena.state.start !== null) && (arena.state.start < new Date().getTime())) {
					callback({success: false, messages: {top: "//unable to join arena; game has already started"}});
				}
				else if ((session.human !== null) && (arena.humans.indexOf(session.human.id) > -1)) {
					callback({success: false, messages: {top: "//arena already contains this human"}});
				}
				else if (arena.humans.indexOf("session_" + session.id) > -1) { //for a signed out arena
					callback({success: false, messages: {top: "//arena already contains this human"}});
				}
				else if (((session.human == null) || (((session.human.statistics.wins * 5) + session.human.statistics.losses) < 25)) && ((arena.rules.robots.actions.indexOf("sap") > -1) || (arena.rules.robots.actions.indexOf("halftake") > -1) || (arena.rules.robots.actions.indexOf("fliptake") > -1))) {
					callback({success: false, messages: {top: "//unable to join arena; actions too advanced"}});
				}
				else if (((session.human == null) || (((session.human.statistics.wins * 5) + session.human.statistics.losses) < 50)) && ((arena.rules.robots.actions.indexOf("shock") > -1) || (arena.rules.robots.actions.indexOf("burn") > -1) || (arena.rules.robots.actions.indexOf("swaptake") > -1))) {
					callback({success: false, messages: {top: "//unable to join arena; actions too expert"}});
				}
				else {
					if (session.human !== null) { //join arena signed in					
						processes.store("humans", {id: session.human.id}, {$push: {arenas: arena.id}, $set: {updated: new Date().getTime()}}, {}, function (human) {
							processes.store("arenas", {id: arena.id}, {$push: {humans: session.human.id}, $set: {updated: new Date().getTime()}}, {}, function (arena) {
								callback({success: true, messages: {top: "//arena joined successfully"}, redirect: "../../../../arenas/" + arena.id});
							});
						});
					}
					else { //join arena signed out
						processes.store("arenas", {id: arena.id}, {$push: {humans: "session_" + session.id}, $set: {updated: new Date().getTime()}}, {}, function (arena) {
							callback({success: true, messages: {top: "//arena joined successfully"}, redirect: "../../../../arenas/" + arena.id});
						});
					}
				} 
			});
		}
	}

/* random(session, post, callback) */
	function random(session, post, callback) {
		var parameters = JSON.parse(post.data);

		if (((session.human == null) || (((session.human.statistics.wins * 5) + session.human.statistics.losses) < 25)) && ((parameters.preset === "simple") || (parameters.preset === "deathmatch") || (parameters.preset === "advanced"))) {
			callback({success: false, messages: {top: "//unable to join arena; preset too advanced"}});
		}
		else if (((session.human == null) || (((session.human.statistics.wins * 5) + session.human.statistics.losses) < 50)) && ((parameters.preset === "intense") || (parameters.preset === "scarcity") || (parameters.preset === "random"))) {
			callback({success: false, messages: {top: "//unable to join arena; preset too expert"}});
		}
		else {
			if (session.human !== null) { //random arena signed in
				var wins = session.human.statistics.wins;
				var losses = session.human.statistics.losses;
			}
			else { //random arena signed out
				var wins = 10;
				var losses = 10;
			}

			processes.retrieve("arenas",{$and: [
				{"state.start": {$gt: new Date().getTime()}}, 
				{humans: 0}, 
				{"state.preset": parameters.preset}, 
				{"state.maker_wins": {$gt: wins - 11, $lt: wins + 11}}, 
				{"state.maker_losses": {$gt: losses - 11, $lt: losses + 11}}
			]}, {$multi: true}, function (arenas) { //get all "unstarted" arenas, created through random(), with the same preset, same wins/losses +/- 10, open slots
				if (arenas) {
					arenas = arenas.filter(function(a) {
						return a.humans.length - 1 < a.rules.players.maximum
					})
				}

				if (arenas) {
					arenas.reverse();
					joinin(session, {data: JSON.stringify({arena_id: arenas[0].id})}, callback); //join the oldest of these arenas
				}
				else {
					create(session,post,callback); //create a new arena, with "random_arena" as post.action
				}
			});

		}
	}

/* selectRobot(session, post, callback) */
	function selectRobot(session, post, callback) {
		var data = JSON.parse(post.data);

		if (typeof data.arena_id === "undefined") {
			callback({success: false, messages: {top: "//invalid arena id"}});
		}
		else if (typeof data.robot_id === "undefined") {
			callback({success: false, messages: {top: "//no robot selected"}});
		}
		else {
			processes.retrieve("arenas", {id: data.arena_id}, {}, function (arena) {
				if (!arena) {
					callback({success: false, messages: {top: "//unable to retrieve arena"}});
				}
				else if ((arena.state.start !== null) && (arena.state.start - 5000 < new Date().getTime())) {
					callback({success: false, messages: {top: "//game already started"}});
				}
				else if ((arena.humans.indexOf("session_" + session.id) === -1) && ((session.human !== null) && (arena.humans.indexOf(session.human.id) === -1))) {
					callback({success: false, messages: {top: "//arena must be joined first"}});
				}
				else if ((session.human === null) && (data.robot_id !== "upload")) {
					callback({success: false, messages: {top: "//unable to retrieve or upload robot"}});
				}
				else if (data.robot_id === "upload") { //uploaded robot
					var robot = data.robot;
						robot.id = processes.random();
						robot.statistics.wins = 0;
						robot.statistics.losses = 0;
					
					for (component in robot.avatar) {
						var list = processes.ascii_robot(component);
						if (list.indexOf(robot.avatar[component]) == -1) {
							robot.avatar[component] = list[0];
						}
					}

					if (processes.isReserved(robot.name)) {
						robot.name = robot.id.substring(0,4) + "_bot";
					}
					else if ((robot.name.length < 8) || (!processes.isNumLet(robot.name))) {
						robot.name = robot.id.substring(0,4) + "_bot";
					}

					if (session.human !== null) {
						robot.human.id = session.human.id;
						robot.human.name = session.human.name;
					}
					else {
						robot.human.id = "session_" + session.id;
						robot.human.name = "guest";
					}

					//arena.entrants[robot.id] = robot;
					var set = {};
					set["entrants." + robot.id] = robot;
					set.updated = new Date().getTime();

					processes.store("arenas", {id: arena.id}, {$set: set}, {}, function (arena) { //COULD BE A PROBLEM
						callback({success: true, messages: {top: "//robot uploaded successfully"}, redirect: "../../../../arenas/" + arena.id});
					});
				}
				else if (session.human !== null) {
					processes.retrieve("robots", {$and: [{id: data.robot_id}, {"human.id": session.human.id}]}, {}, function (robot) {
						if (!robot) {
							callback({success: false, messages: {top: "//unable to retrieve robot"}});
						}
						else {
							//arena.entrants[robot.id] = robot;
							var set = {};
							set["entrants." + robot.id] = robot;
							set.updated = new Date().getTime();

							processes.store("arenas", {id: arena.id}, {$set: set}, {}, function (arena) { //COULD BE A PROBLEM
								callback({success: true, messages: {top: "//robot selected successfully"}, redirect: "../../../../arenas/" + arena.id});
							});
						}			
					});
				}
			});
		}
	}

/* leave(session, post, callback) */
	function leave(session, post, callback) {
		var data = JSON.parse(post.data);
		
		if ((typeof data.arena_id === "undefined") || (data.arena_id.length !== 4)) {
			callback({success: false, messages: {top: "//invalid arena id"}});
		}
		else {
			processes.retrieve("arenas", {id: data.arena_id}, {}, function (arena) {
				if (!arena) {
					callback({success: false, messages: {top: "//invalid arena id"}});
				}
				else if ((arena.humans.indexOf("session_" + session.id) === -1) && ((session.human !== null) && (arena.humans.indexOf(session.human.id) === -1))) {
					callback({success: false, messages: {top: "//arena does not contain this human"}});
				}
				else if (arena.state.end !== null) {
					callback({success: false, messages: {top: "//arena already concluded"}});
				}
				else if (arena.rounds.length > 0) {
					callback({success: false, messages: {top: "//arena already started"}});	
				}
				else {
					if (session.human !== null) { //leave arena signed in
						var robot_id = Object.keys(arena.entrants).find(function(i) { return arena.entrants[i].human.id === session.human.id });

						if (robot_id) {
							var unset = {};
							unset["entrants." + robot_id] = "";
							processes.store("humans", {id: session.human.id}, {$pull: {arenas: data.arena_id}, $set: {updated: new Date().getTime()}}, {}, function (human) {
								processes.store("arenas", {id: data.arena_id}, {$pull: {humans: session.human.id}, $set: {updated: new Date().getTime()}, $unset: unset}, {}, function (arena) {
									callback({success: true, messages: {top: "//arena left successfully"}, redirect: "../../../../arenas/"});
								});
							});
						}
						else {
							processes.store("humans", {id: session.human.id}, {$pull: {arenas: data.arena_id}, $set: {updated: new Date().getTime()}}, {}, function (human) {
								processes.store("arenas", {id: data.arena_id}, {$pull: {humans: session.human.id}, $set: {updated: new Date().getTime()}}, {}, function (arena) {
									callback({success: true, messages: {top: "//arena left successfully"}, redirect: "../../../../arenas/"});
								});
							});
						}
					}
					else { //leave arena signed out
						var robot_id = Object.keys(arena.entrants).find(function(i) { return arena.entrants[i].human.id === "session_" + session.id });

						if (robot_id) {
							var unset = {};
							unset["entrants." + robot_id] = "";
							processes.store("arenas", {id: data.arena_id}, {$pull: {humans: "session_" + session.id}, $set: {updated: new Date().getTime()}, $unset: unset}, {}, function (arena) {
								callback({success: true, messages: {top: "//arena left successfully"}, redirect: "../../../../arenas/"});
							});
						}
						else {
							processes.store("arenas", {id: data.arena_id}, {$pull: {humans: "session_" + session.id}, $set: {updated: new Date().getTime()}}, {}, function (arena) {
								callback({success: true, messages: {top: "//arena left successfully"}, redirect: "../../../../arenas/"});
							});
						}
					}
				}
			});
		}
	}

/* addaiBot(session, post, callback) */
	function addaiBot(session, post, callback) {
		var data = JSON.parse(post.data);

		if (session.human === null) {
			callback({success: false, messages: {top: "//not authorized"}});
		}
		else if (typeof data.arena_id === "undefined") {
			callback({success: false, messages: {top: "//invalid arena id"}});
		}
		else if (typeof data.aibot === "undefined") {
			callback({success: false, messages: {top: "//no aiBot selected"}});
		}
		else if (processes.assets("aibots").indexOf(data.aibot) === -1) {
			callback({success: false, messages: {top: "//invalid aiBot"}});
		}
		else {
			processes.retrieve("arenas", {id: data.arena_id}, {}, function (arena) {
				if (!arena || !arena.humans || arena.humans[0] !== session.human.id) {
					callback({success: false, messages: {top: "//unable to retrieve arena"}});
				}
				else if (Object.keys(arena.entrants).length >= arena.rules.players.maximum) {
					callback({success: false, messages: {top: "//player maximum exceeded"}});
				}
				else {
					processes.retrieve("robots", {name: data.aibot, "human.name": "THE_ARCHITECT"}, {}, function (robot) {
						if (!robot) {
							callback({success: false, messages: {top: "//unable to retrieve robot"}});
						}
						else {
							var set = {};
							set["entrants." + robot.id] = robot;
							set.updated = new Date().getTime();
							
							processes.store("arenas", {id: data.arena_id}, {$set: set}, {}, function (arena) {
								callback({success: true, messages: {top: "//adding " + data.aibot + "..."}, arena: arena});
							});
						}
					});
				}
			});
		}
	}

/* launch(session, post, callback) */
	function launch(session, post, callback) {
		var data = JSON.parse(post.data);
		
		if ((typeof data.arena_id === "undefined") || (data.arena_id.length !== 4)) {
			callback({success: false, messages: {top: "//invalid arena id"}});
		}
		else {
			processes.retrieve("arenas", {id: data.arena_id}, {}, function (arena) {
				if (!arena) {
					callback({success: false, messages: {top: "//unable to retrieve arena"}});
				}
				else if (Object.keys(arena.entrants).filter(function(entrant) {
					return arena.entrants[entrant].human.name !== "THE_ARCHITECT"
				}).length !== arena.humans.length) {
					callback({success: false, messages: {top: "//some humans have not selected robots"}});
				}
				else if (Object.keys(arena.entrants).length > arena.rules.players.maximum) {
					callback({success: false, messages: {top: "//robot count exceeds maximum"}});
				}
				else if (Object.keys(arena.entrants).length < arena.rules.players.minimum) {
					callback({success: false, messages: {top: "//robot count does not meet minimum"}});
				}
				else {
					var players = [];
					var entrants = Object.keys(arena.entrants);
					for (x = 0; x < entrants.length; x++) {
						players.push(arena.entrants[entrants[x]].human.id);
					}

					var unplayers = arena.humans.filter(function(y) {
						return players.indexOf(y) === -1;
					});

					processes.store("humans", {id: {$in: unplayers}}, {$pull: {arenas: arena.id}, $set: {updated: new Date().getTime()}}, {$multi: true}, function (humans) {
						processes.store("arenas", {id: arena.id}, {$set: {"state.start": (new Date().getTime()) + (1000 * 5), "state.locked": false, updated: new Date().getTime()}, $pull: {humans: {$in: unplayers}}}, {}, function (arena) { //store it
							callback({success: true, arena: arena, messages: {top: "//starting..."}}); //send back the updated arena
						});
					});
				}
			});
		}
	}

/* adjustRobot(session, post, callback) */
	function adjustRobot(session, post, callback) {
		var data = JSON.parse(post.data);
		
		processes.retrieve("arenas", {id: data.arena_id}, {}, function (arena) {		
			if (!arena) {
				callback({success: false, messages: {top: "//unable to retrieve arena"}});
			}
			else if ((arena.humans.indexOf("session_" + session.id) === -1) && ((session.human !== null) && (arena.humans.indexOf(session.human.id) === -1))) {
				callback({success: false, messages: {top: "//not authorized"}});
			}
			else if (!(Object.keys(arena.entrants).indexOf(data.robot_id) > -1)) {
				callback({success: false, messages: {top: "//arena does not contain robot"}});
			}
			else {
				var robot = arena.entrants[data.robot_id];
				var before = JSON.stringify(robot);

				var fields = Object.keys(data);
				var messages = {top: "//changes submitted"};
				
				for (var i = 0; i < fields.length; i++) {
					switch (fields[i]) {
						case "inputs":
							if (data.inputs === robot.inputs) {
								//no change
							}
							else {
								robot.inputs = String(data.inputs.replace(/<\\? ?br ?\\?>/g,"\n").replace(/(<([^>]+)>)/ig,"").replace(/(&lt;)/g, "<").replace(/(&gt;)/g, ">").replace(/&amp;/g, "&"));
								messages.code = "//code updated";
							}
						break;

						case "code":
							if (data.code === robot.code) {
								//no change
							}
							else {
								robot.code = data.code.replace(/<\\? ?br ?\\?>/g,"\n").replace(/(<([^>]+)>)/ig,"").replace(/(&lt;)/g, "<").replace(/(&gt;)/g, ">").replace(/&amp;/g, "&");
								messages.code = "//code updated";
							}
						break;
					}
				}
				
				if (before === JSON.stringify(robot)) {
					callback({success: false, arena: arena, messages: {top: "//no changes"}});
				}
				else {
					var set = {};
					set["entrants." + data.robot_id] = robot;
					set.updated = new Date().getTime();
					
					processes.store("arenas", {id: arena.id}, {$set: set}, {}, function (arena) {
						callback({success: true, messages: messages, arena: arena, data: data});
					});
				}
			}
		});
	}

/* read(session, post, callback) */
	function read(session, post, callback) {
		var data = JSON.parse(post.data);
		var arena_id = data.arena_id || null; //arena we're asking for
		var timeNow = new Date().getTime(); //millisecond we're at

		if (!arena_id) {
			callback({success: false, messages: {top: "//unable to retrieve arena"}});
		}
		else {
			processes.retrieve("arenas", {id: arena_id}, {}, function (arena) {
				if (!arena) {
					callback({success: false, messages: {top: "//unable to retrieve arena"}});
				}
				else if ((arena.state.start === null) || (arena.state.start > timeNow)) { //if the game has not started...
					callback({success: true, arena: arena, messages: {top: "//arena not started"}});
				}
				else if ((arena.state.pauseFrom !== null) && (arena.state.pauseTo !== null) && (timeNow < arena.state.pauseTo)) { //if the game is or will be paused...
					if (timeNow > arena.state.pauseFrom) { //actively inactive
						callback({success: true, arena: arena, messages: {top: "//workshop activated"}});
					}
					else { //inactively inactive
						callback({success: true, arena: arena, messages: {top: "//arena in play"}});
					}
				}
				else if ((arena.state.end !== null) && (arena.state.end < timeNow)) { //if the game is over...
					callback({success: true, arena: arena, messages: {top: "//arena concluded"}});
				}
				else if ((arena.rounds.length > 0) && (timeNow <= arena.rounds[arena.rounds.length - 1].start)) { //asking for a round that * does * exist already
					callback({success: true, arena: arena, messages: {top: "//arena in play"}});
				}
				else if ((arena.state.locked === true) && (arena.rounds.length === 0) && (arena.humans[0] === 0)) { //if this is launching a random arena
					var currentRobotCount = Object.keys(arena.entrants).length;
					var targetRobotCount = Math.ceil((arena.rules.players.minimum + arena.rules.players.maximum) / 2); //average of min and max, rounding up

					if (currentRobotCount < targetRobotCount) {
						processes.retrieve("robots", {"human.id": {$nin: arena.humans}}, {$sample: {size: (targetRobotCount - currentRobotCount)}}, function (robots) { //find random robots that aren't in this arena or owned by humans in this arena
							for (var i = 0; i < robots.length; i++) { //add more random robots
								arena.entrants[robots[i].id] = robots[i];
							}

							var players = [0];	//remove unplayers
							var entrants = Object.keys(arena.entrants);
							for (x = 0; x < entrants.length; x++) {
								players.push(arena.entrants[entrants[x]].human.id);
							}

							var unplayers = arena.humans.filter(function(y) {
								return players.indexOf(y) === -1;
							});

							processes.store("humans", {id: {$in: unplayers}}, {$pull: {arenas: arena.id}, $set: {updated: new Date().getTime()}}, {$multi: true}, function (humans) {
								processes.store("arenas", {id: arena.id}, {$set: {"state.locked": false, entrants: arena.entrants, updated: new Date().getTime()}, $pull: {humans: {$in: unplayers}}}, {}, function (results) { //store it
									read(session, post, callback); //run this function again (which should skip this whole block now)
								});
							});
						});
					}
					else {
						processes.store("arenas", {id: arena.id}, {$set: {"state.locked": false, updated: new Date().getTime()}}, {}, function (results) { //store it
							read(session, post, callback); //run this function again (which should skip this whole block now)
						});
					}
				}
				else if (arena.state.locked === true) { //unable to update because it's locked
					callback({success: false, arena: arena, messages: {top: "//unable to retrieve or update arena"}});
				}
				else { //evaluate it yourself
					processes.store("arenas", {id: arena.id}, {$set: {"state.locked": true, updated: new Date().getTime()}}, {}, function (arena) { //lock it so we can update it without someone else also updating it
						var updated_arena = update(arena); //update the arena
						updated_arena.state.locked = false; //unlock it

						processes.retrieve("arenas", {$and: [{id: arena_id}, {"state.locked": true}]}, {}, function (locked_arena) { //it should still be locked in the database
							if (!locked_arena) { //somebody already evaluated and put it back
								callback({success: false, arena: arena, messages: {top: "//unable to retrieve or update arena"}});
							}
							else {
								processes.store("arenas", {id: arena.id}, {$set: {state: updated_arena.state, rounds: updated_arena.rounds, updated: new Date().getTime()}}, {}, function (arena) { //store it
									if (updated_arena.state.end === null) { //if the arena has not concluded...
										callback({success: true, arena: updated_arena, messages: {top: "//arena in play"}}); //send back the updated arena
									}
									else if (updated_arena.humans[0] === 0) { //if it has concluded and was started randomly
										var robot_ids = Object.keys(updated_arena.entrants).filter(function(robot_id) { //filter out robots with no human
											return (updated_arena.humans.indexOf(updated_arena.entrants[robot_id].human.id) !== -1);
										});

										var robot_victors = updated_arena.state.victors;
										var robot_losers = robot_ids.filter(function(robot_id) {
											return (robot_victors.indexOf(robot_id) === -1)
										});
										
										var human_victors = [];
										var human_losers = [];
										var all_humans = [];
										
										for (var i = 0; i < robot_ids.length; i++) {
											var human_id = updated_arena.entrants[robot_ids[i]].human.id;
											all_humans.push(human_id);

											if (updated_arena.humans.indexOf(human_id) > -1) {
												if (robot_victors.indexOf(robot_ids[i]) > -1) {
													human_victors.push(human_id);
												}
												else {
													human_losers.push(human_id);	
												}
											}
										}

										processes.store("humans", {id: {$in: all_humans}}, {$pull: {arenas: arena.id}, $set: {updated: new Date().getTime()}}, {$multi: true}, function (humans) { //remove arena from human list
											processes.store("humans", {id: {$in: human_victors}}, {$inc: {"statistics.wins": 1}, $set: {updated: new Date().getTime()}}, {$multi: true}, function (humans) { //humans +1 win
												processes.store("humans", {id: {$in: human_losers}}, {$inc: {"statistics.losses": 1}, $set: {updated: new Date().getTime()}}, {$multi: true}, function (humans) { //humans +1 loss
													processes.store("robots", {id: {$in: robot_victors}}, {$inc: {"statistics.wins": 1}, $set: {updated: new Date().getTime()}}, {$multi: true}, function (robots) { //robots +1 win
														processes.store("robots", {id: {$in: robot_losers}}, {$inc: {"statistics.losses": 1}, $set: {updated: new Date().getTime()}}, {$multi: true}, function (robots) { //robots +1 loss
															callback({success: true, arena: updated_arena, messages: {top: "//arena concluded"}});
														});
													});
												});
											});
										});
									}
									else { //if it was completed and created manually...
										var robot_ids = Object.keys(updated_arena.entrants).filter(function(robot_id) { //filter out robots with no human
											return (updated_arena.humans.indexOf(updated_arena.entrants[robot_id].human.id) !== -1);
										});

										var all_humans = [];
										
										for (var i = 0; i < robot_ids.length; i++) {
											var human_id = updated_arena.entrants[robot_ids[i]].human.id;
											all_humans.push(human_id);
										}

										processes.store("humans", {id: {$in: all_humans}}, {$pull: {arenas: arena.id}, $set: {updated: new Date().getTime()}}, {$multi: true}, function (humans) { //remove arena from human list
											callback({success: true, arena: updated_arena, messages: {top: "//arena concluded"}});
										});
									}
								});
							}
						});
					});
				}
			});
		}
	}

/* update(arena) */
	function update(arena) {
		if ((arena.state.pauseFrom !== null) || (arena.state.pauseTo !== null)) { //if it's paused
			var unpauseStart = arena.state.pauseTo; //get the timestamp for the pause end
			arena.state.pauseFrom = null; //unpause
			arena.state.pauseTo = null;
		}
		else {
			var unpauseStart = 0;
		}

		var startLength = arena.rounds.length; //get the round # where we're starting

		while (((arena.rounds.length - 1) < (startLength + 10)) && (arena.state.pauseFrom === null) && (arena.state.pauseTo === null) && (arena.state.end === null) && (arena.state.start !== null)) { //until pause or 10 rounds or victory
			//console.log("---------- round " + arena.rounds.length + " ----------");

			//phase 0: create newRound
				if (arena.rounds.length === 0) { //first round
					//console.log("phase 0: first round");
					//create newRound object
						var newRound = {
							start: arena.state.start,
							cubes: [],
							robots: [],
							winner: null
						}

					//add robots
						for (var i = 0; i < Object.keys(arena.entrants).length; i++) {
							//set cubes to 0
								var cubes = {
									red: 0,
									orange: 0,
									yellow: 0,
									green: 0,
									blue: 0,
									purple: 0
								};

							//give the robot some starting cubes (maybe)
								for (var j = 0; j < arena.rules.cubes.startCount; j++) {
									var color = arena.rules.cubes.colors[Math.floor(Math.random() * arena.rules.cubes.colors.length)];
									cubes[color] += 1;
								}

							//add the robot to the new round
								newRound.robots.push({
									name: Object.keys(arena.entrants)[i],
									power: arena.rules.robots.startPower,
									cubes: cubes,
									action: null,
								});
						}							
				}
				else { //all subsequent rounds
					//console.log("phase 0");
					var newRound = JSON.parse(JSON.stringify(arena.rounds[arena.rounds.length - 1])); //copy the current round data into a newRound
					newRound.winner = null; //set the winner to null for the newRound

					if (unpauseStart > 0) { //if it was paused
						newRound.start = unpauseStart; //set the new round to start immediately after the pause
						unpauseStart = 0;
					}
					else {
						newRound.start += (10000); //otherwise, the round starts 10 seconds after the last one
					}
				}

			//phase 1: running the human scripts
				if (arena.rounds.length > 0) { //don't do this for the first round
					//console.log("phase 1");
					var robot_actions = [];

					for (var i = 0; i < newRound.robots.length; i++) {
						//get robot data
							var robot = newRound.robots[i];
								var name = robot.name //this is actually the id - we won't use the robot's string name except for display
								var inputs = arena.entrants[name].inputs.replace(/\s/g,"").split(",") || [];
								var code = String(arena.entrants[name].code) || "";

							//console.log("running script for " + name);
						
						//build the sandbox
							var sandbox = {}; //clear existing sandbox
							for (var j = 0; j < inputs.length; j++) { //only add the variables specified by the human's code
								//console.log("input: " + inputs[j]);
								try {
									switch(inputs[j]) {
										case "arena": //all other inputs can be derived from this one
											sandbox.arena = { //for arena, only include rules and rounds data (no id, created, humans, state, or entrants)
												rules: arena.rules,
												rounds: arena.rounds
											};
										break;

										case "name":
											sandbox.name = name; //can be derived in robot-code as `arguments.callee.name` - it'll still actually be the robot's id
										break;

										case "rules":
											sandbox.rules = arena.rules;
										break;

										case "rounds":
											sandbox.rounds = arena.rounds;
										break;

										case "roundCount":
											sandbox.roundCount = arena.rounds.length - 1;
										break;

										case "currentRound":
											sandbox.currentRound = arena.rounds[arena.rounds.length - 1];
										break;

										case "lastRound":
											sandbox.lastRound = arena.rounds[arena.rounds.length - 2];
										break;

										case "firstRound":
											sandbox.firstRound = arena.rounds[0];
										break;

										case "robots":
											sandbox.robots = arena.rounds[arena.rounds.length - 1].robots;
										break;

										case "robotCount":
											sandbox.robotCount = arena.rounds[arena.rounds.length - 1].robots.length;
										break;

										case "allCubes":
											sandbox.allCubes = arena.rounds[arena.rounds.length - 1].cubes;
										break;

										case "newCubes":
											sandbox.newCubes = arena.rounds[arena.rounds.length - 1].cubes.slice(-arena.rules.cubes.spawnRate);
										break;

										case "self":
											sandbox.self = arena.rounds[arena.rounds.length - 1].robots.find(function(robot) {return robot.name === name});
										break;

										case "power":
											sandbox.power = arena.rounds[arena.rounds.length - 1].robots.find(function(robot) {return robot.name === name}).power;
										break;

										case "cubes":
											sandbox.cubes = arena.rounds[arena.rounds.length - 1].robots.find(function(robot) {return robot.name === name}).cubes;
										break;

										case "action":
											sandbox.action = arena.rounds[arena.rounds.length - 1].robots.find(function(robot) {return robot.name === name}).action;
										break;

										case "winner":
											sandbox.winner = arena.rounds[arena.rounds.length - 1].winner;
										break;

										case "opponents":
											sandbox.opponents = arena.rounds[arena.rounds.length - 1].robots.filter(function(robot) {return robot.name !== name});
										break;

										case "colors":
											sandbox.colors = arena.rules.cubes.colors;
										break;

										case "actions":
											sandbox.actions = arena.rules.robots.actions;
										break;

										case "conditions":
											sandbox.conditions = arena.rules.victory.conditions;
										break;
									}
								}
								catch (error) {
									console.log(error);
								}
							}

						//run robot code
							var random = processes.random(); //the results variable will have an unpredictable name so it's almost impossible for the human to mess with it
							try {
								//console.log("trying at " + new Date().getTime() + " : sandbox:\n " + JSON.stringify(sandbox));
								vm.runInNewContext(
									"function " + name + "() {" + (code || "") + "}; var " + random + " = " + name + "();",
									sandbox,
									{timeout: 1000}
								); //try to run the code --> function 12345678() { return "something"; } var abcdefgh = 12345678();
								//console.log("completed at " + new Date().getTime());
								//console.log("action is " + sandbox[random]);
								robot_actions[i] = sandbox[random] || "sleep"; //extract that randomly named variable's contents or default to sleep
							}
							catch (error) {
								//console.log("error at " + new Date().getTime() + " : \n" + error);
								robot_actions[i] = "sleep"; //if the code breaks, default to sleep
							}

						//prevent illegal actions
							if (!(arena.rules.robots.actions.indexOf(robot_actions[i]) > -1)) {
								//console.log("illegal action");
								robot_actions[i] = "sleep"; //robots who perform actions outside the scope of this arena will instead sleep
							}
					}

					for (var i = 0; i < robot_actions.length; i++) { //then put all those actions in their respective robots for the newRound
						newRound.robots[i].action = robot_actions[i];
						//console.log(newRound.robots[i].name + ":" + robot_actions[i]);
					}
				}

			//phase 2: robot actions: shock, power, sap, burn, sleep
				if (arena.rounds.length > 0) { //don't do this for the first round
					//console.log("phase 2");
					//shock
						for (var i = 0; i < newRound.robots.length; i++) {
							if (newRound.robots[i].action === "shock") { //for all robots shocking...
								var shocker = newRound.robots[i];
								var cubeCount = (shocker.cubes.red + shocker.cubes.orange + shocker.cubes.yellow + shocker.cubes.green + shocker.cubes.blue + shocker.cubes.purple); //add up the shocker's cubes

								for (var j = 0; j < newRound.robots.length; j++) { //loop through all robots to find potential shockees
									var opponent = newRound.robots[j]; //we can call them "opponents" because we know that the "if" will filter out the shocker anyway
									if ((opponent.action !== "shock") && ((opponent.cubes.red + opponent.cubes.orange + opponent.cubes.yellow + opponent.cubes.green + opponent.cubes.blue + opponent.cubes.purple) > cubeCount)) {
										newRound.robots[j].action = "sleep"; //sleep all robots who aren't themselves shocking and have more cubes than the shocker
									}
								}

								newRound.robots[i].power = Math.floor(newRound.robots[i].power / 2); //set the robot's power to 50%, rounded down
							}
						}

					//power
						var powerRate = arena.rules.robots.powerRate; //get the rate of powering
					
						for (var i = 0; i < newRound.robots.length; i++) {
							if (newRound.robots[i].action === "power") { //for all robots powering...
								//console.log("powering now: " + newRound.robots[i].name);
								newRound.robots[i].power += powerRate; //... add to their newRound's power

								if (newRound.robots[i].power > arena.rules.robots.maxPower) { //don't let anyone go over the maxPower
									newRound.robots[i].power = arena.rules.robots.maxPower;
								}
							}
						}

					//sap
						var powerRate = arena.rules.robots.powerRate; //get the rate of powering

						for (var i = 0; i < newRound.robots.length; i++) {
							if (newRound.robots[i].action === "sap") { //for all robots sapping...
								var sapper = newRound.robots[i];

								for (var j = 0; j < newRound.robots.length; j++) {
									var opponent = newRound.robots[j]; //we can call them "opponents" because we know that the "if" will filter out the sapper anyway
									if ((opponent.action === "power") && (opponent.power > sapper.power)) { //for all opponents who have more power and are powering up now
										newRound.robots[j].power = Math.max(0, (newRound.robots[j].power - powerRate)); //reduce their power for the newRound by the powerRate, with a minimum of 0
										newRound.robots[i].power += powerRate; //add that power to this sapper for the newRound
									}
								}

								if (newRound.robots[i].power > arena.rules.robots.maxPower) { //don't let anyone go over the maxPower
									newRound.robots[i].power = arena.rules.robots.maxPower;
								}
							}
						}

					//burn
						var powerRate = arena.rules.robots.powerRate; //get the rate of powering

						for (var i = 0; i < newRound.robots.length; i++) {
							if (newRound.robots[i].action === "burn") { //for all robots burning...
								var burner = newRound.robots[i];
								var cubeCount = (burner.cubes.red + burner.cubes.orange + burner.cubes.yellow + burner.cubes.green + burner.cubes.blue + burner.cubes.purple); //add up the burner's cubes

								if (cubeCount > 0) {
									var burnIndex = Math.floor(Math.random() * cubeCount);
									
									if (burnIndex < burner.cubes.red) {
										newRound.robots[i].cubes.red--;
										newRound.robots[i].power += (powerRate * 2);
									}
									else if (burnIndex < (burner.cubes.red + burner.cubes.orange)) {
										newRound.robots[i].cubes.orange--;
										newRound.robots[i].power += (powerRate * 2);
									}
									else if (burnIndex < (burner.cubes.red + burner.cubes.orange + burner.cubes.yellow)) {
										newRound.robots[i].cubes.yellow--;
										newRound.robots[i].power += (powerRate * 2);
									}
									else if (burnIndex < (burner.cubes.red + burner.cubes.orange + burner.cubes.yellow + burner.cubes.green)) {
										newRound.robots[i].cubes.green--;
										newRound.robots[i].power += (powerRate * 2);
									}
									else if (burnIndex < (burner.cubes.red + burner.cubes.orange + burner.cubes.yellow + burner.cubes.green + burner.cubes.blue)) {
										newRound.robots[i].cubes.blue--;
										newRound.robots[i].power += (powerRate * 2);
									}
									else if (burnIndex < (burner.cubes.red + burner.cubes.orange + burner.cubes.yellow + burner.cubes.green + burner.cubes.blue + burner.cubes.purple)) {
										newRound.robots[i].cubes.purple--;
										newRound.robots[i].power += (powerRate * 2);
									}
									else {
										//error
										newRound.robots[i].action = "sleep";
									}

									if (newRound.robots[i].power > arena.rules.robots.maxPower) { //don't let anyone go over the maxPower
										newRound.robots[i].power = arena.rules.robots.maxPower;
									}
								}
								else {
									newRound.robots[i].action = "sleep"; //if the robot has no cubes to burn, just sleep
								}
							}
						}
				}

			//phase 3: robot actions: take, halftake, swaptake, fliptake
				if (arena.rounds.length > 0) { //don't do this for the first round
					//console.log("phase 3");
					var takers = []; //empty array of robots attempting to take

					//get a list of all takers
						for (var i = 0; i < newRound.robots.length; i++) {
							if (["take","halftake","swaptake","fliptake"].indexOf(newRound.robots[i].action) > -1) { //all robots with one of those actions
								//console.log("taking now: " + newRound.robots[i].name);
								if (!(newRound.robots[i].power > 0)) { //no power?
									newRound.robots[i].action = "sleep"; //sleep!
								}
								else {
									takers.push(newRound.robots[i]); //focus on that robot's current status
								}
							}
						}

					//swaptake and halftake use 50% power
						for (var i = 0; i < takers.length; i++) {
							if (["halftake","swaptake"].indexOf(takers[i].action) > -1) {
								takers[i].power = Math.ceiling(takers[i].power / 2); //use 50% power, rounded up
							}
						}

					//sort that list descending
						takers.sort(function(a, b) { //sort in descending order
							return b.power - a.power;
						});

					//resolve ties
						if ((takers.length > 1) && (takers[0].power === takers[1].power)) {
							switch (arena.rules.robots.tieBreaker) {
								case "leave": //no one gets the cube
									var winner = null;
								break;

								case "dissolve": //cube disappears
									var winner = null;
									newRound.cubes = [];
								break;

								case "random": //pick a random robot from the tied robots
									var power = takers[0].power;

									var winners = [];
									for (var i = 0; i < takers.length; i++) {
										if (takers[i].power === power) {
											winners.push(takers[i]); //get all the robots with the winning power
										}
									}

									var winner = winners[Math.floor(Math.random() * winners.length)]; //pick one randomly
								break;

								case "catchup": //pick the robot from the tied robots with the fewest cubes
									var power = takers[0].power;

									var winners = [];
									for (var i = 0; i < takers.length; i++) {
										if (takers[i].power === power) {
											winners.push(takers[i]); //get all the robots with the winning power
										}
									}

									winners.sort(function(a, b) { //sort in ascending order of cubeCount
										a.cubeCount = a.cubes.red + a.cubes.orange + a.cubes.yellow + a.cubes.green + a.cubes.blue + a.cubes.purple;
										b.cubeCount = b.cubes.red + b.cubes.orange + b.cubes.yellow + b.cubes.green + b.cubes.blue + b.cubes.purple;

										return a.cubeCount - b.cubeCount;
									});

									var winner = winners[0]; //pick the robot with the fewest cubes
								break;

								case "cascade": //find the winner by cancelling out ties
								default:
									var winner = takers[0]; //set the first as the current winner
									takers.shift();

									do {
										var reset = false;

										for (var i = 0; i < takers.length; i++) { 
											if (takers[i].power === winner.power) { //if anyone ties with the current winner...
												takers.shift(); //...remove them...
												i--; //...keep checking the rest...
												reset = true;
											}
										}

										if (reset) {
											winner = takers[0]; //...and then set a new winner
											takers.shift();
										}
									}
									while (reset); //keep going every time a reset is necessary
								break;
							}
						}
						else {
							var winner = takers[0];
						}

					//give the winner all the cubes, up to the maximum
						if ((typeof winner !== "undefined") && (winner !== null) && (winner.name !== null)) {
							//console.log("winner: " + winner.name);
							newRound.winner = winner.name; //log the winner's id in the current round

							if (winner.action === "swaptake") { //for swaptakers, build a swapBack pile
								var swapBack = [];
							}		
							
							var cubes = newRound.cubes; //get all the cubes from this round
							while ((cubes.length) && ((winner.cubes.red + winner.cubes.orange + winner.cubes.yellow + winner.cubes.green + winner.cubes.blue + winner.cubes.purple) < arena.rules.cubes.maximum)) { //while there are cubes and the winner has fewer than the max
								
								if (winner.action === "fliptake") { //for fliptakers, change the color to the complimentary color
									if (cubes[0] === "red") {cubes[0] === "green";}
									else if (cubes[0] === "orange") {cubes[0] === "blue";}
									else if (cubes[0] === "yellow") {cubes[0] === "purple";}
									else if (cubes[0] === "green") {cubes[0] === "red";}
									else if (cubes[0] === "blue") {cubes[0] === "orange";}
									else if (cubes[0] === "purple") {cubes[0] === "yellow";}
								}

								winner.cubes[cubes[0]]++; //add the new cube to the winner's correspondingly colored cube stack
								cubes.shift(); //remove it from the round's cubes

								if (winner.action === "swaptake") { //for swaptakers, add to the swapBack pile and remove a cube from that color
									var swapIndex = Math.floor(Math.random() * (swapper.cubes.red + swapper.cubes.orange + swapper.cubes.yellow + swapper.cubes.green + swapper.cubes.blue + swapper.cubes.purple));
									
									if (swapIndex < swapper.cubes.red) {
										winner.cubes.red--;
										swapBack.push("red");
									}
									else if (swapIndex < (swapper.cubes.red + swapper.cubes.orange)) {
										winner.cubes.orange--;
										swapBack.push("orange");
									}
									else if (swapIndex < (swapper.cubes.red + swapper.cubes.orange + swapper.cubes.yellow)) {
										winner.cubes.yellow--;
										swapBack.push("yellow");
									}
									else if (swapIndex < (swapper.cubes.red + swapper.cubes.orange + swapper.cubes.yellow + swapper.cubes.green)) {
										winner.cubes.green--;
										swapBack.push("green");
									}
									else if (swapIndex < (swapper.cubes.red + swapper.cubes.orange + swapper.cubes.yellow + swapper.cubes.green + swapper.cubes.blue)) {
										winner.cubes.blue--;
										swapBack.push("blue");
									}
									else if (swapIndex < (swapper.cubes.red + swapper.cubes.orange + swapper.cubes.yellow + swapper.cubes.green + swapper.cubes.blue + swapper.cubes.purple)) {
										winner.cubes.purple--;
										swapBack.push("purple");
									}
								}
							}

							if (winner.action === "swaptake") { //for swaptakers, add the swapBack pile to the end of the remaining cubes
								cubes = cubes.concat(swapBack);
							}

							newRound.robots.find(function(robot) {return robot.name === winner.name}).cubes = winner.cubes; //the winner gets the cubes in the new round
							newRound.cubes = cubes || []; //remaining cubes go to the new round
						}
						
					//remove power from all takers
						for (var i = 0; i < newRound.robots.length; i++) {
							if (newRound.robots[i].action === "take") {
								newRound.robots[i].power = 0; //set the robot's power to 0 for newRound
							}
							else if (newRound.robots[i].action === "fliptake") {
								newRound.robots[i].power = 0; //set the robot's power to 0 for newRound
							}
							else if (newRound.robots[i].action === "halftake") {
								newRound.robots[i].power = Math.floor(newRound.robots[i].power / 2); //set the robot's power to 50%, rounded down
							}
							else if (newRound.robots[i].action === "swaptake") {
								newRound.robots[i].power = Math.floor(newRound.robots[i].power / 2); //set the robot's power to 50%, rounded down
							}
						}
				}

			//phase 4: robot actions: sleep
				if (arena.rounds.length > 0) { //don't do this for the first round
					//console.log("phase 4");
					//sleep
						for (var i = 0; i < newRound.robots.length; i++) {
							if (newRound.robots[i].action === "sleep") { //for all robots sleeping...
								//do nothing
								//console.log("sleeping now: " + newRound.robots[i].name);
							}
						}
				}

			//phase 5: spawn & dissolve cubes
				//dissolve
					if (arena.rounds.length > 0) { //don't do this for the first round
						//console.log("phase 5: dissolving cubes from " + newRound.cubes);
						var i = 0;
						while ((i < arena.rules.cubes.dissolveRate) && (newRound.cubes.length > 0)) { //loop through to dissolve the dissolveRate number of cubes (or until none remain)
							switch (arena.rules.cubes.dissolveIndex) { //figure out which cube is getting dissolved
								case "none":
									var dissolveIndex = 256;
								break;

								case "newest":
									var dissolveIndex = newRound.cubes.length - 1;
								break;

								case "oldest":
									var dissolveIndex = 0;
								break;

								case "random":
								default:
									var dissolveIndex = Math.floor(Math.random() * newRound.cubes.length);
								break;
							}

							//console.log("removing the " + dissolveIndex + "th cube, " + newRound.cubes[dissolveIndex]);

							newRound.cubes.splice(dissolveIndex,1); //remove one cube from the dissolveIndex position
							i++;
							//console.log(" to " + newRound.cubes);
						}
					}

				//spawn
					//console.log("phase 5: spawning cubes from " + newRound.cubes);
					var colors = arena.rules.cubes.colors.join(",").split(",");
					var spawnRate = arena.rules.cubes.spawnRate;
					var spawnMemory = arena.rules.cubes.spawnMemory;

					var pastCubes = [];

					for (var i = 1; i <= Math.min(spawnMemory, arena.rounds.length); i++) { //go back to each round that should be remembered...
						pastCubes.push(arena.rounds[arena.rounds.length - i].cubes.slice(-spawnRate)); //and get which cubes were created
					}

					for (var i = 0; i < pastCubes.length; i++) {
						if (colors.indexOf(String(pastCubes[i])) > -1) {
							colors.splice(colors.indexOf(String(pastCubes[i])),1);
						}
					}
					
					for (var i = 0; i < spawnRate; i++) {
						var newCube = colors[Math.floor(Math.random() * colors.length)] || null; //pick a random color from the remaining colors
						if (newCube !== null) {
							newRound.cubes.push(newCube);
						}
						//console.log(" to " + newRound.cubes);
					}

			//phase 6: merge newRound
				//console.log("phase 6");
				//console.log("evaluated newRound: " + JSON.stringify(newRound));
				arena.rounds.push(newRound); //merge the newRound into the existing rounds array

			//phase 7: check for victory
				if (arena.rounds.length > 1) { //don't do this after the first round
					//loop through all conditions
						//console.log("phase 7");
						var victors = [];
						for (var c = 0; c < arena.rules.victory.conditions.length; c++) { //loop through for all conditions
							//console.log("checking for victory: " + arena.rules.victory.conditions[c]);
							switch(arena.rules.victory.conditions[c]) {
								case "6of1": //6 cubes of 1 color
									for (var i = 0; i < newRound.robots.length; i++) {
										for (j = 0; j < arena.rules.cubes.colors.length; j++) {
											if (newRound.robots[i].cubes[arena.rules.cubes.colors[j]] >= (6 * arena.rules.victory.multiplier)) {
												victors.push(newRound.robots[i].name);
											}
										}
									}

									//console.log("6of1: " + victors);
								break;

								case "2of3": //2 of all primary or all secondary cubes
									for (var i = 0; i < newRound.robots.length; i++) {
										if ((newRound.robots[i].cubes.red >= (2 * arena.rules.victory.multiplier)) && (newRound.robots[i].cubes.yellow >= (2 * arena.rules.victory.multiplier)) && (newRound.robots[i].cubes.blue >= (2 * arena.rules.victory.multiplier))) {
											victors.push(newRound.robots[i].name);
										}
										else if ((newRound.robots[i].cubes.orange >= (2 * arena.rules.victory.multiplier)) && (newRound.robots[i].cubes.green >= (2 * arena.rules.victory.multiplier)) && (newRound.robots[i].cubes.purple >= (2 * arena.rules.victory.multiplier))) {
											victors.push(newRound.robots[i].name);
										}
									}

									//console.log("2of3: " + victors);
								break;

								case "1of6": //one of each color
									for (var i = 0; i < newRound.robots.length; i++) {
										var victory = true;

										if (newRound.robots[i].cubes.red < (1 * arena.rules.victory.multiplier)) {
											victory = false;
										}
										if (newRound.robots[i].cubes.orange < (1 * arena.rules.victory.multiplier)) {
											victory = false;
										}
										if (newRound.robots[i].cubes.yellow < (1 * arena.rules.victory.multiplier)) {
											victory = false;
										}
										if (newRound.robots[i].cubes.green < (1 * arena.rules.victory.multiplier)) {
											victory = false;
										}
										if (newRound.robots[i].cubes.blue < (1 * arena.rules.victory.multiplier)) {
											victory = false;
										}
										if (newRound.robots[i].cubes.purple < (1 * arena.rules.victory.multiplier)) {
											victory = false;
										}

										if (victory === true) {
											victors.push(newRound.robots[i].name);
										}

									}

									//console.log("1of6: " + victors);
								break;

								case "3of2": //3 of each of 2 complementary colors
									for (var i = 0; i < newRound.robots.length; i++) {
										if ((newRound.robots[i].red >= (3 * arena.rules.victory.multiplier)) && (newRound.robots[i].green >= (3 * arena.rules.victory.multiplier))) {
											victors.push(newRound.robots[i].name);
										}
										else if ((newRound.robots[i].orange >= (3 * arena.rules.victory.multiplier)) && (newRound.robots[i].blue >= (3 * arena.rules.victory.multiplier))) {
											victors.push(newRound.robots[i].name);
										}
										else if ((newRound.robots[i].yellow >= (3 * arena.rules.victory.multiplier)) && (newRound.robots[i].purple >= (3 * arena.rules.victory.multiplier))) {
											victors.push(newRound.robots[i].name);
										}
									}

									//console.log("3of2: " + victors);
								break;
							}
						}

					//remove duplicates
						//console.log("removing duplicates");
						victors = victors.filter(function (victor, position) {
							return victors.indexOf(victor) === position;
						});
						//console.log(victors);

					//resolve ties
						if (victors.length > 1) {
							//console.log("resolving ties: " + arena.rules.victory.tieBreaker);
							switch (arena.rules.victory.tieBreaker) {
								case "tie":
									//do nothing
								break;

								case "random":
									victors = [victors[Math.floor(Math.random() * victors.length)]];
								break;

								case "greedy":
									victors.sort(function(a, b) { //order the tied victors based on total cubeCount, ascending
										var robot_a = newRound.robots.find(function(robot) {return robot.name === a});
										var robot_b = newRound.robots.find(function(robot) {return robot.name === b});

										return ((robot_a.cubes.red + robot_a.cubes.orange + robot_a.cubes.yellow + robot_a.cubes.green + robot_a.cubes.blue + robot_a.cubes.purple) - (robot_b.cubes.red + robot_b.cubes.orange + robot_b.cubes.yellow + robot_b.cubes.green + robot_b.cubes.blue + robot_b.cubes.purple));
									});

									victors = [victors[0]]; //whoever has the *most* cubes is the victor
								break;

								case "efficient":
									victors.sort(function(a, b) { //order the tied victors based on total cubeCount, descending
										var robot_a = newRound.robots.find(function(robot) {return robot.name === a});
										var robot_b = newRound.robots.find(function(robot) {return robot.name === b});

										return ((robot_b.cubes.red + robot_b.cubes.orange + robot_b.cubes.yellow + robot_b.cubes.green + robot_b.cubes.blue + robot_b.cubes.purple) - (robot_a.cubes.red + robot_a.cubes.orange + robot_a.cubes.yellow + robot_a.cubes.green + robot_a.cubes.blue + robot_a.cubes.purple));
									});

									victors = [victors[0]]; //whoever has the *least* cubes is the victor
								break;
							}
						}
						//console.log("post-tiebreaker: " + victors);

					//change state
						if (victors.length > 0) {
							//console.log("victors: " + victors);
							arena.state.victors = victors;
							arena.state.end = arena.rounds[arena.rounds.length - 1].start + (1000 * 10); //add end time if victory (10 seconds after the last round starts)
						}
						else {
							//console.log("no victors");
						}
				}

			//phase 8: check for pause
				if ((arena.state.end === null) && (arena.rounds.length > 1) && ((arena.rounds.length - 1) % arena.rules.players.workshopPeriod === 0)) { //pause if the period is complete (not counting round 0), unless victory
					//console.log("phase 8");
					arena.state.pauseFrom = (arena.rounds[arena.rounds.length - 1].start) + (1000 * 10); //set the pause start for 10 seconds after the last newRound
					arena.state.pauseTo = arena.state.pauseFrom + arena.rules.players.workshopDuration; //set pause end for pauseFrom + duration of the pause

					//console.log("pausing at " + (new Date().getTime()) + " after round " + (arena.rounds.length - 1) + " from " + arena.state.pauseFrom + " to " + arena.state.pauseTo);
				}
		}
		
		return arena;
	}

/* exports */
	module.exports = {
		create: create,
		joinin: joinin,
		random: random,
		selectRobot: selectRobot,
		addaiBot: addaiBot,
		leave: leave,
		launch: launch,
		adjustRobot: adjustRobot,
		read: read,
		update: update,
		destroy: destroy
	}
