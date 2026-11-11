(function () {
	"use strict";

	const WHITE_TEXT = "rgb(200, 200, 200)";
	const RED_TEXT = "#ff3333";
	const TEST_LINE_CLASS = "test-example-line";

	// Codeforces sets a lot of colours through element.style, which a stylesheet
	// cannot beat. Anything like that is patched here.
	function overrideStyle(elm, property, value) {
		elm.setAttribute("style", (elm.getAttribute("style") || "") + `; ${property}: ${value} !important; `);
	}

	// Runs the callback once the selector matches, retrying while the page loads.
	function whenPresent(selector, callback) {
		const elements = document.querySelectorAll(selector);
		if (elements.length === 0) {
			setTimeout(whenPresent, 100, selector, callback);
			return;
		}
		elements.forEach(callback);
	}

	function assetUrl(path) {
		return chrome.runtime.getURL(path);
	}

	// Blog headers and highlighted comments get their text colour set inline.
	whenPresent(
		"#pageContent div div h3 a, .comment-table.highlight-blue .right .ttypography p, .comment-table.highlight-blue .right .info",
		(elm) => {
			overrideStyle(elm, "color", "white");

			new MutationObserver(() => {
				overrideStyle(elm, "color", "white");
			}).observe(elm, { attributes: true, attributeFilter: ["style"] });
		}
	);

	// Grey row inside the problem tables.
	whenPresent(".datatable div:nth-child(5)", (elm) => elm.classList.add("dark"));

	// Unread message rows are coloured inline, and !important is ignored there.
	whenPresent(".unread td", (elm) => {
		elm.style.backgroundColor = "#13203a !important";
	});

	// 404 page needs its own class to be readable.
	whenPresent("body > h3", (elm) => {
		if (elm.innerText.startsWith("The requested URL was not found on this server.")) {
			document.body.classList.add("notfoundpage");
		}
	});

	// The animated menu bar images are bundled with the extension.
	whenPresent(".second-level-menu-list li.backLava", (elm) => {
		elm.style.backgroundImage = `url(${assetUrl("imgs/lava-right2.png")})`;
		elm.firstElementChild.style.backgroundImage = `url(${assetUrl("imgs/lava-left2.png")})`;
	});

	// Dark editor theme, see code.css.
	whenPresent("#editor", (elm) => {
		const codeforcesClass = "ace-chrome";

		elm.classList.remove(codeforcesClass);
		elm.classList.add("ace-darkmode");

		// Codeforces re-adds ace-chrome in its own loop, so keep removing it.
		setInterval(() => {
			if (elm.classList.contains(codeforcesClass)) {
				elm.classList.remove(codeforcesClass);
			}
		}, 10);
	});

	// Codeforces uses pure green/red text that has too little contrast on dark.
	(function fixContrastColors() {
		if (document.readyState !== "complete") {
			return setTimeout(fixContrastColors, 100);
		}

		document.querySelectorAll("*").forEach((elm) => {
			if (getComputedStyle(elm).color === "rgb(0, 128, 0)") {
				overrideStyle(elm, "color", "#00c700");
			}
		});

		document.querySelectorAll("font[color='red']").forEach((elm) => {
			elm.setAttribute("color", RED_TEXT);
		});
	})();

	whenPresent(".rtable span", (elm) => {
		if (elm.style && elm.style.color === "rgb(0, 0, 0)") {
			overrideStyle(elm, "color", WHITE_TEXT);
		}
	});

	whenPresent("div.alert-success a", (elm) => {
		overrideStyle(elm, "color", "#004794");
	});

	// Sample test lines get their background set inline by Codeforces and it is
	// cleared again on hover-out, so it has to be watched instead of styled.
	whenPresent("." + TEST_LINE_CLASS, () => {
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				const target = mutation.target;
				if (!target.classList.contains(TEST_LINE_CLASS)) return;

				const cssText = target.style.cssText;
				if (cssText === "") return;
				if (!cssText.includes("(26") && !cssText.includes("#1a")) {
					target.style.cssText = "background-color: rgb(26, 26, 26) !important;";
				}
			});
		});

		observer.observe(document.body, { subtree: true, attributeFilter: ["style"] });
	});
})();
