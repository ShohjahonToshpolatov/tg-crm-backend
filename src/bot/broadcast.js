import { getAllUsers } from "../models/userModel.js";

async function handleBroadcast(ctx) {
  if (ctx.from.id.toString() !== process.env.ADMIN_TELEGRAM_ID) {
    return ctx.reply("Bu buyruq faqat admin uchun!");
  }

  const text = ctx.message.text.replace("/broadcast", "").trim();
  if (!text) {
    return ctx.reply(
      "Xabar matnini kiriting. Masalan: /broadcast Salom hammaga!",
    );
  }

  try {
    const users = await getAllUsers();
    let count = 0;

    for (const user of users) {
      if (user.telegram_id) {
        try {
          await ctx.telegram.sendMessage(user.telegram_id, text);
          count++;
        } catch (e) {}
      }
    }

    return ctx.reply(`Xabar ${count} ta foydalanuvchiga yuborildi.`);
  } catch (err) {
    return ctx.reply("Xatolik yuz berdi");
  }
}

export { handleBroadcast };
