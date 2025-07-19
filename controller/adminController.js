const adminModel = require('../model/adminModel');
const bcrypt = require('bcrypt');
const userModel = require('../model/usermodel');

const loadLogin = (req, res) => {
    res.render('admin/login');
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await adminModel.findOne({ email });

        if (!admin) return res.render('admin/login', { message: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.render('admin/login', { message: "Invalid Credentials" });

        req.session.admin = true;
        res.redirect('/admin/dashBoard');
    } catch (error) {
        res.send(error);
    }
};

const loadDashboard = async (req, res) => {
    try {
        if (!req.session.admin) return res.redirect('/admin/login');

        let query = {};
        if (req.query.search) {
            query.email = { $regex: req.query.search, $options: 'i' };
        }

        const users = await userModel.find(query);

        // Extract & clear messages from session
        const success = req.session.success;
        const error = req.session.error;
        req.session.success = null;
        req.session.error = null;

        res.render('admin/dashBoard', {
            users,
            search: req.query.search || '',
            success,
            error
        });

    } catch (err) {
        console.error(err);
        res.render('admin/dashBoard', {
            users: [],
            search: '',
            error: 'Failed to load users'
        });
    }
};



const addUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            req.session.error = 'User already exists';
            return res.redirect('/admin/dashBoard');
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = new userModel({ email, password: hashPassword });
        await newUser.save();

        req.session.success = 'User added successfully';
        res.redirect('/admin/dashBoard');
    } catch (error) {
        console.log(error);
        req.session.error = 'Failed to add user';
        res.redirect('/admin/dashBoard');
    }
};



const editUser = async (req, res) => {
    try {
        const { email, password, id } = req.body;

        const existingUser = await userModel.findOne({ email, _id: { $ne: id } });
        if (existingUser) {
            req.session.error = 'Email already used by another user';
            return res.redirect('/admin/dashBoard');
        }

        const updateData = { email };
        if (password && password.trim() !== "") {
            const hashPassword = await bcrypt.hash(password, 10);
            updateData.password = hashPassword;
        }

        await userModel.findByIdAndUpdate(id, { $set: updateData });

        req.session.success = 'User updated successfully';
        res.redirect('/admin/dashBoard');
    } catch (error) {
        console.error(error);
        req.session.error = 'Failed to update user';
        res.redirect('/admin/dashBoard');
    }
};

const deleteUser = async (req, res) => {
    try {

        const { id } = req.params;
        await userModel.findOneAndDelete({ _id: id });
        req.session.success = 'User deleted successfully';
        res.redirect('/admin/dashBoard');

    } catch (error) {

        console.log(error);
        req.session.error = 'Failed to delete user';
        res.redirect('/admin/dashBoard');
        
    }
};


const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return res.send("Error logging out");
        }
        res.redirect('/admin/login');
    });
};

module.exports = {
    loadLogin,
    login,
    loadDashboard,
    editUser,
    deleteUser,
    addUser,
    logout
};
