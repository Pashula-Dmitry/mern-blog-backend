import {validationResult} from "express-validator";
import bcrypt from "bcrypt";
import UserModel from "../models/User.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors.array());
        }
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const doc = new UserModel({
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            passwordHash: hash,
        });

        const user = await doc.save();

        const token = jwt.sign({
                _id: user._id,
            },
            'secret123',
            {
                expiresIn: '30d',
            }
        );

        const {passwordHash, ...userData} = user._doc;

        return res.json({
            ...userData,
            token,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Registration is failed',
        });
    }
};

export const login = async (req, res) => {
    try {
        const user = await UserModel.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({
                message: 'Login or password is incorrect',
            });
        }

        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);

        if (!isValidPass) {
            return res.status(400).json({
                message: 'Login or password is incorrect'
            });
        }

        const token = jwt.sign({
                _id: user._id,
            },
            'secret123',
            {
                expiresIn: '30d',
            }
        );

        const {passwordHash, ...userData} = user._doc;

        return res.json({
            ...userData,
            token,
        });



    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Login is failed',
        });
    }

};

export const getMe = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: 'User is not found',
            });
        }

        const {passwordHash, ...userData} = user._doc;

        return res.json({
            ...userData,
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Me is failed',
        });
    }
};


