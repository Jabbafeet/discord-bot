const Discord = require("discord.js");
const config = require("./config.json")
const {MongoClient} = require('mongodb');
const client = new Discord.Client();
const goodMsg = [];
const badMsg = [];
const prefix = "!";
const dbName = "discordBot";
var wG = null;
client.login(config.BOT_TOKEN);
const uri = "mongodb+srv://Karl:discord@cluster0.c2iuu.mongodb.net/test";
const mClient = new MongoClient(uri);
//const guild = client.guilds.cache.get("822444306069585960");
var voiceChannel = '';
var textChannel = '';

async function main(){
  /**
   * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
   * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
   */
  try {
    // Connect to the MongoDB cluster
    await mClient.connect();
    console.log("connected to Mongo Server");
    // Make the appropriate DB calls
    await listDatabases(mClient);

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

          //try{
              //async function writeDB(mClient){
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

          //  }
          //}catch (err) {
        //    console.log(err.stack);
            //}


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

          cursor.forEach( function(myDoc)
          {
            message.channel.send( "User: " + myDoc.username + " \nMessage: " + myDoc.message );
          })
        }
      }catch(e){
          console.error(e);
        }
      } else if (command === "buildserver"){
          guild.channels.create("testVoice", { parent: voiceChannel, type: "voice", reason: "logging new channel"})
          .then(console.log)
          .catch(console.error);
      } else{
          message.reply("your command was not correct");
      }
    }
  });
}



main().catch(console.error);
