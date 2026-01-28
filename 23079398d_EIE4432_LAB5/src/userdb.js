import fs from 'fs/promises';
import client from './dbclient.js';

async function init_db() {
    try {
        const users = client.db('lab5db').collection('users');
        
        const count = await users.countDocuments();
        if (count === 0) {
            const data = await fs.readFile('users.json', 'utf-8');
            const usersData = JSON.parse(data);
            const result = await users.insertMany(usersData);
            console.log(`Added ${result.insertedCount} users`);
        } 
    } catch (err) {
        console.error('Unable to initialize the database!', err);
        process.exit(1);
    }
}

async function validate_user(username, password) {
    if (!username || !password) return false;

    const users = client.db('lab5db').collection('users');
    
    try {
        const user = await users.findOne({ username, password });
        if (user) {
            return user; // Return user information if found
        } else {
            return false; // Return false if no user found or password mismatch
        }
    } catch (err) {
        console.error('Unable to fetch from database!', err);
        return false;
    }
}

async function update_user(username, password, role, enabled) {
    const users = client.db('lab5db').collection('users');

    try {
        const result = await users.updateOne(
            { username },
            { 
                $set: { 
                    password,
                    role,
                    enabled 
                } 
            },
            { upsert: true }
        );

        if (result.upsertedCount > 0) {
            console.log(`Added 1 user`);
            return true; 
        } else {
            console.log(`Added 0 user`);
            return true; 
        }
    } catch (err) {
        console.error('Unable to update the database!', err);
        return false; 
    }
}

async function fetch_user(username) {
    const users = client.db('lab5db').collection('users');

    try {
        const user = await users.findOne({ username });
        return user; 
    } catch (err) {
        console.error('Unable to fetch from database!', err);
    }
}

async function username_exist(username) {
    try {
        const user = await fetch_user(username);
        return user !== null; 
    } catch (err) {
        console.error('Unable to fetch from database!', err);
        return false;
    }
}

export {
    validate_user,
    update_user,
    fetch_user,
    username_exist,
};