const Discord = require("discord.js");
const config = require("./config.json")
const {MongoClient} = require('mongodb');
const client = new Discord.Client();
const goodMsg = [];
const badMsg = [];
const dbName = "discordBot";
const prefix = "!";
const uri = config.URI;
const mClient = new MongoClient(uri);
//const guild = client.guilds.cache.get("822444306069585960");  Guild ID used before I learned how to grab guild ID's from messages (Depreciated)
var voiceChannel = '';
var textChannel = '';
var i = 0;
var wG = null;
client.login(config.BOT_TOKEN);

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

    //Gets IDs for both channel headings to create channels later
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
      //const argument = message.content.split (' ');
      const msg = argument.toLowerCase();

      if (msg.includes("give")){
        if (msg.includes("help give")){
          return;
        }
        switchArg="give";
        console.log("User: " + messageAuthor + " wants: " + switchArg);
        }
        else if (msg.includes("help")){
        if (msg.includes("help give")){
          return;
        }
        switchArg="help";
        console.log("User: " + messageAuthor + " wants: " + switchArg);
      }

      switch (switchArg) {
          case 'help':
          message.reply('Youve indicated that you wanted help.');
          goodMsg.push(argument); //adds this message's content to an array. This will be used later to send information to a database for the app(React Page) to read
          wG = true;
          break;

          case 'give':
          message.reply('You have indicated you are giving help.');
          badMsg.push(argument);
          wG = false;
          break;
        }


      if (msg.includes("give") || msg.includes("help")){
          const db = mClient.db(dbName);
          const col = db.collection("discordBot");
          console.log("in writeDB");
          let userMessage = {
            "username": messageAuthor,
            "message": msg,
            "give/help": wG
          }
          const p = col.insertOne(userMessage);
          console.log(userMessage);
          wG = null;
        }

       } else {
      const commandBody = message.content.slice(prefix.length);
      const args = commandBody.split(' '); //splits up the string to find command/etc
      const command = args.shift().toLowerCase(); //moves everything to lower case

      if (command === "history"){
        if (goodMsg != 0 && badMsg != 0){
          message.reply("messages that need help:");
          message.channel.send(goodMsg.map((message) => `${message}\n`)); //returns all in array
          message.channel.send("And here's the people that give help:\n")
          message.channel.send(badMsg.map((message) => `${message}\n`)); //rturns all in array
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
      }
      //Command for building the server, adding channels under headings etc
      else if (command === "buildserver"){
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

          guild.channels.create("testVoice", { parent: voiceChannel, type: "voice", reason: "logging new channel"})
          .then(console.log)
          .catch(console.error);
      }

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

      else{
          message.reply("your command was not correct");
      }
    }
  });
}

main().catch(console.error);
