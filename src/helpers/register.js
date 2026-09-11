import ValidateInfo from "../validation/user.validate.js";
import { createUser } from "../models/userModel.js";
import { Markup } from "telegraf";
import { adminSessions } from "../bot/adminScene.js";

const sessions = new Map();

const STEPS = [
  {
    field: "fullName",
    question: "Ism va familyangizni kiriting:",
    validate: (text) => ValidateInfo.validateFullName(text),
  },
  {
    field: "age",
    question: "Yoshingizni kiriting:",
    validate: (text) => ValidateInfo.validateAge(text),
    parse: (text) => Number(text.trim()),
  },
  {
    field: "phone",
    question: "Telefon raqamingizni kiriting:",
    validate: (text) => ValidateInfo.validatePhone(text),
  },
  {
    field: "email",
    question: "Emailingizni kiriting:",
    validate: (text) => ValidateInfo.validateEmail(text),
  },
  {
    field: "photo",
    question: "Iltimos, o'zingizning rasmingizni yuboring:",
    isPhoto: true,
  },
];

function buildSummary(data) {
  return (
    `Ma'lumotlaringizni tekshiring:\n\n` +
    `Ism va familya: ${data.fullName}\n` +
    `Yosh: ${data.age}\n` +
    `Telefon: ${data.phone}\n` +
    `Email: ${data.email}`
  );
}

async function startRegister(ctx) {
  adminSessions.delete(ctx.from.id);
  sessions.set(ctx.from.id, { stepIndex: 0, data: {} });
  return ctx.reply(STEPS[0].question);
}

async function handleRegisterInput(ctx) {
  if (adminSessions.has(ctx.from.id)) return;

  const session = sessions.get(ctx.from.id);
  if (!session) return;

  if (session.stepIndex >= STEPS.length) {
    return ctx.reply("Tasdiqlash yoki bekor qilish tugmasini bosing");
  }

  const step = STEPS[session.stepIndex];

  if (step.isPhoto) {
    if (!ctx.message.photo) {
      return ctx.reply("Iltimos, matn emas, rasm yuboring!");
    }
    const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    session.data[step.field] = photoId;
  } else {
    const text = ctx.message.text ? ctx.message.text.trim() : "";
    const error = step.validate ? step.validate(text) : null;
    if (error) return ctx.reply(error);

    session.data[step.field] = step.parse ? step.parse(text) : text;
  }

  session.stepIndex++;

  if (session.stepIndex < STEPS.length) {
    return ctx.reply(STEPS[session.stepIndex].question);
  }

  if (session.data.photo) {
    await ctx.replyWithPhoto(session.data.photo, {
      caption: buildSummary(session.data),
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback("Tasdiqlash", "confirm"),
          Markup.button.callback("Bekor qilish", "cancel"),
        ],
      ]),
    });
    return;
  }

  return ctx.reply(
    buildSummary(session.data),
    Markup.inlineKeyboard([
      [
        Markup.button.callback("Tasdiqlash", "confirm"),
        Markup.button.callback("Bekor qilish", "cancel"),
      ],
    ]),
  );
}

async function handleConfirm(ctx) {
  const session = sessions.get(ctx.from.id);
  await ctx.answerCbQuery();

  if (!session) {
    return ctx.reply("Ma'lumotlar topilmadi, /start orqali qaytadan boshlang");
  }

  try {
    await createUser({ telegramId: ctx.from.id, ...session.data });
    sessions.delete(ctx.from.id);
    try {
      await ctx.editMessageReplyMarkup();
    } catch (e) {}
    return ctx.reply("Ma'lumotlaringiz muvaffaqiyatli saqlandi!");
  } catch (err) {
    console.error("INSERT xatosi:", err.message);
    sessions.delete(ctx.from.id);
    if (err.code === "23505") {
      return ctx.reply("Siz allaqachon ro'yxatdan o'tgansiz");
    }
    return ctx.reply("Ma'lumotlarni saqlashda xatolik yuz berdi");
  }
}

async function handleCancel(ctx) {
  sessions.delete(ctx.from.id);
  await ctx.answerCbQuery();
  try {
    await ctx.editMessageReplyMarkup();
  } catch (e) {}
  return ctx.reply(
    "Ro'yxatdan o'tish bekor qilindi. Qaytadan boshlash uchun /start yuboring.",
  );
}

export {
  startRegister,
  handleConfirm,
  handleCancel,
  handleRegisterInput,
  sessions,
};
