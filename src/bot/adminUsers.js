import { Markup } from "telegraf";
import { pool } from "../config/db.js";

async function listUsers(ctx) {
  if (ctx.from.id.toString() !== process.env.ADMIN_TELEGRAM_ID) {
    return ctx.reply("Bu buyruq faqat admin uchun!");
  }

  try {
    const result = await pool.query(
      "SELECT id, full_name, email, role, telegram_id FROM bots ORDER BY id DESC",
    );
    const users = result.rows;

    if (users.length === 0) {
      return ctx.reply("Bazada foydalanuvchilar yo'q.");
    }

    for (const user of users) {
      const text = `👤 **${user.full_name}**\n📧 Email: ${user.email}\n🔑 Rol: ${user.role}\n🆔 Telegram ID: ${user.telegram_id}`;

      await ctx.reply(text, {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback("✏️ Tahrirlash", `edit_user_${user.id}`),
            Markup.button.callback("❌ O'chirish", `del_user_${user.id}`),
          ],
        ]),
      });
    }
  } catch (err) {
    console.error(err);
    return ctx.reply("Foydalanuvchilarni olishda xatolik yuz berdi.");
  }
}

async function handleDeleteUser(ctx) {
  const userId = ctx.match[0].split("_")[2];
  try {
    await pool.query("DELETE FROM bots WHERE id = $1", [userId]);
    await ctx.answerCbQuery("Foydalanuvchi o'chirildi!");
    await ctx.editMessageText("❌ Bu foydalanuvchi bazadan o'chirildi.");
  } catch (err) {
    console.error(err);
    await ctx.answerCbQuery("O'chirishda xatolik!");
  }
}

const editSessions = new Map();

async function handleEditStart(ctx) {
  const userId = ctx.match[0].split("_")[2];
  editSessions.set(ctx.from.id, { userId, step: "waiting_new_name" });
  await ctx.answerCbQuery();
  return ctx.reply("Yangi ism va familiyani kiriting:");
}

async function handleEditInput(ctx) {
  const session = editSessions.get(ctx.from.id);
  if (!session) return;

  if (session.step === "waiting_new_name") {
    const newName = ctx.message.text.trim();
    try {
      await pool.query("UPDATE bots SET full_name = $1 WHERE id = $2", [
        newName,
        session.userId,
      ]);
      editSessions.delete(ctx.from.id);
      return ctx.reply("✅ Foydalanuvchi ismi muvaffaqiyatli yangilandi!");
    } catch (err) {
      console.error(err);
      editSessions.delete(ctx.from.id);
      return ctx.reply("❌ Yangilashda xatolik yuz berdi.");
    }
  }
}

export {
  listUsers,
  handleDeleteUser,
  handleEditStart,
  handleEditInput,
  editSessions,
};
