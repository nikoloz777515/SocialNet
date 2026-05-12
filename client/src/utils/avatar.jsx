export const getAvatarUrl = (path) => {
  if (!path || path === 'default-avatar.png') {
    return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  }

  // კრიტიკული ცვლილება Cloudinary-სთვის
  if (path.startsWith('http')) {
    return path;
  }
  
  const baseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, "");
  return `${baseUrl}/uploads/profiles/${path}`;
}; 