import { createUser } from "../models/userModel.js";
import { adminSessions } from "./adminScene.js";

const adminAddUserSessions = new Map();

const STEPS = [
  {
    field: "fullName",
    question: "➕ Yangi foydalanuvchi ism va familiyasini kiriting:",
  },
  {
    field: "age",
    question: "Yoshingizni kiriting:",
    parse: (t) => Number(t.trim()),
  },
  { field: "phone", question: "Telefon raqamini kiriting:" },
  { field: "email", question: "Email manzilini kiriting:" },
];

async function startAdminAddUser(ctx) {
  if (ctx.from.id.toString() !== process.env.ADMIN_TELEGRAM_ID) {
    return ctx.reply("Bu buyruq faqat admin uchun!");
  }

  adminAddUserSessions.set(ctx.from.id, { stepIndex: 0, data: {} });
  return ctx.reply(STEPS[0].question);
}

async function handleAdminAddUserText(ctx) {
  const session = adminAddUserSessions.get(ctx.from.id);
  if (!session) return;

  const step = STEPS[session.stepIndex];
  const text = ctx.message.text ? ctx.message.text.trim() : "";

  session.data[step.field] = step.parse ? step.parse(text) : text;
  session.stepIndex++;

  if (session.stepIndex < STEPS.length) {
    return ctx.reply(STEPS[session.stepIndex].question);
  }

  try {
    const fakeTelegramId = Date.now();
    await createUser({
      telegramId: fakeTelegramId,
      fullName: session.data.fullName,
      age: session.data.age,
      phone: session.data.phone,
      email: session.data.email,
    });

    adminAddUserSessions.delete(ctx.from.id);
    return ctx.reply("✅ Yangi foydalanuvchi muvaffaqiyatli qo'shildi!");
  } catch (err) {
    console.error(err);
    adminAddUserSessions.delete(ctx.from.id);
    return ctx.reply(
      "❌ Xatolik yuz berdi (email takrorlanayotgan bo'lishi mumkin).",
    );
  }
}

export { startAdminAddUser, handleAdminAddUserText, adminAddUserSessions };
