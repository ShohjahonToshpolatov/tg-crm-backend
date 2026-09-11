import { updateUserProfile } from "../models/userModel.js";

const profileSessions = new Map();

async function startProfile(ctx) {
  profileSessions.set(ctx.from.id, { step: "waiting_university" });
  return ctx.reply("Universitetingiz nomini kiriting:");
}

async function handleProfileText(ctx) {
  const session = profileSessions.get(ctx.from.id);
  if (!session || session.step !== "waiting_university") return;

  const university = ctx.message.text.trim();
  session.university = university;
  session.step = "waiting_photo";

  return ctx.reply("Endi profil rasmingizni (foto) yuboring:");
}

async function handleProfilePhoto(ctx) {
  const session = profileSessions.get(ctx.from.id);
  if (!session || session.step !== "waiting_photo") return;

  const photo = ctx.message.photo[ctx.message.photo.length - 1];
  const fileLink = await ctx.telegram.getFileLink(photo.file_id);

  await updateUserProfile(ctx.from.id, {
    university: session.university,
    age: null,
    photoUrl: fileLink.href,
  });

  profileSessions.delete(ctx.from.id);
  return ctx.reply("Universitet va profilingiz muvaffaqiyatli saqlandi!");
}

export { startProfile, handleProfileText, handleProfilePhoto, profileSessions };
