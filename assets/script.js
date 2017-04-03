$(document).ready(function() {

	/* animateText */
		jQuery.fn.extend({
			animateText: function(options, timespan) {
				var element = this;
				if ((typeof options === "undefined") || (options === null)) {
					options = {};
				}
				
				//text
					if (typeof options.text !== "undefined") {
						var text = options.text;
					}
					else {
						var text = ($(element).text() || "");
					}

					$(element).text("");

				//chunk
					if ((typeof options.chunk !== "undefined") && (options.chunk > 0)) {
						var chunk = options.chunk;
					}
					else {
						var chunk = 1;
					}

				//interval / timespan
					if ((typeof timespan !== "undefined") && (timespan !== null)) {
						var interval = timespan / (text.length / chunk);
					}
					else if ((typeof options.interval !== "undefined") && (options.interval !== null)) {
						var interval = (options.interval / chunk);
					}
					else {
						var interval = 100;
					}

				//indicator
					if ((typeof options.indicator !== "undefined") && (options.indicator.length > 0)) {
						indicator = options.indicator;
					}
					else {
						indicator = "_";
					}

				if ((typeof options.direction !== "undefined") && (options.direction === "left")) {
					var index = text.length - chunk;
					var loop = setInterval(function() {
						if (index < 0) {
							clearInterval(loop);
							$(element).html(text);
						}
						else {
							//color char
								if ((typeof options.color !== "undefined") && (options.color.length > 0)) {
									var char = "<span style='color: " + options.color + "'>" + (indicator || (text[index] || "")) + "</span>";
								}
								else {
									var char = text[index] || "";
								}

							$(element).html(char + text.substring(index + 1, text.length));
							index -= chunk;
						}
					}, interval);
				}
				else {
					var index = 0;
					var loop = setInterval(function() {
						if (index > text.length) {
							clearInterval(loop);
							$(element).html(text);
						}
						else {
							//color char
								if ((typeof options.color !== "undefined") && (options.color.length > 0)) {
									var char = "<span style='color: " + options.color + "'>" + (indicator || (text[index] || "")) + "</span>";
								}
								else {
									var char = text[index] || "";
								}

							$(element).html(text.substring(0, index) + char);
							index += chunk;
						}
					}, interval);
				}
			}
		});

		$("#message_top").animateText({},1000);

	/* colorText */		
		window.colorText = function(text) {
			if (text.length) {				
				
				function grayizer(text) {
					var position = 0;
					var startPosition = text.indexOf("/*",position) || false; // find next comment start
					var loop = 0;

					while ((startPosition > position) && (loop < 100)) { //loop through up to 100 times
						endPosition = text.indexOf("*/", startPosition + 2) || text.length; //find the comment end
						var before = text.slice(0, startPosition); //split into before...
						var between = text.slice(startPosition, endPosition + 2); //...between...
						var after = text.slice(endPosition + 2, text.length); //and after sections
						text = before + "<span graytext>" + between + "</span graytext>" + after; //recombine them with <span>
						position = endPosition + 32;

						startPosition = text.indexOf("/*",position) || false; //find next comment start
						loop++;
					}

					text = text.replace(/\/\/(.*?)\n/g,"<span graytext>//$1</span graytext>\n"); //regex for regular double-slash comments

					return text;
				}

				function yellowizer (text) {
					var position = 0;
					var dqPosition = text.indexOf("\"",position) || false; // find next double quote
					var sqPosition = text.indexOf("\'",position) || false; // find next single quote
					var loop = 0;

					while (((dqPosition > position) || (sqPosition > position)) && (loop < 100)) { //loop through up to 100 times
						if ((dqPosition > position) && (sqPosition > position)) { //determine which is closer
							if (dqPosition < sqPosition) { //double quote
								var type = "double";							
							}
							else if (sqPosition < dqPosition) { //single quote
								var type = "single";
							}
						}
						else if (dqPosition > position) { //double quote (same as above)
							var type = "double";	
						}
						else if (sqPosition > position) { //single quote (same as above)
							var type = "single";
						}
						else {
							var type = "none";
						}

						if (type === "double") {
							if (text.indexOf("</span graytext>", dqPosition) < text.indexOf("<span graytext>", dqPosition)) {
								console.log("cancelling on double");
								type = "none";
								position = dqPosition + 1;
							}
						}
						else if (type === "single") {
							if (text.indexOf("</span graytext>", sqPosition) < text.indexOf("<span graytext>", sqPosition)) {
								console.log("cancelling on single");
								type = "none";
								position = sqPosition + 1;
							}
						}

						if (type === "double") {
							var attempt = dqPosition;
							do {
								console.log("double");
								eqPosition = text.indexOf("\"", attempt + 1); //get the next end quote
								if (eqPosition === -1) {
									eqPosition = text.length; //default to the end of the text
								}

								var close = text.indexOf("</span graytext>", eqPosition);
								if (close === -1) {
									close = text.length;
								}

								var open = text.indexOf("<span graytext>", eqPosition);
								if (open === -1) {
									open = text.length;
								}

								attempt = eqPosition;
							}
							while ((close < open) && (attempt < text.length))

							var before = text.slice(0, dqPosition); //split into before...
							var between = text.slice(dqPosition, eqPosition + 1); //...between...
							var after = text.slice(eqPosition + 1, text.length); //...and after sections
							text = before + "<span yellowtext>" + between + "</span>" + after; //recombine them with <span>
							position = eqPosition + 25; //move up 25 characters (length of <span yellowtext></span>, plus 1)
						}
						else if (type === "single") {
							var attempt = sqPosition;
							do {
								console.log("single");
								eqPosition = text.indexOf("\'", attempt + 1); //get the next end quote
								if (eqPosition === -1) {
									eqPosition = text.length; //default to the end of the text
								}

								var close = text.indexOf("</span graytext>", eqPosition);
								if (close === -1) {
									close = text.length;
								}

								var open = text.indexOf("<span graytext>", eqPosition);
								if (open === -1) {
									open = text.length;
								}

								attempt = eqPosition;
							}
							while ((close < open) && (attempt < text.length))

							var before = text.slice(0, sqPosition); //split into before...
							var between = text.slice(sqPosition, eqPosition + 1); //...between...
							var after = text.slice(eqPosition + 1, text.length); //...and after sections
							text = before + "<span yellowtext>" + between + "</span>" + after; //recombine them with <span>
							position = eqPosition + 25; //move up 25 characters (length of <span yellowtext></span>, plus 1)
						}

						console.log("position::: " + position);
						console.log("string::: " + text);

						dqPosition = text.indexOf("\"",position) || false; //find next double quote
						sqPosition = text.indexOf("\'",position) || false; //find next single quote
						loop++;
					}

					return text;
				}

				function rgbopizer(text) {
					/* math */ 		text = text.replace(/(^|\{|\[|\(|\.|\s|\d|\w)(\%+|\-+|\-\-|\++|\+\+|\-\=|\+\=|\*+|\=+|\&\&|\|\||\\+|\!+)(\d|\w|\s|\.|\,|\)|\]|\}|\;|\:|$)/g,"$1<span redtext>$2</span>$3");
					/* < = > */ 	text = text.replace(/(^|\{|\[|\(|\.|\s)(\<+|\>+|&amp;|&amp;&amp;|&lt;|&gt;|&lt;&lt;|&gt;&gt;|&lt;&lt;&lt;|&gt;&gt;&gt;|\=&lt;|\=&gt;|&lt;\=|&gt;\=|&lt;\=\=|\=\=&gt;)(\s|\.|\,|\)|\]|\}|\;|\:|$)/g,"$1<span redtext>$2</span>$3");
					/* logic */		text = text.replace(/(^|\{|\[|\(|\.|\s)(if|else|return|typeof|switch|case|break|new|for|while|\$|const|do|continue|try|catch|throw|finally|this|in|instanceof)(\s|\.|\,|\)|\]|\}|\;|\:|$)/g,"$1<span redtext>$2</span>$3");
					/* booleans */	text = text.replace(/(^|\{|\[|\(|\s)(true|false|null)(\s|\.|\,|\)|\(|\]|\}|\;|\:|$)/g,"$1<span purpletext>$2</span>$3");
					/* types */		text = text.replace(/(^|\{|\[|\(|\s)(Math|Number|String|Object|function|var|eval|Date|Error)(\s|\.|\,|\)|\(|\]|\}|\;|\:|$)/g,"$1<span bluetext>$2</span>$3");

					/* misc */		text = text.replace(/(\.)(decodeURI|decodeURIComponent|encodeURI|encodeURIComponent|escape|eval|exec|length|log|parse|parseFloat|parseInt|pull|test|toArray)(\s|\.|\,|\)|\(|\]|\}|\;|\:|$)/g,"$1<span bluetext>$2</span>$3");
					/* arrays */	text = text.replace(/(\.)(concat|copyWithin|every|fill|filter|find|findIndex|forEach|indexOf|isArray|join|lastIndexOf|map|pop|push|reduce|reduceRight|reverse|shift|slice|some|sort|splice|toString|unshift|valueOf)(\s|\.|\,|\)|\(|\]|\}|\;|\:|$)/g,"$1<span bluetext>$2</span>$3");
					/* numbers */	text = text.replace(/(\.)(isFinite|isInteger|isNaN|isSafeInteger|toExponential|toFixed|toPrecision|toString|valueOf)(\s|\.|\,|\)|\(|\]|\}|\;|\:|$)/g,"$1<span bluetext>$2</span>$3");
					/* math */		text = text.replace(/(\.)(abs|acos|asin|atan|atan2|ceil|cos|exp|floor|log|max|min|pow|random|round|sin|sqrt|tan)(\s|\.|\,|\)|\(|\]|\}|\;|\:|$)/g,"$1<span bluetext>$2</span>$3");
					/* strings */	text = text.replace(/(\.)(charAt|charCodeAt|concat|endsWith|fromCharCode|includes|indexOf|lastIndexOf|localeCompare|match|repeat|replace|search|slice|split|startsWith|substr|substring|toLocaleLowerCase|toLocaleUpperCase|toLowerCase|toString|toUpperCase|trim|valueOf)(\s|\.|\,|\)|\(|\]|\}|\;|\:|$)/g,"$1<span bluetext>$2</span>$3");
					/* dates */		text = text.replace(/(\.)(getDate|getDay|getFullYear|getHours|getMilliseconds|getMinutes|getMonth|getSeconds|getTime|setDate|setFullYear|setHours|setMilliseconds|setMinutes|setMonth|setSeconds|setTime|getUTCDate|getUTCDay|getUTCFullYear|getUTCHours|getUTCMilliseconds|getUTCMinutes|getUTCMonth|getUTCSeconds)(\s|\.|\,|\)|\(|\]|\}|\;|\:|$)/g,"$1<span bluetext>$2</span>$3");
				
					/* numbers */	text = text.replace(/(^|-|\-|\{|\[|\(|\s|\,|[\-|\+|\!|\/|\*|\=]\<\/span\>)(\d*\.)?(\d+)(\s|\.|\,|\)|\]|\}|\;|\:|$)/g,"$1<span purpletext>$2$3</span>$4");
					/* again */		text = text.replace(/(^|-|\-|\{|\[|\(|\s|\,|[\-|\+|\!|\/|\*|\=]\<\/span\>)(\d*\.)?(\d+)(\s|\.|\,|\)|\]|\}|\;|\:|$)/g,"$1<span purpletext>$2$3</span>$4");
					
					/* functions */	text = text.replace(/([a-zA-Z0-9_]+)(\s?\<span\ redtext\>\=\<\/span\>\s?)(\<span\ bluetext\>function\<\/span\>\s?)\((\s?[a-zA-Z0-9_,\s]*?\s?)\)/g,"<span greentext>$1</span>$2$3(<span orangetext>$4</span>)");
					/* functions */	text = text.replace(/(\s?\<span\ bluetext\>function\<\/span\>\s?)([a-zA-Z0-9_]*\s?)\((\s?[a-zA-Z0-9_,\s]*?\s?)\)/g,"$1<span greentext>$2</span>(<span orangetext>$3</span>)");
					/* functions */ text = text.replace(/([a-zA-Z0-9_]+)(\s?\:\s?)(\<span\ bluetext\>function\<\/span\>\s?)/g,"<span greentext>$1</span>$2$3");

					return text;
				}
				
				text = rgbopizer(yellowizer(grayizer(text)));

				return text;

			}
			else {
				return "";
			}
		}

	/* navbar */
		$("#navbar_open").click(function() {
			$("#navbar_open").animate({left: "+=256px"}, 500);
			$("#navbar_open").find(".glyphicon").animate({opacity: 0},500);
			setTimeout(function() {
				$("#navbar_open").hide();
			}, 500);
			
			$("#navbar_close").show().animate({left: "+=256px"}, 500);
			$("#navbar_close").find(".glyphicon").css("opacity",0).animate({opacity: 1},500);
			
			$("#navbar").animate({left: "+=256px"}, 500);
		});

		$("#navbar_close").click(function() {
			$("#navbar_close").animate({left: "-=256px"}, 500);
			$("#navbar_close").find(".glyphicon").animate({opacity: 0},500);;
			setTimeout(function() {
				$("#navbar_close").hide();
			}, 500);

			$("#navbar_open").show().animate({left: "-=256px"}, 500);
			$("#navbar_open").find(".glyphicon").css("opacity",0).animate({opacity: 1},500);
			
			$("#navbar").animate({left: "-=256px"}, 500);
		});

		$("#navbar_signout").click(function() {
			$.ajax({
				type: "POST",
				url: window.location.pathname,
				data: {
					action: "signout",
				},
				success: function(data) {
					if (data.success) {
						window.location = data.redirect;
					}
					else {
						$("#navbar_message").text(data.messages.navbar || "//unable to signout");
					}
				}
			});
		});

		$("#navbar_create_robot").click(function() {
			$.ajax({
				type: "POST",
				url: window.location.pathname,
				data: {
					action: "create_robot",
				},
				success: function(data) {
					if (data.success) {
						window.location = data.redirect;
					}
					else {
						$("#navbar_message").text( data.messages.navbar || "//unable to create robot");
					}
				}
			});
		});

		$("#navbar_create_arena").click(function() {
			$.ajax({
				type: "POST",
				url: window.location.pathname,
				data: {
					action: "create_arena",
				},
				success: function(data) {
					if (data.success) {
						window.location = data.redirect;
					}
					else {
						$("#navbar_message").text(data.messages.navbar || "//unable to create arena");
					}
				}
			});
		});

		$("#navbar_join_arena").click(function() {
			var arena_id = $("#navbar_arena_id").val();

			if (arena_id.length === 4) {
				$.ajax({
					type: "POST",
					url: window.location.pathname,
					data: {
						action: "join_arena",
						arena_id: arena_id
					},
					success: function(data) {
						if (data.success) {
							window.location = data.redirect;
						}
						else {
							$("#navbar_message").text(data.messages.navbar || "//unable to join");
						}
					}
				});
			}
			else {
				$("#navbar_arena_id").css("border-color","var(--red)");
			}
		});

	/* sectionToggle */
		$(document).on("click", ".section-toggle", function() {
			if ($(this).hasClass("section-toggle-down")) {
				$(this).next().next().animate({
					height: 0
				},1000);

				$(this).replaceWith('<span class="glyphicon glyphicon-chevron-up section-toggle section-toggle-up whitetext"></span>');
			}
			else if ($(this).hasClass("section-toggle-up")) {
				var section = $(this).next().next();
				var height = $(section).hide().css("height","auto").css("height");

				$(section).css("height",0).show().animate({
					height: height
				},1000);

				$(this).replaceWith('<span class="glyphicon glyphicon-chevron-down section-toggle section-toggle-down whitetext"></span>');

				setTimeout(function() {
					$(section).css("height","auto");
				},1010);
			}
		});

	/* resizeTop */
		window.resizeTop = function() {
			$(".content").css("margin-top",($(".top_outer").css("height").replace("px","") - 46));
		};
});