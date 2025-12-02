
export const STAFF_USER_IDS = [
  '1243269414900596787', // owner
  '1418678840838062144', // owner
  '970654818521722881', // Mr Pain
  '944316456173199441', // Murdaa
];

export function isStaffUser(userId: string): boolean {
  return STAFF_USER_IDS.includes(userId);
}
