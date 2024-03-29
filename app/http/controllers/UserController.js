import createDebugger from "debug";
import { Role } from "../../models/role.js";
import User from "../../models/user.js";

const debug = createDebugger('express-api:users')


export class UserController {

    static async index(req, res, next) {
        const users = await User.find().sort('name');
        res.status(200).json(users);
    }

    static async store(req, res, next) {
        const user = new User({
            username: req.body.username,
            password: req.body.password,
            role: req.body.role == "productor" ? Role.PRODUCTOR : Role.USER,
            type: req.body.role == "productor" ? "productor" : "client",
            location: req.body.location
        });
        const result = await user.save();
        res.status(201).json(result);
    }

    static async show(req, res, next) {
        const user = await User.findById(req.params.id);
        res.status(200).json(user);
    }

    static async update(req, res, next) {
        const user = await User.findOneAndUpdate({ _id: req.params.id }, {
            username: req.body.username,
            location: req.body.location,
            role: req.body.role == "productor" ? Role.PRODUCTOR : Role.USER,
            type: req.body.role == "productor" ? "Productor" : "Client",
        }, { new: true });
        res.status(200).json(user);
    }


    static async destroy(req, res, next) {
        const user = await User.findOneAndDelete({ _id: req.params.id });
        res.status(204).json();
    }
}