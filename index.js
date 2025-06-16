require('dotenv').config();
console.log("DISCORD_TOKEN loaded:", process.env.DISCORD_TOKEN ? "✅ YES" : "❌ NO");
const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const fetch = require('node-fetch');
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GOOGLE_VISION_API_KEY = process.env.GOOGLE_VISION_API_KEY;
const file = new AttachmentBuilder('/Users/noahkurzenberger/Desktop/ucankissmywhat.png');
const emojiList = require('emoji.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`BODHI is online! Logged in as ${client.user.tag}`);
});

async function detectLabels(imageUrl) {
  const body = {
    requests: [{
      image: { source: { imageUri: imageUrl } },
      features: [{ type: 'LABEL_DETECTION', maxResults: 5 }]
    }]
  };

  const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Vision API error: ${res.statusText}`);

  const data = await res.json();
  return data.responses[0].labelAnnotations || [];
}

async function handlePing(message) {
  if (message.content.toLowerCase() === 'ping') {
    await message.channel.send('pong');
    return true;
  }
  return false;
}

async function handleCat(message) {
  if (message.content.toLowerCase() === '-cat') {
    try {
      const res = await fetch('https://www.reddit.com/r/cats/top.json?limit=50&t=week');
      const data = await res.json();

      // Filter posts that have image previews
      const posts = data.data.children.filter(post => {
        const url = post.data.url || '';
        // Basic check for image URL endings
        return url.match(/\.(jpg|jpeg|png|gif)$/i);
      });

      if (posts.length === 0) {
        await message.channel.send("i can't find any cars");
        return true;
      }

      // Pick a random post from filtered list
      const randomPost = posts[Math.floor(Math.random() * posts.length)];
      const imageUrl = randomPost.data.url;

      // Send the image URL
      await message.channel.send(imageUrl);
    } catch (error) {
      console.error('Error fetching cats from Reddit:', error);
      await message.channel.send('bodhi can/t fetch any cats.. :/(');
    }
    return true;
  }
  return false;
}
async function handleBunny(message) {
  if (message.content.toLowerCase().includes('bunny')) {
    try {
      const res = await fetch('https://www.reddit.com/r/rabbits/top.json?limit=50&t=week');
      const json = await res.json();
      const posts = json.data.children;

      // Filter posts that have image URLs ending with jpg/png/gif
      const images = posts
        .map(post => post.data.url)
        .filter(url => url.match(/\.(jpg|jpeg|png|gif)$/i));

      if (images.length === 0) {
        await message.channel.send("bodhi can/t find any bunnies");
        return true;
      }

      // Pick a random image
      const randomImage = images[Math.floor(Math.random() * images.length)];

      await message.channel.send(randomImage);
    } catch (error) {
      console.error('Error fetching bunny from Reddit:', error);
      await message.channel.send('NOAH CODE FAIL');
    }
    return true;
  }
  return false;
}


async function handleTriggerWords(message) {
  const triggers = ['gay', 'sex', 'goon'];
  if (triggers.some(w => message.content.toLowerCase().includes(w))) {
    await message.channel.send({ files: [file] });
    return true;
  }
  return false;
}

async function handleBunnyReaction(message) {
  if (message.attachments.size === 0) return false;
  for (const attachment of message.attachments.values()) {
    try {
      const labels = await detectLabels(attachment.url);
      const names = labels.map(l => l.description.toLowerCase());
      if (names.some(n => ['bunny', 'rabbit'].includes(n))) {
        await message.react('⭐');
        return true;
      }
    } catch (e) {
      console.error('Label detection error:', e);
    }
  }
  return false;
}

async function handleBodhiMention(message) {
  if (message.content.toLowerCase().includes('bodhi')) {
    const responses = [
      "No",
      "Hi",
      "Meow",
      "216.222.229.234",
      "Moo",
      "Bark"
    ];
    const randomIndex = Math.floor(Math.random() * responses.length);
    const reply = responses[randomIndex];
    console.log(`Random Index: ${randomIndex}, Reply: ${reply}`);
    await message.channel.send(reply);
    return true;
  }
  return false;
}

async function kissMyButt(message) {
  if (Math.random() < 0.0001) {
    await message.channel.send({ files: [file] });
    return true;
  }
  return false;
}

async function handleEmojiReact(message) {
  if (message.content.toLowerCase().includes("emoji")) {
    const unicodeEmojis = emojiList.map(e => e.char);
    const customEmojis = message.client.emojis.cache.map(e => e.toString());
    const allEmojis = [...unicodeEmojis, ...customEmojis];
    const randomEmoji = allEmojis[Math.floor(Math.random() * allEmojis.length)];

    try {
      await message.react(randomEmoji);
    } catch (err) {
      console.error(`Could not react with ${randomEmoji}:`, err.message);
    }

    return true;
  }
  return false;
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  console.log(`${message.author.tag}: ${message.content}`);

  if (
    await handlePing(message) ||
    await handleCat(message) ||
    await handleTriggerWords(message) ||
    await handleBunnyReaction(message) ||
    await kissMyButt(message) ||
    await handleBodhiMention(message) ||
    await handleEmojiReact(message) ||
    await handleBunny(message)
  ) return;
});

client.login(DISCORD_TOKEN).catch(console.error);