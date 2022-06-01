#! /usr/bin/env node

const fetch = require("node-fetch");
const repoUrl = require("get-repository-url");
const yargs = require("yargs");
const csv = require("csvtojson");
//slicing argv
const argv = yargs(process.argv.slice(2)).argv;
//only if file name and dependancy is passed
if (argv.file && argv.dependancy) {
	// console.log(argv.file + " Start :)");
	//getting dependancy name and file name from the argument passed
	var dependancy = argv.dependancy;
	var csvFilePath = argv.file;
	//axios@1.0.1
	//tempArray[0] = dependancyName = "axios", tempArray[1] = version = "1.0.1"
	var tempArray = dependancy.split("@");
	var dependancyName = tempArray[0];
	var version = tempArray[1];
	// console.log(dependancyName);
	//converting string version number into int version number and storing it
	var versionArray = version.split(".");
	var major = parseInt(versionArray[0]);
	var minor = parseInt(versionArray[1]);
	var patch = parseInt(versionArray[2]);
	// console.log(csvFilePath);

	//Importing the CSV and converting it into JSON data
	//table titles

	console.log(
		"---------------------------------------------------------------------------------------------"
	);
	console.log(
		"Name" +
			"\t\t\t" +
			"Version" +
			"\t\t\t" +
			"version_satisfied" +
			"\t\t" +
			`${argv.update && "Update PR"}`
	);
	console.log(
		"---------------------------------------------------------------------------------------------"
	);
	var data = [{}];
	//converting csv file details into json and storing it in data => array of objects
	csv()
		.fromFile(csvFilePath)
		.then((jsonObj) => {
			data = jsonObj;
			data.map((dataPackage) => {
				var repo1 = dataPackage.repo;
				// console.log(dataPackage.name);
				// console.log(dataPackage.repo);
				var packageLink = repo1.substring(18, repo1.length);
				//creating root to RAW - package.json of that repository
				let packageLeft = "https://raw.githubusercontent.com";
				let packageRight = "/main/package.json";
				let RawPackageLink = packageLeft.concat(packageLink);
				RawPackageLink = RawPackageLink.concat(packageRight);

				//2nd

				const getNames = async () => {
					//fetching RAW package.json
					try {
						const names = await fetch(RawPackageLink);
						const textData = await names.json();
						return textData;
					} catch (err) {
						console.log("fetch error", err);
					}
				};

				(async () => {
					const getText = await getNames();
					//pre-processing current version
					var objectValue = JSON.parse(
						JSON.stringify(getText.dependencies)
					);
					temp = objectValue[dependancyName];

					//checking if UPDATE was passed, if not, the table without Update PR will be printed
					if (!argv.update) {
						if (temp) {
							//removing the "^" and "~" parts from version
							if (temp.charAt(0) == "^" || temp.charAt(0) == "~") {
								temp = temp.substring(1);
							}
							//storing the major, minor and patch inside the array
							var currentVersionArray = temp.split(".");

							// storing the converted string version number into int version number
							var currentMajor = parseInt(currentVersionArray[0]);
							var currentMinor = parseInt(currentVersionArray[1]);
							var currentPatch = parseInt(currentVersionArray[2]);
							//checking the package version and current project's version
							if (
								major > currentMajor ||
								minor > currentMinor ||
								patch > currentPatch
							) {
								//if version is lesser
								console.log(
									getText.name + "\t" + temp + "\t\t\t" + "False"
								);
							} else {
								//if version is uptodate
								console.log(
									getText.name + "\t" + temp + "\t\t\t" + "True"
								);
							}
						} else {
							//if the package that we entered is not found
							console.log(
								getText.name + "\t" + temp + "\t\t" + "Not Available"
							);
						}
					}
					//If update is available....... table with Update PR will be displayed
					else {
						//removing the "^" and "~" parts from version
						if (temp) {
							if (temp.charAt(0) == "^" || temp.charAt(0) == "~") {
								temp = temp.substring(1);
							}
							//storing the major, minor and patch inside the array
							var currentVersionArray = temp.split(".");

							// storing the converted string version number into int version number
							var currentMajor = parseInt(currentVersionArray[0]);
							var currentMinor = parseInt(currentVersionArray[1]);
							var currentPatch = parseInt(currentVersionArray[2]);

							//  Prints the PR_URL
							var pullURLHandler = () => {
								repoUrl(dependancyName).then(function (url) {
									pullURL = url.concat("/pulls");
									return console.log(pullURL);
								});
							};
							//checking the package version and current project's version
							if (
								major > currentMajor ||
								minor > currentMinor ||
								patch > currentPatch
							) {
								//if version is lesser
								console.log(
									getText.name +
										"\t" +
										temp +
										"\t\t\t" +
										"False" +
										"\t\t\t\t" +
										pullURLHandler()
								);
							} else {
								//if version is uptodate
								console.log(
									getText.name +
										"\t" +
										temp +
										"\t\t\t" +
										"True" +
										"\t\t\t"
								);
							}
						} else {
							//if the package that we entered is not found
							console.log(
								getText.name +
									"\t" +
									temp +
									"\t\t" +
									"Not Available" +
									"\t\t\t" +
									"Not Available"
							);
						}
						console.log(
							"---------------------------------------------------------------------------------------------"
						);
					}
				})();
			});
		});
} else {
	console.log("Try again");
}
