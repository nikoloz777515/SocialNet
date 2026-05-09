const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    let folder = 'others';

   
    if (file.fieldname === 'profile') {
      folder = 'profile';
    } else if (file.fieldname === 'cover') {
      folder = 'covers';
    } else if (file.fieldname === 'postImage') {
      folder = 'posts';
    } else if (file.fieldname === 'messageImage') {
      folder = 'messages';
    }

  
    const dir = path.join(process.cwd(), 'uploads', folder);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },

  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});


const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('მხოლოდ სურათების ატვირთვაა დაშვებული!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024 
  }
});

module.exports = upload;