const Discord = require("discord.js");
const config = require("./config.json")
const {MongoClient} = require('mongodb');
const client = new Discord.Client();
const goodMsg = [];
const badMsg = [];
const topics = [];
const topicsIn = [];
const dbName = "discordBot";
const prefix = "!";
const uri = config.URI;
const mClient = new MongoClient(uri);
var welcomeChannel = '';
//const guild = client.guilds.cache.get("822444306069585960");  Guild ID used before I learned how to grab guild ID's from messages (Depreciated)
var voiceChannel = '';
var textChannel = '';
var i = 0;
var wG = null;
var foundTopic = null;
var dbTopic;
var contents;
var creationBool = false;
client.login(config.BOT_TOKEN);

/*****
****** Name: Discord Bot
****** Function: Talking to the database and collecting messages from students for statistics on dashboard
****** Creator: Karl Roche
****** Last Update: 22:16 22/04/2021
******/

async function main(){
  try {
    // Connect to the MongoDB cluster
    await mClient.connect();
    console.log("connected to Mongo Server");
    // Make the appropriate DB calls
    await listDatabases(mClient);
    //Do not close the client as we will be using it throughout the whole running of the bot

  } catch (e) {
      console.error(e);
  }


  async function listDatabases(mClient){
      //Mongoclient.open();
      databasesList = await mClient.db().admin().listDatabases();

      console.log("Databases:");
      databasesList.databases.forEach(db => console.log(` - ${db.name}`));
    };

  client.on("message", function(message){
    const guild = message.guild;
    if(message.author.bot) return; //Looks to see if the author of message is another bot, If it is dont go any further

    message.guild.channels.cache.forEach((val, inx) =>{ //checks number of channels to gauge if the server has been created or not, later on checks bool.
       i++;
       console.log("" + i);
    })
    if (i>5){
      creationBool=true;
      console.log("im here in True");
      i=0;
    }else {
      creationBool=false;
      console.log("im here in False");
      i=0;
    }

    //Gets IDs for both channel headings to create channels later (UNUSED)
  /*  message.guild.channels.cache.forEach((val, inx) =>{
      const channelName = val.name;

      if (channelName === "Voice Channels"){
        voiceChannel = inx;
        console.log("\nLogged voice channel " +voiceChannel + "\n");
      } else if (channelName === "Text Channels"){
        textChannel = inx;
        console.log("\nLogged Text Channels " +textChannel + "\n");
      }
    })*/

    const messageAuthor = message.author.username;
    var switchArg="none";
    console.log(messageAuthor);
    if (!message.content.startsWith(prefix)){
      const argument = message.content;
      const msg = argument.toLowerCase();

      if (msg.includes("give")){
        /*if (msg.includes("help give")){
          return;
        }*/
        switchArg="give";
        console.log("User: " + messageAuthor + " wants: " + switchArg);
        }
        else if (msg.includes("help")){
        /*if (msg.includes("help give")){
          return;
        }*/
        switchArg="help";
        console.log("User: " + messageAuthor + " wants: " + switchArg);
      }

      switch (switchArg) {
          case 'help':
          //message.reply('Youve indicated that you wanted help.');
          goodMsg.push(argument); //adds this message's content to an array. This will be used later to send information to a database for the app(React Page) to read
          wG = true;
          break;

          case 'give':
          //message.reply('You have indicated you are giving help.');
          badMsg.push(argument);
          wG = false;
          break;
        }
		
	  contents = message.content.toLowerCase(); //sets contents
	  var dbChannel= message.channel.name; //sets channel name from message for later

	  topicLength = topics.length;
	  while (topicLength >= -1){
		  console.log("topiclength: " +topicLength);
		  
		  if (contents.indexOf(topics[topicLength])!=-1){
			  foundTopic = true;
			  console.log("I'm in the while loop iteration: " + topicLength);
			  console.log("topic found " + topics[topicLength]);
			  dbTopic = topics[topicLength]; 
			  break;		
		  }else if (topicLength == -1){
			  console.log("inside of the else, Topic length ---1");
			  dbTopic = "none";
			  foundTopic = false;
			  break;
		  }
		  topicLength = topicLength - 1;  
		  
	  }
	
      if (foundTopic || msg.includes("give") || msg.includes("help")){
          const db = mClient.db(dbName);
          const col = db.collection("discordBot");
          console.log("in writeDB");
		  
		  
		let userMessage = {
			"username": messageAuthor,
			"message": msg,
			"give/help": wG,
			"topic": dbTopic,
			"channel": dbChannel
		 }

		  
          const p = col.insertOne(userMessage);
          console.log(userMessage);
          wG = null;
        }

       }
	   
       //ELSE GO TO COMMANDS (!commands)
       else {
      const commandBody = message.content.slice(prefix.length);
      const args = commandBody.split(' '); //splits up the string to find command/etc
      const command = args.shift().toLowerCase(); //moves everything to lower case
	  
	  if (command === "commands" || command === "help"){
		  message.reply("Hi there, Thanks for using the student dashboard collection bot\n**The commands to use this bot are as follows.**\n**!history** : This command will show all messages gotten locally (Debug)\n**!database** : this command will look for all documents in the database and return them here (Debug)\n**!buildserver** : If you're new you should use this, This will allow the bot to build up your server. The bot will work without but it will work better with its own hierarchy. Please delete all but one channel before using this command\n**!topics** : This command will allow you to enter custom topics for the bot to find and use in its collection and sending to the DB\n**!purge** : this command will allow you to remove ALL entries from the database to start again");
	  }

      else if (command === "history"){
        if (goodMsg != 0 && badMsg != 0){
          message.reply("messages that need help:");
          message.channel.send(goodMsg.map((message) => `${message}\n`)); //returns all in array
          message.channel.send("And here's the people that give help:\n")
          message.channel.send(badMsg.map((message) => `${message}\n`)); //returns all in array
        }else{
          message.channel.send("The internal volatile array is empty.");
        }
      }

     else if (command === "database"){
       const db = mClient.db(dbName);
       const col = db.collection("discordBot");
       try{
       retrieveM().then;
       console.log("Opening Retrieve ");
       async function retrieveM(mClient){
          console.log("in Retrieve////");
          const cursor = col.find();
          //.batchSize(NUMBER_OF_DOCUMENTS_IN_BATCH);
          const findResult = await col.find({
            //name: "Jabbafeet",
          });

          await cursor.forEach(console.dir);
          var docNumber = await db.collection('discordBot').find().count();

          //console.log("" + docNumber); This was for finding how many documents I had (Purely Debug)

          //If there's no documents, notify user and return.
          if(docNumber === 0){
            message.channel.send("Database is empty");
            return;
          }
          //Finds each document and sends it back out to the user in Discord. Count's the documents with Console.log to show if it should be in there on console
          cursor.forEach( function(myDoc)
          {
            i++;
            console.log(" I shouldn't be here if DB empty. Document: " +i);
            message.channel.send( "User: " + myDoc.username + " \nMessage: " + myDoc.message );
          })
        }
      }catch(e){
          console.error(e);
        }
        i=0;
      }
      //Command for building the server, adding channels under headings etc
      else if (command === "buildserver"){
        //Creates the channels if not all are made etc, Counts channels
        /*console.log("I am " +creationBool);*/
          if (!creationBool){
          //creates and gives admin role for later use
           guild.roles.create({
                    data: {
                    name: 'Administrator',
                    color: 'BLUE',
              },
              reason: 'Creating role for admin',
            })
            .then(console.log)
            .catch(console.error);

            //gives user the role for later use, only want admin/server owner to be able to add topics
            let role = message.guild.roles.cache.find(role => role.name ==="Administrator");
            let member = message.member;
            member.roles.add("" + role).catch(console.error);

            //for each channel finds the ID for voice channels heading and text channels heading
            message.guild.channels.cache.forEach((val, inx) =>{
            const channelName = val.name;

            if (channelName === "Voice Channels"){
              voiceChannel = inx;
              console.log("\nLogged voice channel " +voiceChannel + "\n");
            } else if (channelName === "Text Channels"){
              textChannel = inx;
              console.log("\nLogged Text Channels " +textChannel + "\n");
            }
          })

          guild.channels.create("Welcome", { parent: textChannel, type: "text", permissionOverwrites:[{id:"" + guild, deny: ['SEND_MESSAGES']}], reason: "logging new channel"})
          .then(channel => channel.send("Hi there, This area is to give a short description of how this bot works and how the channels below work.\n Be sure to talk about all homework issues in the homework help channel, This bot will check every channel but it specifically uses the homework help channel to compile help or giving help requests"))
          guild.channels.create("General Chat", { parent: textChannel, type: "text", reason: "logging new channel"})
          guild.channels.create("Homework Help", { parent: textChannel, type: "text", reason: "logging new channel"})
          guild.channels.create("Off-Topic", { parent: textChannel, type: "text", reason: "logging new channel"})
          guild.channels.create("Bot Commands", { parent: textChannel, type: "text", reason: "logging new channel"})
          guild.channels.create("Homework Chat (voice)", { parent: voiceChannel, type: "voice", reason: "logging new channel"})
          guild.channels.create("One-To-One", { parent: voiceChannel, type: "voice", reason: "logging new channel"})
            .then(console.log)
            .catch(console.error);

          message.reply("completed channel creation");
          message.channel.delete();
          creationBool = true;
        } else if (creationBool) {
          message.reply("already created channels here, Or you have set the channel up already\nIf you'd like to have the bot make them automatically please delete all channels and use !buildserver");
        } else{
          message.reply("uhoh");
        }
      }

      /*else if (command === "compare"){ //This was to find out that the ID for everyone role in discord is the same as Guild ID, which is needed to make permissions
        message.reply("Id I just found 832313590467788824 vs ID: " + guild);
      }*/

      // Built in bot command to remove all documents in DB/Col
      else if (command === "purge"){
        const db = mClient.db(dbName);
        message.reply("Are you Sure? (Yes/No)");
        const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
        console.log(collector)
        collector.on('collect', message => {
            if (message.content.toUpperCase() == "YES") {
              try{
                db.collection('discordBot').deleteMany({});
              }catch(e){
                console.error(e);
              }
              message.reply("Completed, All documents in Database have been removed");
              collector.stop();
              return;
              } else if (message.content.toUpperCase() == "NO") {
                message.channel.send("Have not removed anything in Database");
                collector.stop();
                return;
              }
        })
        collector.on('end', (collected,reason) =>{
          console.log("" + reason);
          if (reason == "time"){
            message.reply("this request has timed out");
          }

        })
        //const col= db.collection("discordBot");
      }
      else if (command === "topics"){ //If command = topics allow admin/tutor to listt the topics they'd like to use
         if (message.member.roles.cache.find(r=>r.name==="Administrator")){
           message.reply("Collecting your topics now.\n type end to stop.");
           const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 90000 });
           console.log(collector)
           collector.on('collect', message =>{
             if (message.content.toUpperCase() != "END"){
				 if(new RegExp(topics.join("|")).test(contents)){ //if RegExp finds that messages match whats in topics, will not let user put a duplicate in
					 if (topics.length !=0){
						message.reply("This topic was already collected, please use another or end to finish.");
					 }
					 else {
						 message.reply("collected " +message.content);
						 const argument = message.content;
						 const msg = argument.toLowerCase();
						 topics.push(msg);
					}
				 } else {
					 message.reply("collected " +message.content);
					 const argument = message.content;
					 const msg = argument.toLowerCase();
					 topics.push(msg);
				 }
             }
             else{
               message.channel.send("Those topics are now noted and looked for");
               collector.stop();
               topics.forEach(element => console.log(element));
             }

          });
         } else{
           message.reply("You cannot use this command as you're not the tutor");
         }
      }

      else{
          message.reply("your command was not correct");
      }
    }
  });
}

main().catch(console.error);
