import pool from "../config/db.js";

async function findUserByTelegramId(telegramId) {
  const result = await pool.query("SELECT * FROM bots WHERE telegram_id = $1", [
    telegramId,
  ]);
  return result.rows[0] || null;
}

async function findUserByEmail(email) {
  const result = await pool.query("SELECT * FROM bots WHERE email = $1", [
    email,
  ]);
  return result.rows[0] || null;
}

async function createUser(data) {
  const {
    telegram_id = null,
    full_name,
    age = null,
    phone = null,
    email = null,
    university = null,
    password = null,
    role = "user",
    photo_url = null,
  } = data;

  const result = await pool.query(
    `INSERT INTO bots (telegram_id, full_name, age, phone, email, university, password, role, photo_url) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
     RETURNING *`,
    [
      telegram_id,
      full_name,
      age,
      phone,
      email,
      university,
      password,
      role,
      photo_url,
    ],
  );
  return result.rows[0];
}

async function updateUserProfile(telegramId, { university, age, photoUrl }) {
  const user = await findUserByTelegramId(telegramId);
  if (!user) return null;

  const updatedUniversity =
    university !== undefined ? university : user.university;
  const updatedAge = age !== undefined ? age : user.age;
  const updatedPhotoUrl = photoUrl !== undefined ? photoUrl : user.photo_url;

  const result = await pool.query(
    `UPDATE bots 
     SET university = $1, age = $2, photo_url = $3 
     WHERE telegram_id = $4 
     RETURNING *`,
    [updatedUniversity, updatedAge, updatedPhotoUrl, telegramId],
  );

  return result.rows[0] || null;
}

async function getAllUsers() {
  const result = await pool.query("SELECT * FROM bots ORDER BY id DESC");
  return result.rows;
}

async function updateUserRole(userId, role) {
  const result = await pool.query(
    `UPDATE bots SET role = $1 WHERE id = $2 RETURNING *`,
    [role, userId],
  );
  return result.rows[0] || null;
}

async function deleteUser(userId) {
  const result = await pool.query(
    `DELETE FROM bots WHERE id = $1 RETURNING *`,
    [userId],
  );
  return result.rows[0] || null;
}

async function closePool() {
  await pool.end();
}

export {
  findUserByTelegramId,
  findUserByEmail,
  createUser,
  updateUserProfile,
  getAllUsers,
  updateUserRole,
  deleteUser,
  closePool,
};
