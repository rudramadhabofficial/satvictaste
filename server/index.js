require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 4000;

const membershipPlanSchema = new mongoose.Schema({
  restaurantId: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  durationDays: { type: Number, required: true },
  type: { type: String, enum: ['daily_meal', 'subscription', 'on_table_qr'], default: 'subscription' },
  mealType: { type: String, enum: ['lunch', 'dinner', 'both', 'none'], default: 'none' },
  benefits: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

const userSubscriptionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  restaurantId: { type: String, required: true },
  planId: { type: String, required: true },
  planType: { type: String, enum: ['weekly', 'monthly', 'trial'], default: 'monthly' },
  mealPlan: { type: String, enum: ['veg_thali', 'satvik_diet', 'jain_special'], default: 'veg_thali' },
  deliveryDays: [String], // e.g., ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  status: { type: String, enum: ['active', 'expired', 'pending_payment'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  remainingMeals: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

const usageLogSchema = new mongoose.Schema({
  subscriptionId: { type: String, required: true },
  userId: { type: String, required: true },
  restaurantId: { type: String, required: true },
  type: { type: String, enum: ['meal_redeem', 'on_table_checkin'], required: true },
  timestamp: { type: Date, default: Date.now },
});

const bookingSchema = new mongoose.Schema({
  restaurantId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String },
  date: { type: String, required: true },
  time: { type: String, required: true },
  people: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema({
  restaurantId: { type: String, required: true },
  userId: { type: String, required: true },
  items: [{ name: String, price: Number, quantity: Number }],
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  status: { 
    type: String, 
    enum: ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'PICKED', 'DELIVERED', 'CANCELLED'], 
    default: 'PLACED' 
  },
  deliveryPartnerId: { type: String },
  deliveryAddress: { type: String },
  createdAt: { type: Date, default: Date.now },
  acceptedAt: { type: Date },
  readyAt: { type: Date },
  pickedAt: { type: Date },
  deliveredAt: { type: Date },
});

const deliveryPartnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  phone: { type: String },
  city: { type: String },
  verified: { type: Boolean, default: false },
  status: { type: String, enum: ['available', 'busy', 'offline'], default: 'offline' },
  createdAt: { type: Date, default: Date.now },
});

const deliverySchema = new mongoose.Schema({
  restaurantId: { type: String, required: true },
  userId: { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'assigned', 'picked', 'done', 'escalated'], default: 'pending' },
  deliveryPartnerId: { type: String },
  pickupTime: { type: Date },
  deliveryTime: { type: Date },
  createdAt: { type: Date, default: Date.now },
  doneAt: { type: Date },
  escalatedAt: { type: Date },
});

const restaurantSchema = new mongoose.Schema({
  name: String,
  address: String,
  city: String,
  area: String,
  latitude: Number,
  longitude: Number,
  phone: String,
  whatsapp: String,
  coverImage: String,
  verified: { type: Boolean, default: false },
  satvikType: { type: String, enum: ['Pure Satvik', 'No Onion/Garlic', 'Jain Friendly'] },
  priceRange: { type: String, enum: ['$', '$$', '$$$'] },
  menu: [{ name: String, description: String, price: Number }],
  story: String,
  bestTimeToVisit: String,
});

const partnerSubmissionSchema = new mongoose.Schema({
  profile: { type: Object, required: true },
  menuItems: { type: Array, default: [] },
  offers: { type: Array, default: [] },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const PartnerSubmission =
  mongoose.models.PartnerSubmission || mongoose.model('PartnerSubmission', partnerSubmissionSchema);
const inMemorySubmissions = [];

const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);
const MembershipPlan = mongoose.models.MembershipPlan || mongoose.model('MembershipPlan', membershipPlanSchema);
const UserSubscription = mongoose.models.UserSubscription || mongoose.model('UserSubscription', userSubscriptionSchema);
const UsageLog = mongoose.models.UsageLog || mongoose.model('UsageLog', usageLogSchema);
const Delivery = mongoose.models.Delivery || mongoose.model('Delivery', deliverySchema);
const DeliveryPartner = mongoose.models.DeliveryPartner || mongoose.model('DeliveryPartner', deliveryPartnerSchema);
const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

const inMemoryPlans = [];
const inMemorySubs = [];
const inMemoryDeliveries = [];
const inMemoryIssues = [];
const inMemoryUsers = [];
const inMemoryVerifications = [];
const inMemoryDeliveryPartners = [];
const inMemoryBookings = [];
const inMemoryOrders = [];

function hashPassword(pw) {
  return crypto.createHash('sha256').update(String(pw)).digest('hex');
}
function signJwt(payload, expires = '7d') {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  return jwt.sign(payload, secret, { expiresIn: expires });
}
function verifyJwt(token) {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  return jwt.verify(token, secret);
}
function userAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = verifyJwt(token);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
function adminAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = verifyJwt(token);
    if (!decoded || decoded.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

function deliveryPartnerAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = verifyJwt(token);
    if (!decoded || decoded.role !== 'delivery') return res.status(403).json({ error: 'Forbidden' });
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@satvictaste.com';

async function maybeSendEmail(to, subject, text, html) {
  try {
    if (!process.env.ZOHO_CLIENT_ID) {
      console.log('[NOTIFICATION] to:', to, '| subject:', subject, '| text:', text);
      return;
    }
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: process.env.ZOHO_MAIL_FROM || 'noreply@satvictaste.com',
        clientId: process.env.ZOHO_CLIENT_ID,
        clientSecret: process.env.ZOHO_CLIENT_SECRET,
        refreshToken: process.env.ZOHO_REFRESH_TOKEN,
      },
    });
    await transporter.sendMail({
      from: process.env.ZOHO_MAIL_FROM || 'noreply@satvictaste.com',
      to,
      subject,
      text,
      html,
    });
  } catch (e) {
    console.warn('Email send failed:', e.message);
  }
}

async function notifyUser(userId, subject, text) {
  // In a real app, we'd find the user's email/phone/token
  // For now, we'll try to find the email from inMemoryUsers or just log it
  const user = inMemoryUsers.find(u => u.id === userId);
  const email = user ? user.email : `user-${userId}@satvic.local`;
  await maybeSendEmail(email, subject, text);
}

async function notifyRestaurant(restaurantId, subject, text) {
  // In a real app, find the restaurant owner's email
  await maybeSendEmail(`restaurant-${restaurantId}@satvic.local`, subject, text);
}

async function notifyDeliveryPartner(dpId, subject, text) {
  // In a real app, find the delivery partner's email/token
  let dp;
  if (mongoose.connection.readyState === 1 && MONGO_URI) {
    dp = await mongoose.model('DeliveryPartner').findById(dpId);
  } else {
    dp = inMemoryDeliveryPartners.find(x => x.id === dpId);
  }
  const email = dp ? dp.email : `dp-${dpId}@satvic.local`;
  await maybeSendEmail(email, subject, text);
}

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, name, password } = req.body || {};
    if (!email || !password || !name) return res.status(400).json({ error: 'name, email, password required' });
    if (inMemoryUsers.find((u) => u.email.toLowerCase() === String(email).toLowerCase())) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const id = String(Date.now());
    const user = { id, email, name, passwordHash: hashPassword(password), verified: false };
    inMemoryUsers.push(user);
    const token = String(Math.floor(1000 + Math.random() * 9000));
    inMemoryVerifications.push({ email, token, createdAt: new Date() });
    
    const html = `
      <div style="font-family: 'Fraunces', Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #FAF9F6; border-radius: 20px;">
        <h1 style="color: #161B18; font-size: 28px; text-align: center; margin-bottom: 24px;">Welcome to Satvic</h1>
        <p style="color: #5A655E; font-size: 16px; line-height: 1.6; text-align: center;">
          To begin your journey towards calm and clean discovery, please verify your email with the code below:
        </p>
        <div style="background: #FFFFFF; border: 1px solid rgba(44, 51, 46, 0.06); border-radius: 14px; padding: 32px; margin: 32px 0; text-align: center;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #5F8B6E;">${token}</span>
        </div>
        <p style="color: #7D8781; font-size: 14px; text-align: center;">
          This code will expire in 10 minutes. If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `;

    await maybeSendEmail(email, 'Verify your Satvic account', `Your verification code is ${token}`, html);
    res.status(201).json({ id, email, requiresVerification: true });
  } catch (e) {
    console.error('Signup error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/verify', (req, res) => {
  try {
    const { email, token } = req.body || {};
    const v = inMemoryVerifications.find((x) => x.email.toLowerCase() === String(email).toLowerCase() && x.token === token);
    if (!v) return res.status(400).json({ error: 'Invalid code' });
    const u = inMemoryUsers.find((x) => x.email.toLowerCase() === String(email).toLowerCase());
    if (!u) return res.status(404).json({ error: 'User not found' });
    u.verified = true;
    res.json({ verified: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    const u = inMemoryUsers.find((x) => x.email.toLowerCase() === String(email).toLowerCase());
    if (!u) return res.status(401).json({ error: 'Invalid credentials' });
    if (u.passwordHash !== hashPassword(password)) return res.status(401).json({ error: 'Invalid credentials' });
    if (!u.verified) {
      // Re-send verification code if not verified
      const token = String(Math.floor(1000 + Math.random() * 9000));
      // Remove old token for this email if exists
      const oldIdx = inMemoryVerifications.findIndex(v => v.email.toLowerCase() === u.email.toLowerCase());
      if (oldIdx !== -1) inMemoryVerifications.splice(oldIdx, 1);
      
      inMemoryVerifications.push({ email: u.email, token, createdAt: new Date() });
      
      const html = `
        <div style="font-family: 'Fraunces', Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #FAF9F6; border-radius: 20px;">
          <h1 style="color: #161B18; font-size: 28px; text-align: center; margin-bottom: 24px;">Complete your Verification</h1>
          <p style="color: #5A655E; font-size: 16px; line-height: 1.6; text-align: center;">
            You recently tried to login but your email hasn't been verified yet. Please use the code below to complete your registration:
          </p>
          <div style="background: #FFFFFF; border: 1px solid rgba(44, 51, 46, 0.06); border-radius: 14px; padding: 32px; margin: 32px 0; text-align: center;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #5F8B6E;">${token}</span>
          </div>
        </div>
      `;
      maybeSendEmail(u.email, 'Satvic verification code', `Your verification code is ${token}`, html);
      return res.status(403).json({ error: 'Email not verified' });
    }
    res.json({ token: signJwt({ sub: u.id, email: u.email, role: 'user' }), id: u.id, email: u.email, name: u.name });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', userAuth, (req, res) => {
  const u = inMemoryUsers.find((x) => x.id === req.user.sub);
  if (!u) return res.status(404).json({ error: 'Not found' });
  res.json({ id: u.id, email: u.email, name: u.name, verified: u.verified, partnerId: u.partnerId || null });
});

// Delivery Partner Auth
app.post('/api/delivery-auth/signup', async (req, res) => {
  try {
    const { email, name, password, phone, city } = req.body || {};
    if (!email || !password || !name) return res.status(400).json({ error: 'name, email, password required' });
    
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const existing = await DeliveryPartner.findOne({ email: email.toLowerCase() });
      if (existing) return res.status(400).json({ error: 'Email already registered' });
      const dp = await DeliveryPartner.create({
        name,
        email: email.toLowerCase(),
        passwordHash: hashPassword(password),
        phone,
        city,
        verified: true // Auto verify for now to simplify
      });
      return res.status(201).json({ id: String(dp._id), email: dp.email });
    }
    
    if (inMemoryDeliveryPartners.find((u) => u.email.toLowerCase() === String(email).toLowerCase())) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const id = String(Date.now());
    const dp = { id, email, name, passwordHash: hashPassword(password), phone, city, verified: true };
    inMemoryDeliveryPartners.push(dp);
    res.status(201).json({ id, email });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/delivery-auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    let dp;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      dp = await DeliveryPartner.findOne({ email: email.toLowerCase() });
    } else {
      dp = inMemoryDeliveryPartners.find((x) => x.email.toLowerCase() === String(email).toLowerCase());
    }

    if (!dp) return res.status(401).json({ error: 'Invalid credentials' });
    if (dp.passwordHash !== hashPassword(password)) return res.status(401).json({ error: 'Invalid credentials' });
    
    const id = dp._id ? String(dp._id) : dp.id;
    res.json({ 
      token: signJwt({ sub: id, email: dp.email, role: 'delivery' }), 
      id, 
      email: dp.email, 
      name: dp.name 
    });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/delivery-auth/me', deliveryPartnerAuth, async (req, res) => {
  try {
    let dp;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      dp = await DeliveryPartner.findById(req.user.sub);
    } else {
      dp = inMemoryDeliveryPartners.find((x) => x.id === req.user.sub);
    }
    if (!dp) return res.status(404).json({ error: 'Not found' });
    const id = dp._id ? String(dp._id) : dp.id;
    res.json({ id, email: dp.email, name: dp.name, status: dp.status });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/login', (req, res) => {
   const { passcode } = req.body || {};
   const required = process.env.ADMIN_PASSCODE || process.env.VITE_ADMIN_PASSCODE;
   if (required && passcode !== required) return res.status(401).json({ error: 'Invalid passcode' });
   if (!required && (!passcode || !passcode.trim())) return res.status(401).json({ error: 'Invalid passcode' });
   res.json({ token: signJwt({ role: 'admin' }, '12h') });
 });

 app.get('/api/admin/delivery-partners', adminAuth, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const list = await DeliveryPartner.find({}).sort({ createdAt: -1 }).lean();
      return res.json(list.map(dp => ({ ...dp, id: String(dp._id) })));
    }
    res.json(inMemoryDeliveryPartners);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/orders', adminAuth, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const list = await Order.find({}).sort({ createdAt: -1 }).lean();
      return res.json(list.map(o => ({ ...o, id: String(o._id) })));
    }
    res.json(inMemoryOrders.sort((a, b) => b.createdAt - a.createdAt));
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/delivery-partners/:id/verify', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const dp = await DeliveryPartner.findById(id);
      if (!dp) return res.status(404).json({ error: 'Not found' });
      dp.verified = true;
      await dp.save();
      return res.json({ success: true });
    }
    const dp = inMemoryDeliveryPartners.find(x => x.id === id);
    if (!dp) return res.status(404).json({ error: 'Not found' });
    dp.verified = true;
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/stats', adminAuth, async (req, res) => {
  try {
    let stats = {
      restaurants: 0,
      partners: 0,
      deliveryPartners: 0,
      users: 0,
      deliveries: 0
    };
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      stats.restaurants = await Restaurant.countDocuments({ verified: true });
      stats.partners = await PartnerSubmission.countDocuments({});
      stats.deliveryPartners = await DeliveryPartner.countDocuments({});
      stats.deliveries = await Delivery.countDocuments({});
      // stats.users = await User.countDocuments({}); // No User model yet, using inMemoryUsers
      stats.users = inMemoryUsers.length;
    } else {
      stats.restaurants = sampleData.length;
      stats.partners = inMemorySubmissions.length;
      stats.deliveryPartners = inMemoryDeliveryPartners.length;
      stats.deliveries = inMemoryDeliveries.length;
      stats.users = inMemoryUsers.length;
    }
    res.json(stats);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

async function connectMongo() {
  if (!MONGO_URI) {
    console.warn('No MONGO_URI provided. Server will run with in-memory sample data.');
    return;
  }
  try {
    await mongoose.connect(MONGO_URI, { dbName: process.env.DB_NAME || undefined });
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
}

function distanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const sampleData = [
  {
    _id: '1',
    name: 'Satvic Sagar',
    address: '12 Peace Lane, Old Town',
    city: 'Jaipur',
    area: 'Old Town',
    latitude: 26.9124,
    longitude: 75.7873,
    verified: true,
    satvikType: 'Pure Satvik',
    priceRange: '$$',
    menu: [
      { name: 'Khichdi', description: 'Simple, sattvic comfort food', price: 120 },
      { name: 'Fruit Bowl', description: 'Seasonal fresh fruits', price: 150 },
    ],
    story: 'Founded by spiritual seekers to serve clean food.',
    bestTimeToVisit: 'Evenings 6-8pm',
  },
  {
    _id: '2',
    name: 'Jain Bhojanalaya',
    address: '45 Harmony Street, City Center',
    city: 'Ahmedabad',
    area: 'City Center',
    latitude: 23.0225,
    longitude: 72.5714,
    verified: true,
    satvikType: 'Jain Friendly',
    priceRange: '$$',
    menu: [
      { name: 'Jain Thali', description: 'No onion/garlic, simple and pure', price: 200 },
      { name: 'Dal-Rice', description: 'Clean and nutritious', price: 150 },
    ],
    story: 'Serving Jain-friendly meals for decades.',
    bestTimeToVisit: 'Lunch 12-2pm',
  },
];

function getModel() {
  if (mongoose.connection.readyState === 1 && MONGO_URI) {
    return Restaurant;
  }
  return {
    async find(query = {}) {
      const verifiedOnly = query.verified === true;
      let results = sampleData.filter((r) => (verifiedOnly ? r.verified : true));
      if (query.city) {
        results = results.filter((r) => r.city.toLowerCase() === String(query.city).toLowerCase());
      }
      if (query.satvikType) {
        results = results.filter((r) => r.satvikType === query.satvikType);
      }
      return results;
    },
    async findById(id) {
      return sampleData.find((r) => r._id === id) || null;
    },
  };
}

app.get('/api/restaurants', async (req, res) => {
  try {
    const { city, satvikType, q } = req.query;
    const Model = getModel();
    let results = await Model.find({ verified: true, city, satvikType });

    if (q) {
      const ql = String(q).toLowerCase();
      results = results.filter(
        (r) =>
          r.name.toLowerCase().includes(ql) ||
          (r.area || '').toLowerCase().includes(ql),
      );
    }

    res.json(results);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/restaurants/:id/memberships', async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const { title, price, durationDays, benefits, type, mealType, mealsCount } = req.body || {};
    if (!title || !price || !durationDays) {
      return res.status(400).json({ error: 'title, price, durationDays required' });
    }
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const doc = await MembershipPlan.create({
        restaurantId,
        title,
        price: Number(price),
        durationDays: Number(durationDays),
        type: type || 'subscription',
        mealType: mealType || 'none',
        benefits: Array.isArray(benefits) ? benefits : [],
      });
      return res.status(201).json({ id: String(doc._id) });
    }
    const id = String(Date.now());
    inMemoryPlans.push({
      id,
      restaurantId,
      title,
      price: Number(price),
      durationDays: Number(durationDays),
      type: type || 'subscription',
      mealType: mealType || 'none',
      benefits: Array.isArray(benefits) ? benefits : [],
      createdAt: new Date(),
    });
    res.status(201).json({ id });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/memberships/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      await MembershipPlan.findByIdAndDelete(id);
    } else {
      const idx = inMemoryPlans.findIndex(p => p.id === id);
      if (idx !== -1) inMemoryPlans.splice(idx, 1);
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/restaurants/:id/memberships', async (req, res) => {
  try {
    const restaurantId = req.params.id;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const list = await MembershipPlan.find({ restaurantId }).sort({ createdAt: -1 }).lean();
      return res.json(
        list.map((p) => ({
          id: String(p._id),
          restaurantId: p.restaurantId,
          title: p.title,
          price: p.price,
          durationDays: p.durationDays,
          type: p.type,
          mealType: p.mealType,
          benefits: p.benefits || [],
          createdAt: p.createdAt,
        })),
      );
    }
    res.json(inMemoryPlans.filter((p) => p.restaurantId === restaurantId));
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/subscribe', async (req, res) => {
  try {
    const { userId, restaurantId, planId } = req.body || {};
    if (!userId || !restaurantId || !planId) {
      return res.status(400).json({ error: 'userId, restaurantId, planId required' });
    }

    let plan;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      plan = await MembershipPlan.findById(planId);
    } else {
      plan = inMemoryPlans.find(p => p.id === planId);
    }
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const doc = await UserSubscription.create({
        userId,
        restaurantId,
        planId,
        status: 'active',
        endDate,
        remainingMeals: plan.type === 'daily_meal' ? plan.durationDays : undefined,
      });
      return res.status(201).json({ id: String(doc._id), status: doc.status });
    }
    const id = String(Date.now());
    inMemorySubs.push({
      id,
      userId,
      restaurantId,
      planId,
      status: 'active',
      endDate,
      remainingMeals: plan.type === 'daily_meal' ? plan.durationDays : undefined,
      createdAt: new Date(),
    });
    res.status(201).json({ id, status: 'active' });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/subscriptions/:id/redeem', async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // meal_redeem or on_table_checkin

    let sub;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      sub = await UserSubscription.findById(id);
      if (sub && sub.remainingMeals > 0) {
        sub.remainingMeals -= 1;
        await sub.save();
        await UsageLog.create({ subscriptionId: id, userId: sub.userId, restaurantId: sub.restaurantId, type });
      }
    } else {
      sub = inMemorySubs.find(s => s.id === id);
      if (sub && sub.remainingMeals > 0) {
        sub.remainingMeals -= 1;
      }
    }
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });
    res.json({ success: true, remainingMeals: sub.remainingMeals });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/users/:userId/subscriptions', async (req, res) => {
  try {
    const userId = req.params.userId;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const list = await UserSubscription.find({ userId }).sort({ createdAt: -1 }).lean();
      return res.json(
        list.map((s) => ({
          id: String(s._id),
          userId: s.userId,
          restaurantId: s.restaurantId,
          planId: s.planId,
          status: s.status,
          createdAt: s.createdAt,
        })),
      );
    }
    res.json(inMemorySubs.filter((s) => s.userId === userId));
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Booking Routes
app.post('/api/bookings', async (req, res) => {
  try {
    const { restaurantId, userId, userName, date, time, people } = req.body || {};
    if (!restaurantId || !userId || !date || !time || !people) {
      return res.status(400).json({ error: 'restaurantId, userId, date, time, people required' });
    }
    let bookingId;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const doc = await Booking.create({ restaurantId, userId, userName, date, time, people: Number(people) });
      bookingId = String(doc._id);
    } else {
      const id = String(Date.now());
      const b = { id, restaurantId, userId, userName, date, time, people: Number(people), status: 'pending', createdAt: new Date() };
      inMemoryBookings.push(b);
      bookingId = id;
    }
    
    await notifyRestaurant(restaurantId, 'New Booking Request', `New booking for ${people} people on ${date} at ${time}`);
    res.status(201).json({ id: bookingId, status: 'pending' });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/restaurants/:id/bookings', async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const list = await Booking.find({ restaurantId: id }).sort({ createdAt: -1 }).lean();
      return res.json(list.map(b => ({ ...b, id: String(b._id) })));
    }
    res.json(inMemoryBookings.filter(b => b.restaurantId === id).sort((a, b) => b.createdAt - a.createdAt));
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/users/:userId/bookings', async (req, res) => {
  try {
    const { userId } = req.params;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const list = await Booking.find({ userId }).sort({ createdAt: -1 }).lean();
      return res.json(list.map(b => ({ ...b, id: String(b._id) })));
    }
    res.json(inMemoryBookings.filter(b => b.userId === userId).sort((a, b) => b.createdAt - a.createdAt));
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    let booking;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });
    } else {
      booking = inMemoryBookings.find(x => x.id === id);
      if (booking) booking.status = status;
    }
    
    if (!booking) return res.status(404).json({ error: 'Not found' });
    
    if (status === 'confirmed') {
      await notifyUser(booking.userId, 'Booking Confirmed!', `Your booking at ${booking.restaurantId} has been confirmed for ${booking.date} at ${booking.time}`);
    }
    
    res.json({ id: booking._id ? String(booking._id) : booking.id, status: booking.status });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Order Routes
app.post('/api/orders', async (req, res) => {
  try {
    const { restaurantId, userId, items, totalPrice, deliveryAddress } = req.body || {};
    if (!restaurantId || !userId || !items || !totalPrice) {
      return res.status(400).json({ error: 'restaurantId, userId, items, totalPrice required' });
    }
    let orderId;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const doc = await Order.create({ restaurantId, userId, items, totalPrice, deliveryAddress, status: 'PLACED' });
      orderId = String(doc._id);
    } else {
      const id = String(Date.now());
      const o = { id, restaurantId, userId, items, totalPrice, deliveryAddress, status: 'PLACED', createdAt: new Date() };
      inMemoryOrders.push(o);
      orderId = id;
    }
    
    await notifyRestaurant(restaurantId, 'New Order Placed', `You have a new order #${orderId.slice(-6)} for ₹${totalPrice}`);
    res.status(201).json({ id: orderId, status: 'PLACED' });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/users/:userId/orders', async (req, res) => {
  try {
    const { userId } = req.params;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const list = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
      return res.json(list.map(o => ({ ...o, id: String(o._id) })));
    }
    res.json(inMemoryOrders.filter(o => o.userId === userId).sort((a, b) => b.createdAt - a.createdAt));
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/restaurants/:id/orders', async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const list = await Order.find({ restaurantId: id }).sort({ createdAt: -1 }).lean();
      return res.json(list.map(o => ({ ...o, id: String(o._id) })));
    }
    res.json(inMemoryOrders.filter(o => o.restaurantId === id).sort((a, b) => b.createdAt - a.createdAt));
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updateData = { status };
    if (status === 'ACCEPTED') updateData.acceptedAt = new Date();
    if (status === 'READY') updateData.readyAt = new Date();
    if (status === 'PICKED') updateData.pickedAt = new Date();
    if (status === 'DELIVERED') updateData.deliveredAt = new Date();

    let order;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      order = await Order.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      order = inMemoryOrders.find(x => x.id === id);
      if (order) Object.assign(order, updateData);
    }
    
    if (!order) return res.status(404).json({ error: 'Not found' });

    const orderIdShort = (order._id ? String(order._id) : order.id).slice(-6);
    
    if (status === 'ACCEPTED') {
      await notifyUser(order.userId, 'Order Accepted', `Your order #${orderIdShort} has been accepted by the restaurant.`);
    } else if (status === 'READY') {
      await notifyUser(order.userId, 'Order Ready', `Your order #${orderIdShort} is ready and will be picked up soon.`);
      // notify available delivery partners
      console.log('[NOTIFICATION] Broad-cast: New delivery available for order #', orderIdShort);
    } else if (status === 'DELIVERED') {
      await notifyUser(order.userId, 'Order Delivered', `Your order #${orderIdShort} has been delivered. Enjoy your meal!`);
    }

    res.json({ id: order._id ? String(order._id) : order.id, status: order.status });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Payment Simulation
app.post('/api/payments/verify', async (req, res) => {
  try {
    const { type, id, paymentId } = req.body; // type: 'order' or 'subscription'
    if (!type || !id) return res.status(400).json({ error: 'type and id required' });
    
    // Simulate verification (always success for now)
    if (type === 'order') {
      if (mongoose.connection.readyState === 1 && MONGO_URI) {
        await Order.findByIdAndUpdate(id, { paymentStatus: 'paid' });
      } else {
        const o = inMemoryOrders.find(x => x.id === id);
        if (o) o.paymentStatus = 'paid';
      }
    } else if (type === 'subscription') {
      if (mongoose.connection.readyState === 1 && MONGO_URI) {
        await UserSubscription.findByIdAndUpdate(id, { status: 'active' });
      } else {
        const s = inMemorySubs.find(x => x.id === id);
        if (s) s.status = 'active';
      }
    }
    
    res.json({ success: true, message: 'Payment verified' });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/deliveries', async (req, res) => {
  try {
    const { restaurantId, userId, scheduledAt } = req.body || {};
    if (!restaurantId || !userId || !scheduledAt) {
      return res.status(400).json({ error: 'restaurantId, userId, scheduledAt required' });
    }
    const sched = new Date(scheduledAt);
    if (Number.isNaN(sched.getTime())) {
      return res.status(400).json({ error: 'scheduledAt must be a valid datetime' });
    }
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const doc = await Delivery.create({
        restaurantId,
        userId,
        scheduledAt: sched,
        status: 'pending',
      });
      return res.status(201).json({ id: String(doc._id), status: doc.status });
    }
    const id = String(Date.now());
    inMemoryDeliveries.push({
      id,
      restaurantId,
      userId,
      scheduledAt: sched,
      status: 'pending',
      createdAt: new Date(),
    });
    res.status(201).json({ id, status: 'pending' });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/deliveries/:id/done', async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const doc = await Delivery.findById(id);
      if (!doc) return res.status(404).json({ error: 'Not found' });
      doc.status = 'done';
      doc.doneAt = new Date();
      await doc.save();
      return res.json({ id: String(doc._id), status: doc.status, doneAt: doc.doneAt });
    }
    const d = inMemoryDeliveries.find((x) => x.id === id);
    if (!d) return res.status(404).json({ error: 'Not found' });
    d.status = 'done';
    d.doneAt = new Date();
    res.json({ id: d.id, status: d.status, doneAt: d.doneAt });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delivery Partner Routes
app.get('/api/delivery/available', deliveryPartnerAuth, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const list = await Order.find({ status: 'READY' }).sort({ createdAt: 1 }).lean();
      return res.json(list.map(o => ({ ...o, id: String(o._id) })));
    }
    res.json(inMemoryOrders.filter(o => o.status === 'READY'));
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/delivery/:id/pick', deliveryPartnerAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const dpId = req.user.sub;
    
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const doc = await Order.findById(id);
      if (!doc) return res.status(404).json({ error: 'Not found' });
      if (doc.status !== 'READY') return res.status(400).json({ error: 'Order not ready for pickup' });
      
      doc.status = 'PICKED';
      doc.deliveryPartnerId = dpId;
      doc.pickedAt = new Date();
      await doc.save();
      return res.json({ id: String(doc._id), status: doc.status });
    }
    
    const o = inMemoryOrders.find(x => x.id === id);
    if (!o) return res.status(404).json({ error: 'Not found' });
    if (o.status !== 'READY') return res.status(400).json({ error: 'Order not ready' });
    o.status = 'PICKED';
    o.deliveryPartnerId = dpId;
    o.pickedAt = new Date();
    res.json({ id: o.id, status: o.status });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/delivery/:id/complete', deliveryPartnerAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const dpId = req.user.sub;
    
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const doc = await Order.findById(id);
      if (!doc) return res.status(404).json({ error: 'Not found' });
      if (doc.deliveryPartnerId !== dpId) return res.status(403).json({ error: 'Not your delivery' });
      
      doc.status = 'DELIVERED';
      doc.deliveredAt = new Date();
      await doc.save();
      return res.json({ id: String(doc._id), status: doc.status });
    }
    
    const o = inMemoryOrders.find(x => x.id === id);
    if (!o) return res.status(404).json({ error: 'Not found' });
    if (o.deliveryPartnerId !== dpId) return res.status(403).json({ error: 'Not your delivery' });
    
    o.status = 'DELIVERED';
    o.deliveredAt = new Date();
    res.json({ id: o.id, status: o.status });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/delivery/my-orders', deliveryPartnerAuth, async (req, res) => {
  try {
    const dpId = req.user.sub;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const list = await Order.find({ deliveryPartnerId: dpId }).sort({ createdAt: -1 }).lean();
      return res.json(list.map(o => ({ ...o, id: String(o._id) })));
    }
    res.json(inMemoryOrders.filter(o => o.deliveryPartnerId === dpId));
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/partners/:restaurantId/reminders', async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;
    const now = Date.now();
    function shape(d) {
      const deadline = new Date(new Date(d.scheduledAt).getTime() + 30 * 60000);
      const minutesLeft = Math.ceil((deadline.getTime() - now) / 60000);
      return {
        id: d.id || String(d._id),
        restaurantId: d.restaurantId,
        userId: d.userId,
        scheduledAt: d.scheduledAt,
        status: d.status,
        minutesLeft,
        overdue: minutesLeft < 0 && d.status === 'pending',
      };
    }
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const list = await Delivery.find({ restaurantId }).sort({ scheduledAt: 1 }).lean();
      return res.json(list.map(shape));
    }
    res.json(inMemoryDeliveries.filter((d) => d.restaurantId === restaurantId).map(shape));
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/partners/:restaurantId/usage', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const logs = await UsageLog.find({ restaurantId }).sort({ timestamp: -1 }).limit(50).lean();
      res.json(logs);
    } else {
      res.json([]);
    }
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/issues', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const list = await Delivery.find({ status: 'escalated' }).sort({ escalatedAt: -1 }).lean();
      return res.json(
        list.map((d) => ({
          id: String(d._id),
          deliveryId: String(d._id),
          restaurantId: d.restaurantId,
          userId: d.userId,
          escalatedAt: d.escalatedAt,
          reason: 'Delivery not marked done within 30 minutes',
        })),
      );
    }
    res.json(inMemoryIssues.slice().sort((a, b) => new Date(b.escalatedAt) - new Date(a.escalatedAt)));
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});
app.get('/api/restaurants/nearby', async (req, res) => {
  const { lat, lng } = req.query;
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }
  try {
    const Model = getModel();
    const all = await Model.find({ verified: true });
    const withDistance = all.map((r) => ({
      ...r,
      distanceKm: distanceKm(latitude, longitude, r.latitude, r.longitude),
    }));
    withDistance.sort((a, b) => a.distanceKm - b.distanceKm);
    res.json(withDistance);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/restaurants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const doc = await Restaurant.findByIdAndUpdate(id, updateData, { new: true });
      if (!doc) return res.status(404).json({ error: 'Not found' });
      res.json(doc);
    } else {
      const idx = sampleData.findIndex(r => r._id === id);
      if (idx !== -1) {
        sampleData[idx] = { ...sampleData[idx], ...updateData };
        res.json(sampleData[idx]);
      } else {
        res.status(404).json({ error: 'Not found' });
      }
    }
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/partners/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    let subsCount = 0;
    let deliveriesCount = 0;
    let activePlans = 0;

    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      subsCount = await UserSubscription.countDocuments({ restaurantId: id });
      deliveriesCount = await Delivery.countDocuments({ restaurantId: id });
      activePlans = await MembershipPlan.countDocuments({ restaurantId: id });
    } else {
      subsCount = inMemorySubs.filter(s => s.restaurantId === id).length;
      deliveriesCount = inMemoryDeliveries.filter(d => d.restaurantId === id).length;
      activePlans = inMemoryPlans.filter(p => p.restaurantId === id).length;
    }
    res.json({ subsCount, deliveriesCount, activePlans });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const Model = getModel();
    const restaurant = await Model.findById(req.params.id);
    if (!restaurant || restaurant.verified !== true) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(restaurant);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/', (req, res) => {
  res.send('Satvic API running');
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'satvic/partner' },
        (error, uploadResult) => {
          if (error) return reject(error);
          resolve(uploadResult);
        },
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
    return res
      .status(200)
      .json({ url: result.secure_url, public_id: result.public_id });
  } catch (e) {
    console.error('Upload error:', e.message);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.post('/api/partners', async (req, res) => {
  try {
    const { profile, menuItems, offers } = req.body || {};
    if (
      !profile?.name ||
      !profile?.city ||
      !profile?.phone ||
      !Array.isArray(menuItems) ||
      menuItems.length === 0
    ) {
      return res.status(400).json({
        error:
          'Missing required fields: name, city, phone, at least one menu item',
      });
    }

    if (mongoose.connection.readyState === 1 && process.env.MONGO_URI) {
      const doc = await PartnerSubmission.create({
        profile,
        menuItems,
        offers,
        status: 'pending',
      });
      return res
        .status(201)
        .json({ id: String(doc._id), status: doc.status });
    } else {
      const id = String(Date.now());
      inMemorySubmissions.push({
        id,
        profile,
        menuItems,
        offers,
        status: 'pending',
        createdAt: new Date(),
      });
      return res.status(201).json({ id, status: 'pending' });
    }
  } catch (e) {
    console.error('Partner submit error:', e.message);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/partners', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1 && process.env.MONGO_URI) {
      const list = await PartnerSubmission.find({})
        .sort({ createdAt: -1 })
        .lean();
      return res.json(
        list.map((d) => ({
          id: String(d._id),
          profile: d.profile,
          menuItems: d.menuItems,
          offers: d.offers || [],
          status: d.status,
          createdAt: d.createdAt,
        })),
      );
    }
    res.json(
      inMemorySubmissions.map((s) => ({
        id: s.id,
        profile: s.profile,
        menuItems: s.menuItems,
        offers: s.offers || [],
        status: s.status,
        createdAt: s.createdAt,
      })),
    );
  } catch (e) {
    console.error('Partners list error:', e.message);
    res.status(500).json({ error: 'Server error' });
  }
});

function buildAddress(profile) {
  const parts = [profile.street, profile.city, profile.state, profile.pincode].filter(Boolean);
  return parts.join(', ') || profile.city || '';
}

app.post('/api/partners/:id/approve', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    let submission;
    if (mongoose.connection.readyState === 1 && process.env.MONGO_URI) {
      submission = await PartnerSubmission.findById(id).lean();
      if (!submission) return res.status(404).json({ error: 'Submission not found' });
    } else {
      submission = inMemorySubmissions.find((s) => s.id === id);
      if (!submission) return res.status(404).json({ error: 'Submission not found' });
    }
    const { profile, menuItems } = submission;
    const RestaurantModel = mongoose.connection.readyState === 1 ? Restaurant : null;
    const restaurantData = {
      name: profile.name || 'Restaurant',
      address: buildAddress(profile),
      city: profile.city || '',
      area: profile.area || profile.city || '',
      latitude:
        profile.latitude != null && profile.latitude !== ''
          ? Number(profile.latitude)
          : undefined,
      longitude:
        profile.longitude != null && profile.longitude !== ''
          ? Number(profile.longitude)
          : undefined,
      phone: profile.phone || '',
      whatsapp: profile.whatsapp || profile.phone || '',
      coverImage: profile.coverImage || '',
      verified: true,
      satvikType:
        profile.vegStatus === 'Pure Satvik'
          ? 'Pure Satvik'
          : profile.jainFriendly
          ? 'Jain Friendly'
          : 'No Onion/Garlic',
      priceRange: '$$',
      menu: (menuItems || []).map((m) => ({
        name: m.name || '',
        description: m.description || '',
        price: Number(m.price) || 0,
      })),
      story: profile.notes || '',
      bestTimeToVisit: profile.hours || '',
    };
    if (RestaurantModel) {
      const created = await RestaurantModel.create(restaurantData);
      try {
        await PartnerSubmission.updateOne(
          { _id: submission._id },
          { status: 'approved' },
        );
      } catch (upErr) {
        console.warn('Update submission status:', upErr.message);
      }
      try {
        const u = inMemoryUsers.find((x) => x.email && submission.profile && submission.profile.email && x.email.toLowerCase() === String(submission.profile.email).toLowerCase());
        if (u) u.partnerId = String(created._id);
      } catch {}
      return res.json({
        id: String(created._id),
        status: 'approved',
        restaurantId: String(created._id),
      });
    }
    sampleData.push({ ...restaurantData, _id: String(sampleData.length + 1) });
    const inMem = inMemorySubmissions.find((s) => s.id === id);
    if (inMem) inMem.status = 'approved';
    try {
      const u = inMemoryUsers.find((x) => x.email && inMem.profile && inMem.profile.email && x.email.toLowerCase() === String(inMem.profile.email).toLowerCase());
      if (u) u.partnerId = String(sampleData.length);
    } catch {}
    res.json({
      id: submission.id,
      status: 'approved',
      restaurantId: String(sampleData.length),
    });
  } catch (e) {
    console.error('Approve error:', e.message);
    res.status(500).json({ error: 'Server error' });
  }
});

async function escalateCheck() {
  try {
    const now = Date.now();
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const list = await Delivery.find({ status: 'pending' }).lean();
      for (const d of list) {
        const deadline = new Date(new Date(d.scheduledAt).getTime() + 30 * 60000);
        if (deadline.getTime() < now) {
          await Delivery.updateOne({ _id: d._id }, { status: 'escalated', escalatedAt: new Date() });
        }
      }
      return;
    }
    for (const d of inMemoryDeliveries) {
      if (d.status !== 'pending') continue;
      const deadline = new Date(new Date(d.scheduledAt).getTime() + 30 * 60000);
      if (deadline.getTime() < now) {
        d.status = 'escalated';
        d.escalatedAt = new Date();
        inMemoryIssues.push({
          id: String(Date.now()),
          deliveryId: d.id,
          restaurantId: d.restaurantId,
          userId: d.userId,
          escalatedAt: d.escalatedAt,
          reason: 'Delivery not marked done within 30 minutes',
        });
      }
    }
  } catch (_) {}
}

connectMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
  });
  setInterval(escalateCheck, 60000);
});
