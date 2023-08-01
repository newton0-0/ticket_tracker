require('dotenv').config();
const User = require('../models/User');
const Admin = require('../models/admin');
const Complaint = require('../models/complaint');
const {requireAuth, checkUser} = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const Appeal = require('../models/appeal');

//handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '' };

    //incorrect email
    if(err.message === 'Incorrect email') {
        errors.email = 'Email not registered';
    }  
    
    //incorrect email
    if(err.message === 'Password Incorrect') {
        errors.password = 'incorrect password';
    }  

    //unique check
    if(err.code === 11000) {
        errors.email = 'that email already exists';
        return errors;
    }

    //validation errors
    if (err.message.includes('user validation failed')) {
    Object.values(err.errors).forEach(({ properties }) => {
        errors[properties.path] = properties.message;
        });
    }

    return errors;
}

const  maxAge = 3*24*60*60;

const createToken = (id) => {
    return jwt.sign({ id }, process.env.code, { expiresIn: maxAge });
}

module.exports.signup_get = (req, res) => {
    res.render('signup');
}

module.exports.login_get = (req, res) => {
    console.log(req);
    res.render('login');
}

module.exports.signup_post = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.create({ email, password });
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge *1000 });
        res.status(201).json({ user: user._id });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge*1000});
        res.status(201).json({ user: user._id });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

module.exports.logout_get = async (req, res) => {
    res.cookie('jwt', '', {maxAge: 1});
    res.redirect('/');
}

module.exports.msg_get = async (req, res) => {
    res.render('msg');
}

module.exports.stud_get = async (req, res) => {
    res.render('stud');
}

module.exports.stud_post = async (req, res) => {
  const token = req.cookies.jwt;
  if (!token) {
    res.redirect('/login');
  } else {
    try {
      const decodedToken = jwt.verify(token, process.env.code);
      let user = await User.findById(decodedToken.id);

      // Handle the case where the user is not found
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const userEmail = user.email;

      const ticket  = new Appeal({
        title: req.body.title,
        message: req.body.message,
        student: userEmail,
      });

      await ticket.save();

      res.status(201).json({ appeal_number: ticket._id });
    } catch (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
            // Duplicate key error
            console.error('Duplicate key error:', err.message);
            res.status(400).json({ message: 'Title must be unique' });
      } else {
            console.error('Error:', err.message);
            res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
};

module.exports.stud_get = async (req, res) => {
    const token = req.cookies.jwt;
    if(token) {
        const decodedToken = jwt.verify(token, process.env.code);
        let user = await User.findById(decodedToken.id);
        if(user) {
            res.render('stud');
        }
        else {
            res.redirect('/dashboard');
        }
    }
    else {
        res.redirect('login');
    }
}

module.exports.admin_get = async (req, res) => {
    const token = req.cookies.jwt;
    if(token) {
        const decodedToken = jwt.verify(token, process.env.code);
        const user = await Admin.findById({ _id: decodedToken.id})
        if(user) {
            res.redirect('/dashboard');
        }
        else {
            res.redirect('/complaints')
        }
    }
    else {
        res.render('admin-login');
    }
}

module.exports.admin_post = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await Admin.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge*1000});
        res.status(201).json({ user: user._id });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

module.exports.dashboard_get = async (req,res) => {
try {
    const locals = {
        title: "Dashboard",
        description: "Admin dashboard"
    }
    let perPage = 6;
    let page = req.query.page || 1;

    const data = await Appeal.aggregate([ {$sort: { createdAt: -1}} ])
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec();

    const count = await Appeal.count();
    const nextPage = parseInt(page) + 1;
    const lastPage = parseInt(page) - 1;
    const hasNextPage = nextPage <= Math.ceil( count / perPage);
    const hasLastPage = lastPage >= Math.ceil( 1 );

    res.render('dashboard', { 
        page,
        locals, 
        data,
        current: page,
        nextPage: hasNextPage ? nextPage : null,
        lastPage: hasLastPage ? lastPage : null,
        currentRoute: '/'
     } );
} catch (error) {
    console.log(error)
}
};

module.exports.one_get = async (req, res) => {
    const token = req.cookies.jwt;
    var pro = "student";

    try {
        if (token) {
            const decodedToken = jwt.verify(token, process.env.code);
            let user = await Admin.findById(decodedToken.id);
            if(user) {
                pro = "admin";
            }
        }
        else {
            res.redirect('/');
        }

        let slug = req.params.id;
        const post = await Appeal.findById({ _id: slug});
        

        const locals = {
            title: post.title,
            currentRoute: '/one'
        }
        res.render('one', {
            locals,
            pro,
            post
        });
    } catch (error) {
        console.log(error);
    }
};

module.exports.appeal_post = async (req, res) => {
    const appeal_id = req.params.id;
    const post = await Appeal.findById({ _id: appeal_id });
    const token = req.cookies.jwt;
    const decodedToken = jwt.verify(token, process.env.code);
    const mentor = await Admin.findById(decodedToken.id);

    const { remark, stage } = req.body;

    try {
        const final = await Complaint.create({
            title: post.title,
            message: post.message,
            student: post.student,
            mentor: mentor,
            remark: remark,
            stage: stage,
            appeal_id: post.id
        });
        await Appeal.deleteOne({_id: appeal_id});
        return res.redirect(301,`${req.baseUrl}/dashboard`);
        } catch (error) {
        res.status(400).json({ error });
    }
};


module.exports.complaint_get = async (req, res) => {
    try {
        const locals = {
            title: "Complaints",
            description: "Complaints dashboard"
        }
        let perPage = 6;
        let page = req.query.page || 1;

        const data = await Complaint.aggregate([ {$sort: { createdAt: -1}} ])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();

        const count = await Complaint.count();
        const nextPage = parseInt(page) + 1;
        const lastPage = parseInt(page) - 1;
        const hasNextPage = nextPage <= Math.ceil( count / perPage);
        const hasLastPage = lastPage >= Math.ceil( 1 );

        res.render('complaints', { 
            page,
            locals, 
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
            lastPage: hasLastPage ? lastPage : null,
            currentRoute: '/'
        } );
    } catch (error) {
        console.log(error)
    }    
};

module.exports.getOneComplaint = async (req, res) => {
    let pro = "student";
    const token = req.cookies.jwt;
    if(token) {
        const decodedToken = jwt.verify(token, process.env.code);
        const user = await Admin.findById(decodedToken.id);
        if(user) {
            pro = "admin"
        }
    }

    try {
        let slug = req.params.id;
        const post = await Complaint.findById({ _id: slug});

        const locals = {
            title: post.title,
            currentRoute: '/complaint'
        }
        res.render('complaint-one', {
            locals,
            pro,
            post
        });
    } catch (error) {
        console.log(error);
    }
};

module.exports.putOneComplaint = async (req, res) => {
    try {
        await Complaint.findByIdAndUpdate(req.params.id, {
            stage : req.body.stage,
            remark : req.body.remark,
            updatedAt: Date.now()
        });
        res.redirect('/complaints');
    } catch (error) {
        console.log(error);
    }
};

module.exports.deleteOneComplaint = async (req, res) => {
    try {
        await Complaint.deleteOne( { _id: req.params.id } );
        res.redirect('/complaints');
    } catch (error) {
        console.log(error);
    }
};