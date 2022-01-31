import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import fetch from "node-fetch";

/** CONSTANTS **/
const extensionFullname = 'aryanmann.cdn-list';
const commands = {
	listCDN: "extension.cdnlist.listCDN",
	configure: "extension.cdnlist.configure",
	refresh: "extension.cdnlist.refreshCDNs",
	update: "extension.cdnlist.cdnjsUpdate"
};
const updateWarningMessage = "This will overwrite the CDNs.json file with the latest libaries from cdnjs.com. Are you sure?";

/** TYPES **/
type cdnjsLibrariesResponse = {
	results: [{ name: string, latest: string }],
	total: string,
	available: string
}
type librariesJson = {
	[key: string]: string
}

/** PROGRAM **/

/**
 * Returns the path to the CDNs.json file that stores all the CDNs shown to the user.
 * Note: If the file does not exist, it will be created.
 * @returns Path to the CDNs.json file
 */
function GetCdnFilePath(): string {
	return path.join(vscode.extensions.getExtension(extensionFullname)!.extensionPath, "src", "CDNs.json");
}

/**
 * Loads the contents of the CDNs.json file
 * @returns An object where key is the name of the library and value is the url to it
 */
function CreateOrGetCdnFile(): librariesJson {
	let jsonPath = GetCdnFilePath();

	if (fs.existsSync(jsonPath)) {
		let jsonData = JSON.parse(fs.readFileSync(jsonPath, { encoding: "utf-8" }));
		return <librariesJson>jsonData;
	} else {
		fs.writeFileSync(jsonPath, JSON.stringify([]));
		return {};
	}
}

/**
 * Wrapper function that gets the CDNs.json file but has error handling via UI suggestions
 * @returns An object where key is the name of the library and value is the url to it
 */
function GetFromFile(): librariesJson {
	let cdnListRaw: librariesJson = CreateOrGetCdnFile();
	if (typeof (cdnListRaw) !== "object") {
		vscode.window.showErrorMessage("The CDN json file does not match the expected schema.", "Open JSON").then(selection => {
			if (selection === "Open JSON") {
				let path = vscode.Uri.file(GetCdnFilePath());
				vscode.workspace.openTextDocument(path).then(doc => vscode.window.showTextDocument(doc));
			}
		})
		return {};
	} else {
		return cdnListRaw;
	}
}

/**
 * Extracts the version number from a cdnjs API url for a library
 * @param url A url of the form "https://cdnjs.cloudflare.com/ajax/libs/<library>/<version>/<filename>"
 * @returns The version number of the library
 */
function tryExtractVersion(url: string) {
	if (!url)
		return "";

	let secondHalf = url?.substring(39) ?? "";
	let splitStrings = secondHalf?.split('/') ?? "";

	if (splitStrings.length > 0)
		return splitStrings[1];
	else
		return "";
}

/**
 * Write "thing" to the active cursor pointer on the currently open editor window
 * @param thing Any string
 */
function writeToEditor(thing: string): void {
	let activeEditor = vscode.window.activeTextEditor;
	if (activeEditor === undefined || activeEditor === null)
		return

	activeEditor.edit((eb) => {
		eb.insert(activeEditor!.selection.active, thing);
	})
}

export function activate(context: vscode.ExtensionContext) {
	let cdnList = GetFromFile();

	/**
	 * Select a CDN from the actively loaded list
	 */
	let listCdnsCommand = vscode.commands.registerCommand(commands.listCDN, () => {
		if (Object.keys(cdnList).length === 0) {
			vscode.window.showInformationMessage("No entries found!", "Open JSON").then(selection => {
				if (selection === "Open JSON") {
					let path = vscode.Uri.file(GetCdnFilePath());
					vscode.workspace.openTextDocument(path).then(doc => vscode.window.showTextDocument(doc));
				}
			});
			return;
		}

		let displayList = Object.entries(cdnList).map((x) => ({
			label: x[0],
			description: tryExtractVersion(x[1]),
			detail: x[1]
		}))
		vscode.window.showQuickPick(displayList).then(item => {
			if (item === undefined)
				return;

			let url = cdnList[item.label];
			let libraryType = "";

			if (url.endsWith(".js"))
				libraryType = "JS";
			else if (url.endsWith(".css"))
				libraryType = "CSS";

			if (libraryType === "") {
				writeToEditor(url);
			}

			vscode.window.showQuickPick([
				{ label: "HTML Tag", detail: "eg: <script> or <link> tag" },
				{ label: "Link", detail: "eg: https://xyz.com/abc.js" }
			]).then((item) => {
				let writeType = item?.label ?? undefined;
				if (writeType === undefined)
					return;

				if (writeType === "HTML Tag") {
					if (libraryType === "JS") {
						writeToEditor(`<script src="${url}"></script>`)
					} else if (libraryType === "CSS") {
						writeToEditor(`<link rel="stylesheet" href="${url}" />`)
					} else {
						writeToEditor(url);
					}
				} else {
					writeToEditor(url);
				}
			});
		})
	});

	/**
	 * Edit the actively loaded list
	 */
	let configureCommand = vscode.commands.registerCommand(commands.configure, () => {
		let path = vscode.Uri.file(GetCdnFilePath());
		vscode.workspace.openTextDocument(path).then(doc => vscode.window.showTextDocument(doc));
	});

	/**
	 * Reloads in the actively loaded list from the CDNs.json file
	 */
	let refreshCommand = vscode.commands.registerCommand(commands.refresh, () => {
		cdnList = GetFromFile();
	});

	/**
	 * Overwrites the CDNs.json file and loads it in as the actively loaded list
	 */
	let updateCommand = vscode.commands.registerCommand(commands.update, () => {
		vscode.window.showInformationMessage(updateWarningMessage, ...["Yes", "Cancel"]).then(answer => {
			if (answer === "Yes") {
				fetch("https://api.cdnjs.com/libraries", { method: "GET" }).then((x) => x.json()).then((y) => {
					const data = <cdnjsLibrariesResponse>y;
					const libraries = data.results;

					let output: { [key: string]: string } = {};
					Object.values(libraries).forEach(({ name, latest }) => {
						output[name] = latest;
					});

					fs.writeFileSync(GetCdnFilePath(), JSON.stringify(output), { encoding: "utf-8" });
					cdnList = GetFromFile();
					vscode.window.showInformationMessage("Updated CDN JSON file.")
				})
			}
		})

	});

	// Subscribe to all commands
	context.subscriptions.push(listCdnsCommand)
	context.subscriptions.push(configureCommand)
	context.subscriptions.push(refreshCommand)
	context.subscriptions.push(updateCommand)
}

export function deactivate() {
	// We do nothing..
}
