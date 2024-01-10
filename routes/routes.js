const express = require('express');
const router = express.Router();
const multer = require('multer')
const User = require('../models/user');
var user = {};

// image upload

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/'); 
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname); 
    }
  });

var upload = multer({ storage: storage }).single('image')

router.get("/",(req,res)=>{
    if(req.session.user ==null){
        res.render("index")
    }else{
        res.redirect("/home")
    }
})

router.get('/test', (req, res) => {
    
    res.render('professional-skills');
});

router.get("/login",(req,res)=>{
    res.render("login")
})
// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      //const passwordMatch = await bcrypt.compare(password, user.password);
      if(password== user.password){
        passwordMatch = true;
      }
      if (!passwordMatch) {
        return res.status(401).send('Invalid credentials');
      }
  
      req.session.user = user; 
      res.redirect('/home'); 
    } catch (error) {
      res.status(500).send('Error logging in');
    }
  });

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send('Error logging out');
      }
      res.redirect('/');
    });
});

router.get('/home', (req, res) => {
    const loggedInUser = req.session.user;
    let posts = [];
    let users_list = [];
    if(req.session.user ==null){
        res.redirect('/');
    }else{
        User.find({})
        .then(users => {
          if (users && users.length > 0) {
            users_list = users
            users_list.forEach(u => {
                posts_list =[]
                if(u.posts != '' && u.posts != null){
                    posts_list = u.posts
                    posts_list.forEach(p => {
                        posts.push(p)
                    })
                }
            })

            posts.sort((a, b) => b.creationDate - a.creationDate);

            console.log(posts)
            const page = parseInt(req.query.page) || 1; 
            const pageSize = 4; 
            const startIndex = (page - 1) * pageSize;
            const endIndex = page * pageSize;
            const paginatedData = posts.slice(startIndex, endIndex); 
            const totalPages = Math.ceil(posts.length / pageSize); 
            const loggedInUser = req.session.user;

            res.render("homepage",{user: loggedInUser,
                data: paginatedData,
                totalPages,
                currentPage: page
            })

          } else {
            console.log('No users found');
          }
        })
        .catch(err => {
          console.error('Error:', err);
        });
    }
});

router.get('/settings-updated', (req, res) => {
    const loggedInUser = req.session.user;
    res.render('settings-updated',{user: loggedInUser});
})

router.get('/settings-personal', (req, res) => {
    const loggedInUser = req.session.user;
    res.render('settings-personal',{user: loggedInUser});
})

router.get('/settings-experience', (req, res) => {
    const loggedInUser = req.session.user;
    res.render('settings-professional-experience',{user: loggedInUser,data: loggedInUser.jobs});
})

router.get('/settings-skills', (req, res) => {
    const loggedInUser = req.session.user;
    res.render('settings-skills',{user: loggedInUser,data: loggedInUser.skills});
})

router.get('/settings-languages', (req, res) => {
    const loggedInUser = req.session.user;
    res.render('settings-languages',{user: loggedInUser,data: loggedInUser.languages});
})

router.get('/settings-education', (req, res) => {
    const loggedInUser = req.session.user;
    res.render('settings-education',{user: loggedInUser,data: loggedInUser.degrees});
})

router.get('/settings-projects', (req, res) => {
    const loggedInUser = req.session.user;
    console.log(loggedInUser)
    res.render('settings-projects',{user: loggedInUser,data: loggedInUser.projects});
})

router.get('/settings-account', (req, res) => {
    const loggedInUser = req.session.user;
    res.render('settings-account',{user: loggedInUser});
})

router.get('/settings-profile', (req, res) => {
    const loggedInUser = req.session.user;
    res.render('settings-profile',{user: loggedInUser});
})

router.get("/register",(req,res)=>{
    res.render("user-personal-information",{user: null})
})

router.get("/all",(req,res)=>{
    if(req.session.user ==null){
        res.redirect('/');
    }else{
        User.find({})
        .then(users => {
          if (users && users.length > 0) {
            const page = parseInt(req.query.page) || 1; 
            const pageSize = 4; 
            const startIndex = (page - 1) * pageSize;
            const endIndex = page * pageSize;
    
            const paginatedData = users.slice(startIndex, endIndex); 
            const totalPages = Math.ceil(users.length / pageSize); 
            const loggedInUser = req.session.user;
            res.render("user-list",{user: loggedInUser,
                data: paginatedData,
                totalPages,
                currentPage: page
            })
          } else {
            console.log('No users found');
          }
        })
        .catch(err => {
          console.error('Error:', err);
        });
    }
    
})

router.post('/search', async (req, res) => {

    const{ keywords } = req.body
    try {
        const users = await User.find({
          $or: [
            { name: { $regex: keywords, $options: 'i' } },
            { email: { $regex: keywords, $options: 'i' } },
            { phone: { $regex: keywords, $options: 'i' } },
            { skills: { $regex: keywords, $options: 'i' } },
          ],
        });
        console.log(users);
        if (users && users.length > 0) {
            const page = parseInt(req.query.page) || 1; 
            const pageSize = 4; 
            const startIndex = (page - 1) * pageSize;
            const endIndex = page * pageSize;
    
            const paginatedData = users.slice(startIndex, endIndex); 
            const totalPages = Math.ceil(users.length / pageSize); 
    
            
            const loggedInUser = req.session.user;
            res.render("user-list",{user: loggedInUser,
                data: paginatedData,
                totalPages,
                currentPage: page
            })
          } else {
            console.log('No users found');
          }

      } catch (err) {
        res.status(500).json({ message: err.message });
      }
});
  

router.get("/profile",(req,res)=>{
    const loggedInUser = req.session.user;
    console.log(loggedInUser)

    const page = parseInt(req.query.page) || 1; 
    const pageSize = 4; 
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;

    const paginatedData = loggedInUser.posts.slice(startIndex, endIndex); 
    const totalPages = Math.ceil(loggedInUser.posts.length / pageSize);
            
    res.render("profile",{user: loggedInUser,
        data: paginatedData,
        totalPages,
        currentPage: page})
})

router.get("/:id", async(req,res)=>{
    const { id } = req.params;
    try {
        const user = await User.findById(id);

        if (!user) {
        return res.status(404).json({ message: 'User not found' });
        }

        res.render("profile",{user: user})
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
   
})

router.post('/education',upload, (req, res) => {
    const { 
    name,
    dob,
    gender,
    phone,
    address,
    email,
    password,
    bio,
    image} = req.body;

    if (!req.file) {
        console.log("no file")
    }

    user = {name,
            dob,
            gender,
            phone,
            address,
            email,
            password,
            bio,
            image}

    console.log(user)
    res.render('user-education');
});

router.post('/skills', (req, res) => {
    
    const {
        degreeName,
        school,
        city,
        country,
        startDate,
        endDate,
      } = req.body;


    if (degreeName instanceof Array) {
        
      const degreeEntities = [];

      for (let i = 0; i < degreeName.length; i++) {
        const newDegree = {
            degreeName: degreeName[i],
            school: school[i],
            city: city[i],
            country: country[i],
            startDate: startDate[i],
            endDate: endDate[i],
        };
  
        degreeEntities.push(newDegree);
      }
    
      user['degrees'] = degreeEntities
    }else{
        user['degrees'] = {
        degreeName,
        school,
        city,
        country,
        startDate,
        endDate,
        }
    }

    
    console.log(user)
    res.render('professional-skills');
});

router.post('/languages', (req, res) => {
    const skills = req.body.skill
    user['skills'] = skills
    console.log(user)
    res.render('languages');
});

router.post('/experience', (req, res) => {
    const languages = req.body.language
    user['languages'] = languages
    console.log(user)
    res.render('professional-experience');
});

router.post('/projects', (req, res) => {
    const {
        jobtitle,
        employer,
        startDate,
        endDate,
      } = req.body;

    if (jobtitle instanceof Array) {
        const jobEntities = [];
        for (let i = 0; i < jobtitle.length; i++) {
            const newJob = {
                jobtitle: jobtitle[i],
                employer: employer[i],
                startDate: startDate[i],
                endDate: endDate[i],
            };
        
            jobEntities.push(newJob);
        }
    
        user['jobs'] = jobEntities
    }else{
        user['jobs'] = {
            jobtitle,
            employer,
            startDate,
            endDate,
        }
    }

    console.log(user)
    res.render('projects');
});

router.post('/finish',upload, async (req, res) => {
    const {
        projectTitle,
        subTitle,
        startDate,
        endDate,
      } = req.body;

    if (projectTitle instanceof Array) {
        const projectEntities = [];

        for (let i = 0; i < projectTitle.length; i++) {
        const newProject = {
            projectTitle: projectTitle[i],
            subTitle: subTitle[i],
            startDate: startDate[i],
            endDate: endDate[i],
        };

        projectEntities.push(newProject);
        }
    
        user['projects'] = projectEntities
    }else{
        user['projects'] = {
            projectTitle,
            subTitle,
            startDate,
            endDate,
        }
    }
    console.log(user)

    try {
        const newUser = await User.create(user);
        console.log(newUser)
      } catch (error) {
        res.status(400).json({ message: error.message });
    }

    res.render('registration-complete');
});

// update forms

router.post('/update-projects', async (req, res) => {
    const loggedInUser = req.session.user;
    const {
        projectTitle,
        subTitle,
        startDate,
        endDate,
      } = req.body;

    if (projectTitle instanceof Array) {
        const projectEntities = [];

        for (let i = 0; i < projectTitle.length; i++) {
        const newProject = {
            projectTitle: projectTitle[i],
            subTitle: subTitle[i],
            startDate: startDate[i],
            endDate: endDate[i],
        };

        projectEntities.push(newProject);
        }
    
        loggedInUser.projects = projectEntities
    }else{
        loggedInUser.projects = {
            projectTitle,
            subTitle,
            startDate,
            endDate,
        }
    }
    
    try {
        const updatedUser = await User.findOneAndUpdate({ _id: loggedInUser._id }, loggedInUser, { new: true });

        if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
        }

        res.render('settings-updated',{user: loggedInUser});  
      } catch (err) {
        res.status(500).send('Error updating user data');
    }
});

router.post('/update-jobs', async (req, res) => {
    const loggedInUser = req.session.user;
    const {
        jobtitle,
        employer,
        startDate,
        endDate,
      } = req.body;

    if (jobtitle instanceof Array) {
        const jobEntities = [];
        for (let i = 0; i < jobtitle.length; i++) {
            const newJob = {
                jobtitle: jobtitle[i],
                employer: employer[i],
                startDate: startDate[i],
                endDate: endDate[i],
            };
        
            jobEntities.push(newJob);
        }
    
        loggedInUser.jobs = jobEntities
    }else{
        loggedInUser.jobs = {
            jobtitle,
            employer,
            startDate,
            endDate,
        }
    }

    try {
        const updatedUser = await User.findOneAndUpdate({ _id: loggedInUser._id }, loggedInUser, { new: true });

        if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
        }

        res.render('settings-updated',{user: loggedInUser}); 
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/update-education', async (req, res) => {
    const loggedInUser = req.session.user;
    const {
        degreeName,
        school,
        city,
        country,
        startDate,
        endDate,
      } = req.body;


    if (degreeName instanceof Array) {
        
      const degreeEntities = [];

      for (let i = 0; i < degreeName.length; i++) {
        const newDegree = {
            degreeName: degreeName[i],
            school: school[i],
            city: city[i],
            country: country[i],
            startDate: startDate[i],
            endDate: endDate[i],
        };
  
        degreeEntities.push(newDegree);
      }
    
      loggedInUser.degrees = degreeEntities
    }else{
        loggedInUser.degrees = {
        degreeName,
        school,
        city,
        country,
        startDate,
        endDate,
        }
    }
    try {
        const updatedUser = await User.findOneAndUpdate({ _id: loggedInUser._id }, loggedInUser, { new: true });

        if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
        }

        res.render('settings-updated',{user: loggedInUser}); 
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/update-skills', async (req, res) => {
    const loggedInUser = req.session.user;
    const skills = req.body.skill
    loggedInUser.skills = skills
    try {
        const updatedUser = await User.findOneAndUpdate({ _id: loggedInUser._id }, loggedInUser, { new: true });

        if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
        }

        res.render('settings-updated',{user: loggedInUser}); 
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/update-languages', async (req, res) => {
    const loggedInUser = req.session.user;
    const languages = req.body.language
    loggedInUser.languages = languages
    try {
        const updatedUser = await User.findOneAndUpdate({ _id: loggedInUser._id }, loggedInUser, { new: true });

        if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
        }

        res.render('settings-updated',{user: loggedInUser}); 
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/update-password', async (req, res) => {
    const { oldpassword, newpassword, confirmpassword} = req.body;

    const loggedInUser = req.session.user;

    if(oldpassword == loggedInUser.password && confirmpassword == newpassword){
        loggedInUser.password = newpassword
        try {
            const updatedUser = await User.findOneAndUpdate({ _id: loggedInUser._id }, loggedInUser, { new: true });
    
            if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
            }
    
            res.render('settings-updated',{user: loggedInUser}); 
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }else{
        console.log('incorrect password')
    }
});

router.post('/update-profile-picture',upload,async (req, res) => {
    const loggedInUser = req.session.user;

    const {image} = req.body;

    if (!req.file) {
        console.log("no file")
    }

    console.log(image)

    loggedInUser['image'] = image

    try {
        const updatedUser = await User.findOneAndUpdate({ _id: loggedInUser._id }, loggedInUser, { new: true });

        if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
        }

        res.render('settings-updated',{user: loggedInUser}); 
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/update-personal-info', async (req, res) => {
    const loggedInUser = req.session.user;
    const { 
        name,
        dob,
        gender,
        phone,
        address,
        email,
        bio} = req.body;
    
        loggedInUser.name = name;
        loggedInUser.dob = dob;
        loggedInUser.gender = gender;
        loggedInUser.phone = phone;
        loggedInUser.address = address;
        loggedInUser.email = email;
        loggedInUser.bio = bio;
        
    

        try {
            const updatedUser = await User.findOneAndUpdate({ _id: loggedInUser._id }, loggedInUser, { new: true });
    
            if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
            }
    
            res.render('settings-updated',{user: loggedInUser}); 
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
});

// posting

router.post('/add-post', async (req, res) => {
    const loggedInUser = req.session.user;
    const post = {
        "creationDate" : new Date(),
        "content":req.body.post,
        "likes":0,
        "creatorName":loggedInUser.name,
        "creatorImage":loggedInUser.image,
        "comments": []
    }

    if(loggedInUser.posts == null){
        loggedInUser['posts'] = [post]
    }else{
        loggedInUser.posts.push(post)
    }

    console.log(loggedInUser.posts)
    try {
        const updatedUser = await User.findOneAndUpdate({ _id: loggedInUser._id }, loggedInUser, { new: true });

        if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
        }

        res.redirect("/home")
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;