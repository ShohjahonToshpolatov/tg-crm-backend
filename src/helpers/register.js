import ValidateInfo from "../validation/user.validate.js";
import { createUser } from "../config/db.js";

const sessions = new Map();

const STEPS = [
  {
    field: "fullName",
    question: "Ism va familiyangizni kiriting:",
    validate: ValidateInfo.validateFullName,
  },
  {
    field: "age",
    question: "Yoshingizni kiriting:",
    validate: ValidateInfo.validateAge,
    parse: (text) => Number(text.trim()),
  },
  {
    field: "phone",
    question: "Telefon raqamingizni kiriting:",
    validate: ValidateInfo.validatePhone,
  },
  {
    field: "email",
    question: "Emailingizni kiriting:",
    validate: ValidateInfo.validateEmail,
  },
];

function buildSummary(data) {
  return (
    `Ma'lumotlaringizni tekshiring:\n\n` +
    `Ism va familiya: ${data.fullName}\n` +
    `Yosh: ${data.age}\n` +
    `Telefon: ${data.phone}\n` +
    `Email: ${data.email}`
  );
}

async function startRegister(ctx) {
  sessions.set(ctx.from.id, { stepIndex: 0, data: {} });
  return ctx.reply(STEPS[0].question);
}

async function handleText(ctx) {
  const session = sessions.get(ctx.from.id);

  if (!session) {
    return ctx.reply("Ro'yxatdan o'tishni boshlash uchun /start yuboring");
  }

  if (session.stepIndex >= STEPS.length) {
    return ctx.reply("Tasdiqlash yoki bekor qilish tugmasini bosing");
  }

  const step = STEPS[session.stepIndex];
  const text = ctx.message.text ? ctx.message.text.trim() : "";

  const error = step.validate(text);

  if (error) return ctx.reply(error);

  session.data[step.field] = step.parse ? step.parse(text) : text;
  session.stepIndex++;

  if (session.stepIndex < STEPS.length) {
    return ctx.reply(STEPS[session.stepIndex].question);
  }

  return ctx.reply(buildSummary(session.data), {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Tasdiqlash", callback_data: "confirm" },
          { text: "Bekor qilish", callback_data: "cancel" },
        ],
      ],
    },
  });
}

async function handleConfirm(ctx) {
  const session = sessions.get(ctx.from.id);
  await ctx.answerCbQuery();

  if (!session || session.stepIndex < STEPS.length) {
    return ctx.reply("Ma'lumotlar topilmadi, /start ni boshqatdan yuboring");
  }

  try {
    await createUser({
      telegram_id: ctx.from.id,
      full_name: session.data.fullName,
      age: session.data.age,
      phone: session.data.phone,
      email: session.data.email,
      role: "user", // <-- Role aniq qilib qo'shildi
    });

    sessions.delete(ctx.from.id);
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    return ctx.reply("Ma'lumotlaringiz muvaffaqiyatli saqlandi!");
  } catch (err) {
    console.error("INSERT xatosi: ", err.message);

    if (err.code === "23505") {
      sessions.delete(ctx.from.id);
      return ctx.reply("Siz allaqachon ro'yxatdan o'tgansiz");
    }

    return ctx.reply("Ma'lumotlarni saqlashda xatolik bo'ldi");
  }
}

async function handleCancel(ctx) {
  const session = sessions.get(ctx.from.id);
  await ctx.answerCbQuery();

  sessions.delete(ctx.from.id);

  if (session) {
    try {
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    } catch (e) {}
  }

  return ctx.reply(
    "Ro'yxatdan o'tish bekor qilindi, boshqatdan boshlash uchun /start yuboring",
  );
}

export { startRegister, handleConfirm, handleCancel, handleText };
