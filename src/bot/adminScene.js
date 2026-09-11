import axios from "axios";

const adminSessions = new Map();

async function startAdminLogin(ctx) {
  adminSessions.set(ctx.from.id, { step: "waiting_email", data: {} });
  return ctx.reply("Admin emailingizni kiriting:");
}

async function handleAdminText(ctx) {
  const session = adminSessions.get(ctx.from.id);
  if (!session) return;

  const text = ctx.message.text.trim();

  if (session.step === "waiting_email") {
    session.data.email = text;
    session.step = "waiting_password";
    return ctx.reply("Admin parolingizni kiriting:");
  }

  if (session.step === "waiting_password") {
    session.data.password = text;

    try {
      const response = await axios.post(
        `http://localhost:${process.env.PORT || 5000}/api/auth/login`,
        {
          email: session.data.email,
          password: session.data.password,
        },
      );

      adminSessions.delete(ctx.from.id);

      ctx.session = ctx.session || {};
      ctx.session.token = response.data.accessToken;

      return ctx.reply(
        "Muvaffaqiyatli kirdingiz! Admin buyruqlari: /broadcast",
      );
    } catch (err) {
      adminSessions.delete(ctx.from.id);
      const msg = err.response?.data?.message || "Xatolik yuz berdi";
      return ctx.reply(`Kirish xatosi: ${msg}`);
    }
  }
}

export { startAdminLogin, handleAdminText, adminSessions };
