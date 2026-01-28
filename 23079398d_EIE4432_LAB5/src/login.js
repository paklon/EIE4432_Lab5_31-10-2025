// src/login.js
import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import { validate_user, update_user, fetch_user, username_exist } from './userdb.js';

const router = express.Router(); 
const form = multer(); 

router.post('/login', form.none(), async (req, res) => {
    const { username, password } = req.body;

    const user = await validate_user(username, password);
    if (user) {
        if (!user.enabled) {
            return res.status(401).json({
                status: "failed",
                message: `User \`${username}\` is currently disabled`
            });
        } else {
            req.session.username = user.username;
            req.session.role = user.role;
            req.session.logged = true;
            return res.json({
                status: "success",
                user: {
                    username: user.username,
                    role: user.role
                }
            });
        }
    } else {
        return res.status(401).json({
            status: "failed",
            message: "Incorrect username and password"
        });
    }
});

router.post('/register', form.none(), async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            status: 'failed',
            message: 'Missing fields'
        });
    }

    if (await username_exist(username)) {
        return res.status(400).json({
            status: 'failed',
            message: `Username ${username} already exists`
        });
    }

    const success = await update_user(username, password, role);
    if (success) {
        return res.json({
            status: 'success',
            user: {
                username,
                role
            }
        });
    } else {
        return res.status(500).json({
            status: 'failed',
            message: 'Account created but unable to save into the database',
        });
    }
});

router.post('/logout', (req, res) => {
    if (req.session.logged) {
        req.session.destroy(); 
        return res.end(); 
    } else {
        return res.status(401).json({
            status: "failed",
            message: "Unauthorized"
        });
    }
});

router.get('/me', (req, res) => {
    if (req.session.logged) {
        return res.json({
            status: "success",
            user: {
                username: req.session.username,
                role: req.session.role
            }
        });
    } else {
        return res.status(401).json({
            status: "failed",
            message: "Unauthorized"
        });
    }
});

export default router;