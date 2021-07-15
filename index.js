const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const express = require("express");
//const port = 3005;
const port = process.env.PORT;
const app = express();

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "token.json";

/**
 * Create an OAuth2 client with the given credentials, and then execute the given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {res} response for express to send
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, res, req, callback) {
	const { client_secret, client_id, redirect_uris } = credentials.installed;
	const oAuth2Client = new google.auth.OAuth2(
		client_id,
		client_secret,
		redirect_uris[0]
	);

	// Check if we have previously stored a token.
	fs.readFile(TOKEN_PATH, (err, token) => {
		if (err) return getNewToken(oAuth2Client, callback);
		oAuth2Client.setCredentials(JSON.parse(token));
		return callback(res, req, oAuth2Client);
	});
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, res, req, callback) {
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: "offline",
		scope: SCOPES
	});
	console.log("Authorize this app by visiting this url:", authUrl);
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	rl.question("Enter the code from that page here: ", code => {
		rl.close();
		oAuth2Client.getToken(code, (err, token) => {
			if (err)
				return console.error(
					"Error while trying to retrieve access token",
					err
				);
			oAuth2Client.setCredentials(token);
			// Store the token to disk for later program executions
			fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
				if (err) return console.error(err);
				console.log("Token stored to", TOKEN_PATH);
			});
			callback(res, req, oAuth2Client);
		});
	});
}

function listMajors(auth) {
	const sheets = google.sheets({ version: "v4", auth });
	sheets.spreadsheets.values.get(
		{
			spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
			range: "Class Data!A2:E"
		},
		(err, res) => {
			if (err) return console.log("The API returned an error: " + err);
			const rows = res.data.values;
			if (rows.length) {
				console.log("Name, Major:");
				// Print columns A and E, which correspond to indices 0 and 4.
				rows.map(row => {
					console.log(`${row[0]}, ${row[4]}`);
				});
			} else {
				console.log("No data found.");
			}
		}
	);
}

function getSpreadsheetByDataFilter(sheetId, dataFilters, resp, auth) {
	const request = {
		spreadsheetId: sheetId,
		resource: {

		}
	}

}

function getSpreadsheet(sheetId, range, resp, auth) {
	const sheets = google.sheets({ version: "v4", auth });
	console.log(`getSpreadsheet Id: ${sheetId}`);

	sheets.spreadsheets.values.get(
		{
			spreadsheetId: sheetId,
			range: range
		},
		(err, res) => {
			if (err) return console.log("The API returned an error: " + err);
			const rows = res.data.values;
			if (!rows.length) console.log("Standing: No Data Found.");
			console.log('returning getSpreadsheets data', res.data.values);
			resp.send(res.data.values);
		}
	);
}

function getOwners(resp, req, auth) {
	const sheets = google.sheets({ version: "v4", auth });

	switch (req.params.year){
		case '2018': 
			sheets.spreadsheets.values.get(
				{
					spreadsheetId: "1wRkITJoanQerJhbBmMHrZOe454l8R_ok2HE3jsZgEE4",
					range: "Form Responses 1!C2:C44"
				},
				(err, res) => {
					if (err) return console.log("The API returned an error: " + err);
					const rows = res.data.values;
					if (!rows.length) {
						console.log("No data found.");
					}
		
					let data = [];
					rows.map(row => {
						data.push(row[0]);
					});
		
					resp.send(data);
				}
			);
			break;
		case '2019':
			console.log('need to set up yet');
			break;
		case '2020':
			console.log('need to set up');
			break;
		default: 
				resp.send(null);
	}
}

// Not working atm
function getOwner(resp, req, auth) {
	const sheets = google.sheets({ version: "v4", auth });

	switch (req.params.year){
		case '2018': 
			sheets.spreadsheets.values.get(
				{
					spreadsheetId: "1wRkITJoanQerJhbBmMHrZOe454l8R_ok2HE3jsZgEE4",
					range: "Form Responses 1!C2:J42",
					dataFilters: ""
				},
				(err, res) => {
					if (err) return console.log("The API returned an error: " + err);
					const rows = res.data.values;
					if (!rows.length) {
						console.log("No data found.");
					}
		
					let data = [];
					rows.map(row => {
						data.push(row[0]);
					});
		
					resp.send(data);
				}
			);
			break;
		case '2019':
			console.log('Need to set up yet');
			break;
		case '2020': 
			console.log('need to set up');
			break;
		default: 
			resp.send(null);
	}
}

function getPlayoffChallegeStandings(resp, req, auth) {
	const year = req.params.year;

	console.log(`getting Standings for year ${year}`);
	switch (year) {
		case '2018': 
			console.log('2018');
			getSpreadsheet("1ONwfET9hEh7LQ5nGrZCsf1vw8I3IPr2PjaZIkkZ0cLg","Overall Standings!A4:H44", resp, auth);
			break;
		case '2019':
			console.log('2019');
			getSpreadsheet("1UG5IQ2dD_p9aHG_yZS2abtykT6qTZvFky1V7JXO7UIo","Overall Standings!A4:H44", resp, auth);
			break;
		case '2020':
			console.log('2020');
			getSpreadsheet("1QgcmF4EQ7s0r-6NpoOVXvmKYlz7OlJEfsKv3MjytkRQ","Overall Standings!A4:H52", resp, auth);
			break;
		default:
			console.log(`FAILED!! Year: ${year} was not found`);
			resp.send(null);
	}
}

function getTeam(resp, req, auth) {
	const year = req.params.year;
	const teamId = req.params.id;

	console.log(`getting Team ${teamId} in year ${year}`);
	switch (year) {
		case '2018': 
			console.log('2018 - Need to Imp');
			// getSpreadsheet("1ONwfET9hEh7LQ5nGrZCsf1vw8I3IPr2PjaZIkkZ0cLg","Teams Vert No Space!A4:H44", resp, auth);
			break;
		case '2019':
			console.log('2019');
			const dataFilter = {
				
			};
			getSpreadsheetByDataFilter("1Y8elGaL0XDZ7vqUogvUahOkqGk2oplBwEkQ5CY5GPwM", dataFilter, resp, auth);
			break;
		case '2020':
			console.log('2020 - Need to Imp');
			// getSpreadsheet("1QgcmF4EQ7s0r-6NpoOVXvmKYlz7OlJEfsKv3MjytkRQ","Overall Standings!A4:H44", resp, auth);
			break;
		default:
			console.log(`FAILED!! Year: ${year} was not found`);
			resp.send(null);
	}
}

function get21WLStandings(resp, req, auth) {
	const sheets = google.sheets({ version: 'v4', auth});
	sheets.spreadsheets.values.get(
		{
			spreadsheetId: "1juk4cxhPkeq6sX0qOv8qu4WjVZoqVtbuidcmUcPcg-4",
			range: "Standings!A3:H8"
		},
		(err, res) => {
			if (err) return  console.log("The API returned an error: " + err);
			
			const rows = res.data.values;
			if (!rows.length) console.log('No Data Found.');

			resp.send(res.data.values);
		}
	);
}

function get21WLRosters(resp, req, auth) {
	const sheets = google.sheets({ version: 'v4', auth});
	sheets.spreadsheets.values.get(
		{
			spreadsheetId: "1juk4cxhPkeq6sX0qOv8qu4WjVZoqVtbuidcmUcPcg-4",
			range: "Rosters!A1:W6"
		},
		(err, res) => {
			if (err) return  console.log("The API returned an error: " + err);
			
			const rows = res.data.values;
			if (!rows.length) console.log('No Data Found.');

			resp.send(res.data.values);
		}
	);
}

app.use((req, res, next) => {
	// Website you wish to allow to connect
	res.setHeader("Access-Control-Allow-Origin", "https://playoff-sheets.herokuapp.com");

	// Request methods you wish to allow
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, OPTIONS, PUT, PATCH, DELETE"
	);

	// Request headers you wish to allow
	res.setHeader(
		"Access-Control-Allow-Headers",
		"X-Requested-With,content-type"
	);

	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	res.setHeader("Access-Control-Allow-Credentials", true);

	// Pass to next layer of middleware
	next();
});

app.get("/pc/:year/owners", (req, res) => {
	fs.readFile("credentials.json", (err, content) => {
		if (err) return console.log("Error loading client secret file:", err);
		authorize(JSON.parse(content), res, req, getOwners);
	});
});

app.get("/pc/:year/standings", (req, res) => {
	fs.readFile("credentials.json", (err, content) => {
		if (err) return console.log("Error loading client secret file:", err);
		authorize(JSON.parse(content), res, req, getPlayoffChallegeStandings);
	});
});

app.get("pc/:year/team/:id", (req, res) => {
	fs.readFile("credentials.json", (err, content) => {
		if (err) return console.log("Error loading client secret file:", err);
		authorize(JSON.parse(content), res, req, getTeam);
	})
});

app.get('/21wl/rosters', (req, res) => {
	fs.readFile("credentials.json", (err, content) => {
		if (err) return console.log("Error loading client secret file:", err);
		authorize(JSON.parse(content), res, req, get21WLRosters);
	});
});

app.get('/21wl/standings', (req, res) => {
	fs.readFile("credentials.json", (err, content) => {
		if (err) return console.log("Error loading client secret file:", err);
		authorize(JSON.parse(content), res, req, get21WLStandings);
	});
});

app.get("/owner/:ownerName", (req, res) => {
	fs.readFile("credentials.json", (err, content) => {
		if (err) return console.log("Error loading client secret file:", err);
		authorize(JSON.parse(content), res, req, getOwner);
	});
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
