
export const STAFF_USER_IDS = [
  '1243269414900596787', // owner
  '1418678840838062144', // owner
  '970654818521722881', // Mr Pain
  '944316456173199441', // Murdaa
    '1202626388646174723', // misko
    '1378750490707230802', //casper
    '1338399359481679937', //  Chapo
    '1259274692406284339',  // Arbaba
];

export function isStaffUser(userId: string): boolean {
  return STAFF_USER_IDS.includes(userId);
}
