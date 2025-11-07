export default defineEventHandler(async (event) => {
  return randomTokenHex(16);
})
