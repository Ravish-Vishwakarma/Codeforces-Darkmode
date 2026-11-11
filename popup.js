(function () {
	"use strict";

	const manifest = chrome.runtime.getManifest();

	document.getElementById("version").textContent = "v" + manifest.version;

	if (manifest.homepage_url) {
		document.getElementById("github-link").href = manifest.homepage_url;
	}
})();
