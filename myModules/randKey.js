function randKey(length, { startsWith = "", endsWith = "" }) {
  const characters =
    "abcdefghijklmnopqrstuvwxyz".toUpperCase() +
    "abcdefghijklmnopqrstuvwxyz0123456789";
  let key = "";
  for (let i = 0; i < length; i++) {
    key += characters[Math.floor(Math.random() * characters.length)];
  }
  return startsWith + key + endsWith;
}
