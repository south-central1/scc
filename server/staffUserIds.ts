
export const STAFF_USER_IDS = [
  '1243269414900596787', // owner
  '1418678840838062144', // owner
  '970654818521722881', // Mr Pain
  '944316456173199441', // Murdaa
  '1378750490707230802',  // R8
  '1383396153101652079',  // Denish
  '1202626388646174723',  // Miskoo
  '1338399359481679937',  // MRtaketheRisk
];

export function isStaffUser(userId: string): boolean {
  return STAFF_USER_IDS.includes(userId);
}
