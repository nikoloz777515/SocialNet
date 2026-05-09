export const getAvatarUrl = (avatarName) => {
  if (!avatarName) return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  
  
  if (avatarName.startsWith('blob:') || avatarName.startsWith('http')) return avatarName;
  
  return `http://localhost:3000/uploads/profile/${avatarName}`;
};