const Discord = require('discord.js');
const config = require('./config.json');
const client = new Discord.Client();

const MongoClient = require('mongodb').MongoClient;
const mongo_cluster = config.mongo_cluster;




var prefix = config.prefix;
// 24/7

const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const webport = config.port;

router.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + '/web/index.html'));
	//__dirname : It will resolve to your project folder.
});
app.use('/', router);
app.listen(process.env.port || webport);
console.log("im hosted on port " + webport);
// 24/7

client.on('ready', () => {
	console.log(`bot updated`);
});

client.on('message', msg => {
	return;
});

client.login(config.token).then(() => {
	setInterval(async function () {
		updating_code();
	}, 60 * 1000);
});

async function updating_code() {
	MongoClient.connect(mongo_cluster, { useUnifiedTopology: true, useNewUrlParser: true }, function (err, db) {
		if (err) {
			console.log(err);
			return;
		}
		let dbo = db.db("guildData");
		dbo.collection("guildData").find({}).toArray(function (err, guildData) {
			if (err) {
				console.log(err);
				return;
			}
			let filtered_results;
			let time = getTime();

			// filtering results that have undefined
			filtered_results = guildData.filter(data => data.timeline);
			filtered_results = filtered_results.filter(data => data.lessons);
			filtered_results = filtered_results.filter(data => data.guildid);
			filtered_results = filtered_results.filter(data => data.channelid);
			filtered_results = filtered_results.filter(data => data.timeline.includes(time));
			if (filtered_results.length == 0) return;

			// checking each result
			for (result in filtered_results){
				result = filtered_results[result];
				let timeline_index = (result.timeline).findIndex(time_ => time_ === time);
				let day = getDay();
				let schedule = result.lessons[day];
				// checking if there is a schedule for this day is invalid
				if (!schedule) return;
				if (timeline_index  > schedule.length) return;
				let lessonName = schedule[timeline_index];
				let lessonURL = result.lessons.links[lessonName];
				if (!lessonName) return;
				let channel = client.channels.cache.get(result.channelid);
				// checking if the channel is invalid is invalid
				if (!channel) return;
				if (lessonURL){
					channel.send("hi, you have a lesson in " + lessonName + ", the link is " + lessonURL + "\nthe bot was made by BarrulikDev#2984");
				} else {
					channel.send("hi, you have a lesson in " + lessonName + "\nthe bot was made by BarrulikDev#2984");
				}
				
			}

		});
	});
}

function getTime() {
	const date_ob = new Date();
	let hours = date_ob.getHours();
	let minutes = date_ob.getMinutes();
	return hours + ':' + minutes;
}

function getDay() {
	const date_ob = new Date();
	let day_num = date_ob.getDay();
	switch (day_num) {
		case 0:
			return "sunday";
		case 1:
			return "monday";
		case 2:
			return "tuesday";
		case 3:
			return "wednesday";
		case 4:
			return "thursday";
		case 5:
			return "friday";
		case 6:
			return "saturday";
	}
}