const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register Victim
exports.registerVictim = async (req, res) => {
    const { full_name, email, password, phone_number, address } = req.body;
    try {
        const existingUser = await prisma.victim.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.victim.create({
            data: { full_name, email, password_hash: hashedPassword, phone_number, address }
        });

        res.status(201).json({ token: generateToken(user.victim_id, 'VICTIM'), user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Register Officer (Demo purpose)
exports.registerOfficer = async (req, res) => {
    const { full_name, badge_number, email, password, rank, station_id } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const officer = await prisma.policeOfficer.create({
            data: { full_name, badge_number, email, password_hash: hashedPassword, rank, station_id: parseInt(station_id) }
        });
        res.status(201).json({ message: 'Officer registered', officer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Login
exports.login = async (req, res) => {
    const { email, password, role } = req.body; // role: 'VICTIM' or 'OFFICER'
    try {
        let user;
        if (role === 'VICTIM') {
            user = await prisma.victim.findUnique({ where: { email } });
        } else if (role === 'OFFICER') {
            user = await prisma.policeOfficer.findUnique({ where: { email } });
        }

        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const id = role === 'VICTIM' ? user.victim_id : user.officer_id;
        res.json({ token: generateToken(id, role), user, role });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
