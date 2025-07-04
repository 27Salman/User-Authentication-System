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

        const users = await userModel.find({});
        const { success, error } = req.query;

        res.render('admin/dashBoard', { users, success, error });
    } catch (error) {
        console.log(error);
        res.render('admin/dashBoard', { users: [], error: 'Failed to load users' });
    }
};

const addUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = new userModel({ email, password: hashPassword });
        await newUser.save();

        res.redirect('/admin/dashBoard?success=User added successfully');
    } catch (error) {
        console.log(error);
        res.redirect('/admin/dashBoard?error=Failed to add user');
    }
};

const editUser = async (req, res) => {
    try {
        const { email, password, id } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);

        await userModel.findOneAndUpdate(
            { _id: id },
            { $set: { email, password: hashPassword } }
        );

        res.redirect('/admin/dashBoard?success=User updated successfully');
    } catch (error) {
        console.log(error);
        res.redirect('/admin/dashBoard?error=Failed to update user');
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await userModel.findOneAndDelete({ _id: id });

        res.redirect('/admin/dashBoard?success=User deleted successfully');
    } catch (error) {
        console.log(error);
        res.redirect('/admin/dashBoard?error=Failed to delete user');
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
