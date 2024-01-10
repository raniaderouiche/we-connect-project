const mongoose = require('mongoose');

const degreeSchema = new mongoose.Schema({
  degreeName: String,
  school: String,
  city: String,
  country: String,
  startDate: Date,
  endDate: Date
});

const jobSchema = new mongoose.Schema({
  jobtitle: String,
  employer: String,
  startDate: Date,
  endDate: Date
});

const projectSchema = new mongoose.Schema({
  projectTitle: String,
  subTitle: String,
  startDate: Date,
  endDate: Date
});

const userSchema = new mongoose.Schema({
  name: String,
  dob: Date,
  gender: String,
  phone: String,
  address: String,
  email: String,
  password: String,
  image:String,
  bio: String,
  degrees: [degreeSchema],
  skills: [String],
  languages: [String],
  jobs: [jobSchema],
  projects: [projectSchema]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
