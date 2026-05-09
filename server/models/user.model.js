const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: [true, "Fullname is required"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true 
  },
  password: {
    type: String,
    select: false,
    required: function() { return !this.googleId; }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  googleId: 
  { type: String },

  avatar: { type: String,
     default: 'default-avatar.png' 
    },
    coverPhoto: {
  type: String,
  default: '' 
}
    

});



userSchema.pre('save', async function() { 
  
  if (!this.isModified('password')) return; 
  
  
  this.password = await bcrypt.hash(this.password, 10);
  
  
});

userSchema.methods.comparePassword = async function(candidate) {
  return await bcrypt.compare(candidate, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;