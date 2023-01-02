import {Bot, type Context, session} from "grammy";
import * as dotenv from 'dotenv';
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";

dotenv.config();

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

const bot = new Bot<MyContext>(process.env.TELEGRAM_BOT_TOKEN);

function requestFakeApi() {
  const fakeResponse = Math.random();
  return new Promise<number>(resolve => setTimeout(() => resolve(fakeResponse), 3000));
}

async function testConversation(conversation: MyConversation, ctx: MyContext) {

  const response = await conversation.external(async () => {

    // Send a message to show the API is fetching
    const waitMessage = await ctx.reply( 'Wait…');

    // Call external API
    const result = await requestFakeApi();

    // Delete the previously sent message after API response is received
    await ctx.api.deleteMessage(waitMessage.chat.id, waitMessage.message_id);

    return result;
  });

  // Show result
  ctx.reply(response.toString());

  // Another wait terminates application as soon as update arrives
  ctx = await conversation.wait();

}

bot.use(session({initial: () => ({})}));
bot.use(conversations());
bot.use(createConversation(testConversation));

bot.command("enter", async (ctx) => {
  await ctx.reply("Entering testConversation!");
  await ctx.conversation.enter("testConversation");
});

bot.command("start", (ctx) => ctx.reply("Hi! Send /enter"));

bot.start();