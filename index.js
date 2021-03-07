const { MessageEmbed, MessageAttachment, Client, Collection } = require('discord.js');
const client = new Client();
const { prefix, token, serverID } = require('./config.json');

client.on('ready', () =>{
    console.log("ready for dms");
    client.user.setPresence({
        activity: {
            name: "DM to contact staff | ^help",
            type: "WATCHING"
        },
        status: 'dnd'
    })
})

client.on("channelDelete", (channel) => {
    if(channel.parentID == channel.guild.channels.cache.find((x) => x.name === "modmail").id) {
        const person = channel.guild.members.cache.find((x) => x.id === channel.name)
        if(!person) return;
        let yembed = new MessageEmbed()
        .setAuthor("thread deleted", client.user.displayAvatarURL())
        .setColor('RED')
        .setThumbnail(client.user.displayAvatarURL())
        .setDescription("your ticket has been deleted by a moderator, however if you have a problem with this you can make a new one by sending another message")
        return person.send(yembed)
    
    }
})

client.on('message', async message =>{
    if(message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if(message.guild) {
        if(command === 'setup'){
            if(!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("you need the \`administator\` permission to set up the modmail system");
            let role = message.guild.roles.cache.get("806720827680489492");

            if(!role){
                role = await message.guild.roles.create({
                    data: {
                        name: "modmail mod",
                        color: "GREEN"
                    },
                    reason: "mod role did not exist"
                })
            }

            await message.guild.channels.create("modmail", {
                type: 'category',
                topic: "modmail threads will appear here",
                permissionOverwrites: [
                    {
                        id: role.id,
                        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                    },
                    {
                        id: message.guild.roles.everyone.id,
                        deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                    }
                ]
            })

            message.channel.send("setup is complete");
        } if(command === 'close'){
            if(message.channel.parentID === message.guild.channels.cache.find(c => c.name === 'modmail').id) {
                const person = message.guild.members.cache.get(message.channel.name);

                if(!person) return message.channel.send("I am unable to close this thread as the channel name was probably changed");
                await message.channel.delete();

                let yembed = new MessageEmbed()
                .setColor("RED")
                .setAuthor("thread closed", client.user.displayAvatarURL())
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter(`mail closed by ${message.author.username}`)
                if(args[0]) yembed.setDescription(`reason: ${args.join(' ')}`)

                person.send(yembed);
            }
        }

         if(command === 'open'){
            const category = message.guild.channels.cache.find(c => c.name === 'modmail')

            if(!category) return message.channel.send(`the modmail system is not yet setup, use ${prefix}setup to set it up!`)
            if(isNaN(args[0]) || !args.length) return message.channel.send("please give the ID of a person");
            const target = message.guild.members.cache.get(args[0]);
            if(!target) return message.channel.send("I cannot find that user");
            const channel = await message.guild.channels.create(target.id, {
                type: 'text',
                parent: category.id,
                topic: `opened by: ${message.author.username} for: ${target.user.username}`
            })

            let nembed = new MessageEmbed()
            .setAuthor("details", target.user.displayAvatarURL({dynamic: true}))
            .setColor("BLUE")
            .setThumbnail(target.user.displayAvatarURL({dynamic: true}))
            .setDescription(message.content)
            .addFields(
                {name: "creation date:", value: target.user.createdAt, inline: false},
                {name: "name:", value: target.user.username, inline: false}
            )
            channel.send(nembed)

            let uembed= new MessageEmbed()
            .setAuthor("contacted!")
            .setColor("GREEN")
            .setThumbnail(client.user.displayAvatarURL())
            .setDescription(`you have been contacted by ${message.author.username} please wait until they send you another message`)
            target.send(uembed);

            let newEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription(`opened the mail ${channel}`)
            message.channel.send(newEmbed)
        }
     } if(command === 'help'){
        let embed = new MessageEmbed()
        .setColor("GREEN")
        .addFields(
            {name: "setup", value: "sets up the modmail system", inline: true},
            {name: "open", value: "opens a modmail thread", inline: true},
            {name: "close", value: "closes a modmail thread", inline: true}
        )
        .setFooter("made by <@!749470322570559528>")
        message.channel.send(embed)
    }






    if(message.channel.parentID) {
        const category = message.guild.channels.cache.find(c => c.name === 'modmail')

        if(message.channel.parentID === category.id) {
            let member = message.guild.members.cache.get(message.channel.name)

            if(!member) return message.channel.send('unable to send message')

            let lembed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription(message.content)
            member.send(lembed)
        }
       
    }







    if(!message.guild) {
        const guild = await client.guilds.cache.get(serverID) || await client.guilds.fetch(serverID).catch(m => {})
        if(!guild) return;
        const category = guild.channels.cache.find(c => c.name === 'modmail')
        if(!category) return;
        let main = guild.channels.cache.find(x => x.name === message.author.id)
      



        if(!main) {
           main = await guild.channels.create(message.author.id, {
                type: 'text',
                parent: category.id,
                topic: `user: ${message.author.username}`
            })
            let sembed = new MessageEmbed()
            .setAuthor("mail opened")
            .setColor("GREEN")
            .setThumbnail(client.user.displayAvatarURL())
            .setDescription("you have just opened a modmail thread, please be patient until moderators respond")
            message.author.send(sembed)

            let eembed = new MessageEmbed()
            .setColor("BLUE")
            .setAuthor("details", message.author.displayAvatarURL({dynamic: true}))
            .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
            .setDescription(message.content)
            .addField("name", message.author.username)
            .addField("creation date", message.author.createdAt)
            main.send(eembed)//.then(console.log("first message sent to main"))
        }
        let xembed = new MessageEmbed()
        .setColor("GREEN")
        .setDescription(message.content)
        

        main.send(xembed)//.then(console.log("a message has been sent to main"))

        
    }
    

    
})

client.login(token)