class ValidateInfo {
  validateFullName(text) {
    const value = (text || "").trim();
    if (value.length < 3) {
      return "Ism va familya kamida 3 ta harfdan iborat bo'lishi kerak";
    }
    return null;
  }

  validateAge(text) {
    const age = Number(text);
    if (!Number.isInteger(age) || age <= 0 || age >= 130) {
      return "Yosh faqat butun son va 1-129 oralig'ida bo'lishi kerak";
    }
    return null;
  }

  validatePhone(text) {
    const phone = (text || "").trim().replace(/[\s-]/g, "");
    if (!/^(\+?998)?\d{9}$/.test(phone)) {
      return "Telefon raqam noto'g'ri. Namuna: +998901234567";
    }
    return null;
  }

  validateEmail(text) {
    const value = (text || "").trim();
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
      return "Email manzili noto'g'ri";
    }
    return null;
  }
}

export default new ValidateInfo();
