const url = require("url");
const ejs = require("ejs");
const path = require("path");
const chalk = require("chalk");
const express = require("express");
const config = require("../config");
const passport = require("passport");
const bodyParser = require("body-parser");
const session = require("express-session");
const GuildSettings = require("../models/settings");
const Strategy = require("passport-discord").Strategy;
const { boxConsole } = require("../functions/boxConsole");
const {GuildChannelManager } = require("discord.js");
const app = express();
const MemoryStore = require("memorystore")(session);

module.exports = async (client) => {
  const dataDir = path.resolve(`${process.cwd()}${path.sep}dashboard`);
  const templateDir = path.resolve(`${dataDir}${path.sep}templates`);
  app.use(express.urlencoded({ extended: true }));
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));

  let domain;
  let callbackUrl;

  try {
    const domainUrl = new URL(config.domain);
    domain = {
      host: domainUrl.hostname,
      protocol: domainUrl.protocol,
    };
  } catch (e) {
    console.log(e);
    throw new TypeError("Invalid domain specific in the config file.");
  }

  if (config.usingCustomDomain) {
    callbackUrl = `${domain.protocol}//${domain.host}/callback`;
  } else {
    callbackUrl = `${domain.protocol}//${domain.host}${config.port == 80 ? "" : `:${config.port}`}/callback`;
  }

  const msg = `${chalk.red.bold("Info:")} ${chalk.green.italic(
    "Make sure you have added the Callback URL to the Discord's OAuth Redirects section in the developer portal.",
  )}`;
  boxConsole([
    `${chalk.red.bold("Callback URL:")} ${chalk.white.bold.italic.underline(
      callbackUrl,
    )}`,
    `${chalk.red.bold(
      "Discord Developer Portal:",
    )} ${chalk.white.bold.italic.underline(
      `https://discord.com/developers/applications/${config.id}/oauth2`,
    )}`,
    msg,
  ]);

  passport.use(
    new Strategy(
      {
        clientID: config.id,
        clientSecret: config.clientSecret,
        callbackURL: callbackUrl,
        scope: ["identify", "guilds"],
      },
      (accessToken, refreshToken, profile, done) => {
        process.nextTick(() => done(null, profile));
      },
    ),
  );

  app.use(
    session({
      store: new MemoryStore({ checkPeriod: 86400000 }),
      secret:
        "#@%#&^$^$%@$^$&%#$%@#$%$^%&$%^#$%@#$%#E%#%@$FEErfgr3g#%GT%536c53cc6%5%tv%4y4hrgrggrgrgf4n",
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());
  const cors = require('cors');
  app.use(cors());
  app.locals.domain = config.domain.split("//")[1];

  app.engine("ejs", ejs.renderFile);
  app.set("view engine", "ejs");
  app.use(express.json());
  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  );

  app.use("/", express.static(path.resolve(`${dataDir}${path.sep}assets`)));

  const renderTemplate = (res, req, template, data = {}) => {
    const baseData = {
      bot: client,
      path: req.path,
      user: req.isAuthenticated() ? req.user : null,
    };
    res.render(
      path.resolve(`${templateDir}${path.sep}${template}`),
      Object.assign(baseData, data),
    );
  };
  const mongoose = require('mongoose');
  const { MongoClient, ServerApiVersion } = require('mongodb');
  const EmbedSchema = new mongoose.Schema({
    title: String,
    description: String,
    color: String,
    imageUrl: String,
  });
  
  const Embed = mongoose.model('Embed', EmbedSchema);
  
  app.post('/create-embed', async (req, res) => {
    try {
      const { title, description, color, imageUrl } = req.body;
  
      const embed = new Embed({
        title,
        description,
        color,
        imageUrl,
      });
  
      await embed.save();
  
      // Generate Discord embed object (using Discord.js for illustration)
      const discordEmbed = {
        title: embed.title,
        description: embed.description,
        color: embed.color,
        image: embed.imageUrl ? { url: embed.imageUrl } : undefined,
      };
  
      // Send embed to Discord (replace with your actual logic)
      // YourDiscordClient.channels.cache.get('your_channel_id').send({ embeds: [discordEmbed] });
  
      res.status(200).json({ message: 'Embed created and saved successfully!', embedData: discordEmbed });
    } catch (error) {
      console.error('Error creating embed:', error);
      res.status(500).json({ message: 'Error creating embed' });
    }
  });
  const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    req.session.backURL = req.url;
    res.redirect("/login");
  };

  app.get(
    "/login",
    (req, res, next) => {
      if (req.session.backURL) {
        req.session.backURL = req.session.backURL;
      } else if (req.headers.referer) {
        const parsed = url.parse(req.headers.referer);
        if (parsed.hostname === app.locals.domain) {
          req.session.backURL = parsed.path;
        }
      } else {
        req.session.backURL = "/";
      }
      next();
    },
    passport.authenticate("discord"),
  );

  app.get(
    "/callback",
    passport.authenticate("discord", { failureRedirect: "/" }),
    (req, res) => {
      if (req.session.backURL) {
        const backURL = req.session.backURL;
        req.session.backURL = null;
        res.redirect(backURL);
      } else {
        res.redirect("/");
      }
    },
  );

  app.get("/logout", function (req, res) {
    req.session.destroy(() => {
      req.logout();
      res.redirect("/");
    });
  });

  app.get("/", (req, res) => {
    renderTemplate(res, req, "index.ejs", {
      discordInvite: config.discordInvite,
    });
  });
  app.get("/dashboard", checkAuth, (req, res) => {
    const meow = { Permissions } = require('../node_modules/discord.js');
    const guild = client.guilds.cache.get(req.params.guildID);
    renderTemplate(res, req, "dashboard.ejs", { perms: meow , guild});
  });
  

  app.get('/dashboard/:guildID/embed-builder', checkAuth, async (req, res) => {
    try {
      const guildID = req.params.guildID; // Corrected variable name
  
      if (!guildID) {
        console.error(`Guild with ID ${guildID} not found.`);
        return res.status(404).send('Guild not found');
      }
  
      renderTemplate(res,req ,'embed-builder.ejs', {
        user: req.user || null,
        bot: req.client,
        guildID: guildID, 
      });
    } catch (error) {
      console.error(`Error processing /dashboard/:guildID/embed-builder: ${error.message}`);
      return res.status(500).send('Internal Server Error');
    }
  });
  const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next(); // User is authenticated, proceed to the next middleware/route handler
    } else {
      res.redirect("/login"); // User is not authenticated, redirect to the login page
    }
  };
  const TicketSettings = require('../models/TicketSettings');


  app.get("/dashboard/:guildID/customcommads", isAuthenticated, async (req, res) => {
    try {
      const guildId = req.params.guildID;
      renderTemplate(res, req, "customcommads.ejs", {
        guildID: guildId,
        message: null ,
        guild: client.guilds.cache.get(guildId),
        ticketSettings: storedTicketSettings,
        alert: null,
      });
    } catch (error) {
      console.error('Error retrieving ticket settings:', error);
      res.status(500).send('Internal Server Error (ticket settings retrieval)');
    }
  });
  app.get("/meow", async (req, res) => {
    try {
      const guildId = req.params.guildID;
      const storedTicketSettings = await TicketSettings.findOne({ guildId });
  
      renderTemplate(res, req, "t.ejs", {
        guild: client.guilds.cache.get(guildId),
        ticketSettings: storedTicketSettings,
        alert: null,
      });
    } catch (error) {
      console.error('Error retrieving ticket settings:', error);
      res.status(500).send('Internal Server Error (ticket settings retrieval)');
    }
  });
  app.post('/submit-data', (req, res) => {
    const { name, email, message } = req.body; 
  
    console.log(name, email, message);
  
    res.send('Data received successfully!');
  });
app.post('/dashboard/:guildID/set-leave-channel', async (req, res) => {
  try {
    const guildId = req.params.guildID;
    const { leaveChannelId } = req.body;

    // Update or create guild settings
    const result = await GuildSettings.findOneAndUpdate(
      { guildId },
      { $set: { leaveChannel: leaveChannelId } },
      { upsert: true, new: true, strict: false }
    );

    res.status(200).send('Leave channel set successfully');
  } catch (error) {
    console.error('Error setting leave channel:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/dashboard/:guildID/set-footer', async (req, res) => {
  try {
    const guildId = req.params.guildID;
    const { footer } = req.body;

    // Update or create guild settings
    const result = await GuildSettings.findOneAndUpdate(
      { guildId },
      { $set: { footer: footer } },
      { upsert: true, new: true, strict: false }
    );

    res.status(200).send('Leave channel set successfully');
  } catch (error) {
    console.error('Error setting leave channel:', error);
    res.status(500).send('Internal Server Error');
  }
});


  // Route handler to create a ticket
  app.post('/dashboard/:guildID/create-ticket', async (req, res) => {
    try {
      const guildId = req.params.guildID;
      const storedTicketSettings = await TicketSettings.findOne({ guildId });
  
      if (!storedTicketSettings) {
        console.error(`Ticket settings not found for guild ID ${guildId}`);
        res.status(400).send('Ticket settings not found');
        return;
      }
  
      const guild = client.guilds.cache.get(guildId);
  
      if (!guild) {
        console.error(`Guild not found for ID ${guildId}`);
        res.status(400).send('Guild not found');
        return;
      }
  
      // Check if the ticket category is configured
      if (!storedTicketSettings.ticketCategory) {
        console.error(`Ticket category not configured for guild ID ${guildId}`);
        res.status(400).send('Ticket category not configured');
        return;
      }
  
      // Create the channel under the specified category
      if (!category) {
        console.error(
          `Category not found for guild ID ${guildId} with name ${storedTicketSettings.ticketCategory}`
        );
        res.status(500).send('Internal Server Error (category not found)');
        return;
      }
      const { ChannelType } = require('discord.js');
      // Assuming you want to create a text channel
      const channel = await guild.channels.create({
        name: "'new-ticket'",
        type: ChannelType.GuildText,
        parent: category,
      });
  
      res.status(200).send(`Channel ${channel.name} created successfully`);
    } catch (error) {
      console.error('Error creating ticket:', error);
      res.status(500).send('Internal Server Error (ticket creation)');
    }
  });
  // Route handler to update the ticket category
  app.post('/dashboard/:guildID/update-ticket-category', async (req, res) => {
    try {
      const guildId = req.params.guildID;
      const { ticketCategory } = req.body;
  
      console.log('Guild ID:', guildId);
      console.log('Ticket Category:', ticketCategory);
  
      // Update the ticket category in the database (assuming TicketSettings model)
      const storedTicketSettings = await TicketSettings.findOneAndUpdate(
        { guildId },
        { $set: { ticketCategory } },
        { new: true, upsert: true }
      );
  
      res.status(200).send('Ticket category updated successfully');
    } catch (error) {
      console.error('Error handling POST request:', error);
      res.status(500).send('Internal Server Error');
    }
  });

app.post('/dashboard/:guildID/update_command', async (req, res) => {
  try {
      const guildId = req.params.guildID;
      const { trigger, content } = req.body;
      console.log('Received Body:', req.body);
      console.log('Guild ID:', guildId);
      console.log('Trigger:', trigger);
      console.log('Content:', content);

      
      // Update or insert data into MongoDB
      const result = await custom_commandsModel.findOneAndUpdate(
          { guildId },
          { $set: { trigger, content } },
          { upsert: true, new: true } // Upsert creates a new document if it doesn't exist
      );

      console.log('Result:', result);
      res.status(200).send('Ticket category updated successfully');

  } catch (error) {
      console.error('Error handling POST request:', error);
      res.status(500).send('Internal Server Error');
  }
});
  app.get("/dashboard/:guildID", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID);
    const join1 = [];
    const join2 = [];
    guild.members.cache.forEach(async (user) => {
      let x = Date.now() - user.joinedAt;
      let created = Math.floor(x / 86400000);

      if (7 > created) {
        join2.push(user.id);
      }

      if (1 > created) {
        join1.push(user.id);
      }
    });
    const now = Date.now();

   const olderJoins = join1.filter((userId) => now - message.guild.members.cache.get(userId).joinedAt <= 86400000);
    const {PermissionsBitField} = require('discord.js');
    if (!guild) return res.redirect("/dashboard");
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        await guild.members.fetch();
        member = guild.members.cache.get(req.user.id);
      } catch (err) {
        console.error(`Couldn't fetch the members of ${guild.id}: ${err}`);
      }
    }
    if (!member) return res.redirect("/dashboard");
    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return res.redirect("/dashboard");
    }

    let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    if (!storedSettings) {
      const newSettings = new GuildSettings({
        guildID: guild.id,
      });
      await newSettings.save().catch((e) => {
        console.log(e);
      });
      storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    }

    renderTemplate(res, req, "settings.ejs", {
      guild,
      settings: storedSettings,
      alert: null,
      join1: join1.length || 0,
      join2: join2.length || 0,
    });
  });

  app.post("/dashboard/:guildID", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) return res.redirect("/dashboard");
    const member = guild.members.cache.get(req.user.id);
    if (!member) return res.redirect("/dashboard");
    if (!member.permissions.has("MANAGE_GUILD")) {
      return res.redirect("/dashboard");
    }

    let storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    if (!storedSettings) {
      const newSettings = new GuildSettings({
        guildID: guild.id,
      });
      await newSettings.save().catch((e) => {
        console.log(e);
      });
      storedSettings = await GuildSettings.findOne({ guildID: guild.id });
    }

    storedSettings.prefix = req.body.prefix;
    await storedSettings.save().catch((e) => {
      console.log(e);
    });

    renderTemplate(res, req, "settings.ejs", {
      guild,
      settings: storedSettings,
      alert: "Your settings have been saved.",
    });
  });

  app.listen(config.port, null, null, () =>
    console.log(`Dashboard is up and running on port ${config.port}.`),
  );
};
