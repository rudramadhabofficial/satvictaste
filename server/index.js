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
const axios = require('axios');

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
  allowedItems: [{ name: String, price: Number }], // Menu items included in this plan
  benefits: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

const userSubscriptionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  restaurantId: { type: String, required: true },
  planId: { type: String, required: true },
  status: { type: String, enum: ['active', 'paused', 'expired', 'pending_payment'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  deliveryAddress: { type: String },
  deliveryTime: { type: String }, // e.g. "12:00"
  selectedItems: [{ name: String, price: Number, quantity: Number }],
  remainingMeals: { type: Number },
  lastOrderDate: { type: String }, // Format: "YYYY-MM-DD" to prevent duplicates
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
    enum: ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'ASSIGNED', 'PICKED', 'DELIVERED', 'CANCELLED'], 
    default: 'PLACED' 
  },
  deliveryPartnerId: { type: String },
  deliveryAddress: { type: String },
  isSubscriptionOrder: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  acceptedAt: { type: Date },
  readyAt: { type: Date },
  assignedAt: { type: Date },
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
  assignedRestaurants: { type: [String], default: [] }, // Array of Restaurant IDs
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
  email: { type: String, unique: true }, // Added for independent login
  passwordHash: String, // Added for independent login
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
  menu: [{ 
    name: String, 
    description: String, 
    price: Number,
    image: String 
  }],
  story: String,
  bestTimeToVisit: String,
  assignedDeliveryPartners: { type: [String], default: [] }, // Array of DP IDs
  ownerId: String, // Deprecated: keeping for backward compatibility
  createdAt: { type: Date, default: Date.now },
});

const partnerSubmissionSchema = new mongoose.Schema({
  profile: { type: Object, required: true },
  menuItems: { type: Array, default: [] },
  offers: { type: Array, default: [] },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  phone: { type: String }, // Added for user info
  city: { type: String }, // Added for user info
  address: { type: String }, // Added for user info
  verified: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, // Restricted to customer/admin
  createdAt: { type: Date, default: Date.now },
});

const verificationSchema = new mongoose.Schema({
  email: { type: String, required: true },
  token: { type: String, required: true },
  userData: { type: Object }, // Temp storage for signup data
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // 10 minutes expiry
});

const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);
const MembershipPlan = mongoose.models.MembershipPlan || mongoose.model('MembershipPlan', membershipPlanSchema);
const UserSubscription = mongoose.models.UserSubscription || mongoose.model('UserSubscription', userSubscriptionSchema);
const UsageLog = mongoose.models.UsageLog || mongoose.model('UsageLog', usageLogSchema);
const Delivery = mongoose.models.Delivery || mongoose.model('Delivery', deliverySchema);
const DeliveryPartner = mongoose.models.DeliveryPartner || mongoose.model('DeliveryPartner', deliveryPartnerSchema);
const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
const PartnerSubmission = mongoose.models.PartnerSubmission || mongoose.model('PartnerSubmission', partnerSubmissionSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Verification = mongoose.models.Verification || mongoose.model('Verification', verificationSchema);

const inMemoryPlans = [];
const inMemorySubs = [];
const inMemoryDeliveries = [];
const inMemoryIssues = [];
const inMemoryUsers = [];
const inMemoryVerifications = [];
const inMemoryDeliveryPartners = [];
const inMemoryBookings = [];
const inMemoryOrders = [];
const inMemorySubmissions = [];

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

async function partnerAuth(req, res, next) {
   try {
     const auth = req.headers.authorization || '';
     const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
     if (!token) return res.status(401).json({ error: 'Unauthorized' });
     const decoded = verifyJwt(token);
     
     // Attach user to request
     req.user = decoded;
     next();
   } catch (e) {
     return res.status(401).json({ error: 'Unauthorized' });
   }
 }

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@satvictaste.com';

async function getZohoAccessToken() {
  const regions = ['in', 'com']; // Priority to .in for India
  for (const region of regions) {
    try {
      console.log(`[EMAIL] Attempting to refresh token for region: ${region}`);
      const resp = await axios.post(`https://accounts.zoho.${region}/oauth/v2/token`, null, {
        params: {
          refresh_token: process.env.ZOHO_REFRESH_TOKEN,
          client_id: process.env.ZOHO_CLIENT_ID,
          client_secret: process.env.ZOHO_CLIENT_SECRET,
          grant_type: 'refresh_token',
        },
      });
      if (resp.data.access_token) {
        console.log(`[EMAIL] Token refresh successful for region: ${region}`);
        return { token: resp.data.access_token, region };
      }
    } catch (e) {
      console.warn(`[EMAIL] Failed refresh for region ${region}:`, e.response?.data || e.message);
    }
  }
  return null;
}

async function maybeSendEmail(to, subject, text, html) {
  try {
    console.log(`[EMAIL] Attempting to send via API to: ${to} | Subject: ${subject}`);
    
    if (!process.env.ZOHO_CLIENT_ID || !process.env.ZOHO_ACCOUNT_ID) {
      console.warn('[EMAIL] ZOHO credentials missing. Check Render Env Vars.');
      return true;
    }

    const authData = await getZohoAccessToken();
    if (!authData) throw new Error('Could not get access token from any Zoho region (.in or .com)');

    const { token, region } = authData;
    const accountId = process.env.ZOHO_ACCOUNT_ID;
    const fromAddress = process.env.ZOHO_MAIL_FROM || 'noreply@satvictaste.com';

    const resp = await axios.post(
      `https://mail.zoho.${region}/api/accounts/${accountId}/messages`,
      {
        fromAddress,
        toAddress: to,
        subject,
        content: html || text,
        mailFormat: html ? 'html' : 'text'
      },
      {
        headers: {
          'Authorization': `Zoho-oauthtoken ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`[EMAIL] Success! Zoho API (${region}) Response Status: ${resp.status}`);
    return true;
  } catch (e) {
    console.error('[EMAIL] REST API FAILURE:', e.response?.data || e.message);
    console.log(`[AUTH-FALLBACK] OTP for ${to}: ${text}`);
    return false;
  }
}

const inMemoryNotifications = [];

async function notifyUser(userId, subject, text) {
  let user;
  if (mongoose.connection.readyState === 1 && MONGO_URI) {
    user = await User.findById(userId);
  } else {
    user = inMemoryUsers.find(u => u.id === userId);
  }
  const email = user ? user.email : `user-${userId}@satvic.local`;
  
  // Store notification for polling
  inMemoryNotifications.push({
    id: Date.now() + Math.random().toString(36).substr(2, 9),
    userId,
    title: subject,
    message: text,
    read: false,
    createdAt: new Date()
  });

  await maybeSendEmail(email, subject, text);
}

app.get('/api/notifications', async (req, res) => {
  const { userId, restaurantId, dpId } = req.query;
  const filtered = inMemoryNotifications.filter(n => 
    (userId && n.userId === userId) || 
    (restaurantId && n.restaurantId === restaurantId) ||
    (dpId && n.deliveryPartnerId === dpId)
  );
  res.json(filtered.slice(-10).reverse());
});

async function notifyRestaurant(restaurantId, subject, text) {
  // Store notification for polling
  inMemoryNotifications.push({
    id: Date.now() + Math.random().toString(36).substr(2, 9),
    restaurantId,
    title: subject,
    message: text,
    read: false,
    createdAt: new Date()
  });
  await maybeSendEmail(`restaurant-${restaurantId}@satvic.local`, subject, text);
}

async function notifyDeliveryPartner(dpId, subject, text) {
  let dp;
  if (mongoose.connection.readyState === 1 && MONGO_URI) {
    dp = await mongoose.model('DeliveryPartner').findById(dpId);
  } else {
    dp = inMemoryDeliveryPartners.find(x => x.id === dpId);
  }
  const email = dp ? dp.email : `dp-${dpId}@satvic.local`;

  // Store notification for polling
  inMemoryNotifications.push({
    id: Date.now() + Math.random().toString(36).substr(2, 9),
    deliveryPartnerId: dpId,
    title: subject,
    message: text,
    read: false,
    createdAt: new Date()
  });

  await maybeSendEmail(email, subject, text);
}

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Email required' });

    let u, role;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      u = await User.findOne({ email: email.toLowerCase() });
      if (!u) u = await DeliveryPartner.findOne({ email: email.toLowerCase() });
      // Also check if they are a restaurant owner via User model (partnerId field)
    } else {
      u = inMemoryUsers.find(x => x.email.toLowerCase() === email.toLowerCase());
      if (!u) u = inMemoryDeliveryPartners.find(x => x.email.toLowerCase() === email.toLowerCase());
    }

    if (!u) return res.status(404).json({ error: 'User not found' });

    const token = String(Math.floor(1000 + Math.random() * 9000));
    console.log(`[AUTH] Generated Reset OTP for ${email}: ${token}`);
    
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      await Verification.findOneAndDelete({ email: email.toLowerCase() });
      await Verification.create({ email: email.toLowerCase(), token, role: 'reset' });
    } else {
      const oldIdx = inMemoryVerifications.findIndex(v => v.email.toLowerCase() === email.toLowerCase());
      if (oldIdx !== -1) inMemoryVerifications.splice(oldIdx, 1);
      inMemoryVerifications.push({ email: email.toLowerCase(), token, role: 'reset', createdAt: new Date() });
    }

    const html = `
      <div style="font-family: 'Fraunces', Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #FAF9F6; border-radius: 20px;">
        <h1 style="color: #161B18; font-size: 28px; text-align: center; margin-bottom: 24px;">Reset your Password</h1>
        <p style="color: #5A655E; font-size: 16px; line-height: 1.6; text-align: center;">
          We received a request to reset your password. Use the code below to proceed:
        </p>
        <div style="background: #FFFFFF; border: 1px solid rgba(44, 51, 46, 0.06); border-radius: 14px; padding: 32px; margin: 32px 0; text-align: center;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #5F8B6E;">${token}</span>
        </div>
      </div>
    `;
    await maybeSendEmail(email, 'Reset your SatvicTaste password', `Your reset code is ${token}`, html);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body || {};
    if (!email || !token || !newPassword) return res.status(400).json({ error: 'All fields required' });

    let verification;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      verification = await Verification.findOne({ email: email.toLowerCase(), token, role: 'reset' });
    } else {
      verification = inMemoryVerifications.find(v => v.email.toLowerCase() === email.toLowerCase() && v.token === token && v.role === 'reset');
    }

    if (!verification) return res.status(400).json({ error: 'Invalid or expired code' });

    const passwordHash = hashPassword(newPassword);

    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      let u = await User.findOneAndUpdate({ email: email.toLowerCase() }, { passwordHash });
      if (!u) await DeliveryPartner.findOneAndUpdate({ email: email.toLowerCase() }, { passwordHash });
      await Verification.findByIdAndDelete(verification._id);
    } else {
      let u = inMemoryUsers.find(x => x.email.toLowerCase() === email.toLowerCase());
      if (u) u.passwordHash = passwordHash;
      else {
        let dp = inMemoryDeliveryPartners.find(x => x.email.toLowerCase() === email.toLowerCase());
        if (dp) dp.passwordHash = passwordHash;
      }
      const idx = inMemoryVerifications.findIndex(v => v.email.toLowerCase() === email.toLowerCase());
      inMemoryVerifications.splice(idx, 1);
    }

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, name, password } = req.body || {};
    if (!email || !password || !name) return res.status(400).json({ error: 'name, email, password required' });
    
    console.log(`[AUTH] Signup attempt for ${email}`);

    // Check if already registered and verified
    let existingUser;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      existingUser = await User.findOne({ email: email.toLowerCase() });
    } else {
      existingUser = inMemoryUsers.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
    }

    if (existingUser && existingUser.verified) {
      console.log(`[AUTH] Signup failed: Email ${email} already registered`);
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate 4-digit token
    const token = String(Math.floor(1000 + Math.random() * 9000));
    console.log(`[AUTH] Generated OTP for ${email}: ${token}`);
    
    // Upsert into verification (includes user data)
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      console.log(`[AUTH] Saving verification to MongoDB for ${email}`);
      await Verification.findOneAndDelete({ email: email.toLowerCase() });
      await Verification.create({ 
        email: email.toLowerCase(), 
        token, 
        userData: { name, passwordHash: hashPassword(password) },
        role: 'user'
      });
    } else {
      console.log(`[AUTH] Saving verification to Memory for ${email}`);
      const oldIdx = inMemoryVerifications.findIndex(v => v.email.toLowerCase() === String(email).toLowerCase());
      if (oldIdx !== -1) inMemoryVerifications.splice(oldIdx, 1);
      
      inMemoryVerifications.push({ 
        email: email.toLowerCase(), 
        token, 
        userData: { name, passwordHash: hashPassword(password) },
        role: 'user',
        createdAt: new Date() 
      });
    }
    
    const html = `
      <div style="font-family: 'Fraunces', Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #FAF9F6; border-radius: 20px;">
        <h1 style="color: #161B18; font-size: 28px; text-align: center; margin-bottom: 24px;">Welcome to SatvicTaste</h1>
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

    console.log(`[AUTH] Sending email to ${email}`);
    // Non-blocking email send so the user doesn't get stuck if SMTP is slow/failing
    maybeSendEmail(email, 'Verify your SatvicTaste account', `Your verification code is ${token}`, html)
      .catch(err => console.error(`[AUTH] background email send failed for ${email}:`, err.message));
    
    console.log(`[AUTH] Signup response sent for ${email}. User should see verification screen.`);
    res.status(201).json({ email, requiresVerification: true });
  } catch (e) {
    console.error('[AUTH] Signup error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/verify', async (req, res) => {
  try {
    const { email, token } = req.body || {};
    let verification;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      verification = await Verification.findOne({ email: email.toLowerCase(), token });
    } else {
      const idx = inMemoryVerifications.findIndex((x) => x.email.toLowerCase() === String(email).toLowerCase() && x.token === token);
      if (idx !== -1) verification = inMemoryVerifications[idx];
    }

    if (!verification) return res.status(400).json({ error: 'Invalid code' });
    
    if (verification.role === 'delivery') {
      if (mongoose.connection.readyState === 1 && MONGO_URI) {
        await DeliveryPartner.create({
          name: verification.userData.name,
          email: verification.email,
          passwordHash: verification.userData.passwordHash,
          phone: verification.userData.phone,
          city: verification.userData.city,
          verified: true
        });
        await Verification.findByIdAndDelete(verification._id);
      } else {
        const id = String(Date.now());
        const dp = { id, email: verification.email, name: verification.userData.name, passwordHash: verification.userData.passwordHash, phone: verification.userData.phone, city: verification.userData.city, verified: true };
        inMemoryDeliveryPartners.push(dp);
        const idx = inMemoryVerifications.findIndex(v => v.email === verification.email);
        inMemoryVerifications.splice(idx, 1);
      }
    } else {
      // User flow
      if (mongoose.connection.readyState === 1 && MONGO_URI) {
        if (verification.userData) {
          await User.create({
            name: verification.userData.name,
            email: verification.email,
            passwordHash: verification.userData.passwordHash,
            verified: true
          });
        } else {
          await User.findOneAndUpdate({ email: verification.email }, { verified: true });
        }
        await Verification.findByIdAndDelete(verification._id);
      } else {
        if (verification.userData) {
          const id = String(Date.now());
          const user = { id, email: verification.email, name: verification.userData.name, passwordHash: verification.userData.passwordHash, verified: true };
          inMemoryUsers.push(user);
        } else {
          const u = inMemoryUsers.find((x) => x.email.toLowerCase() === String(email).toLowerCase());
          if (u) u.verified = true;
        }
        const idx = inMemoryVerifications.findIndex(v => v.email === verification.email);
        inMemoryVerifications.splice(idx, 1);
      }
    }
    
    res.json({ verified: true });
  } catch (e) {
    console.error('Verify error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    let u;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      u = await User.findOne({ email: email.toLowerCase() });
    } else {
      u = inMemoryUsers.find((x) => x.email.toLowerCase() === String(email).toLowerCase());
    }

    if (!u) {
      // Check if it's a partner trying to login via user route (fallback for convenience or error prevention)
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (u.passwordHash !== hashPassword(password)) return res.status(401).json({ error: 'Invalid credentials' });
    
    if (!u.verified) {
      // ... verification logic ...
      const token = String(Math.floor(1000 + Math.random() * 9000));
      if (mongoose.connection.readyState === 1 && MONGO_URI) {
        await Verification.findOneAndDelete({ email: u.email });
        await Verification.create({ email: u.email, token, role: 'user' });
      } else {
        const oldIdx = inMemoryVerifications.findIndex(v => v.email.toLowerCase() === u.email.toLowerCase());
        if (oldIdx !== -1) inMemoryVerifications.splice(oldIdx, 1);
        inMemoryVerifications.push({ email: u.email, token, role: 'user', createdAt: new Date() });
      }
      
      const html = `
        <div style="font-family: 'Fraunces', Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #FAF9F6; border-radius: 20px;">
          <h1 style="color: #161B18; font-size: 28px; text-align: center; margin-bottom: 24px;">Complete your Verification</h1>
          <p style="color: #5A655E; font-size: 16px; line-height: 1.6; text-align: center;">
            You recently tried to login to SatvicTaste but your email hasn't been verified yet. Please use the code below to complete your registration:
          </p>
          <div style="background: #FFFFFF; border: 1px solid rgba(44, 51, 46, 0.06); border-radius: 14px; padding: 32px; margin: 32px 0; text-align: center;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #5F8B6E;">${token}</span>
          </div>
        </div>
      `;
      maybeSendEmail(u.email, 'SatvicTaste verification code', `Your verification code is ${token}`, html);
      return res.status(403).json({ error: 'Email not verified' });
    }

    const id = u._id ? String(u._id) : u.id;
    res.json({ 
      token: signJwt({ sub: id, email: u.email, role: u.role || 'user' }), 
      id, 
      email: u.email, 
      name: u.name,
      role: u.role || 'user'
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Partner Login (Independent from User collection)
app.post('/api/partner/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    let r;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      r = await Restaurant.findOne({ email: email.toLowerCase() });
    } else {
      r = sampleData.find((x) => x.email?.toLowerCase() === String(email).toLowerCase());
    }

    if (!r) return res.status(401).json({ error: 'Invalid credentials' });
    if (r.passwordHash !== hashPassword(password)) return res.status(401).json({ error: 'Invalid credentials' });
    
    const id = r._id ? String(r._id) : r.id;
    res.json({ 
      token: signJwt({ sub: id, email: r.email, role: 'partner' }), 
      id, 
      email: r.email, 
      name: r.name,
      partnerId: id
    });
  } catch (e) {
    console.error('Partner login error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Partner Profile/Auth check
app.get('/api/partner/me', partnerAuth, async (req, res) => {
  try {
    let r;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      r = await Restaurant.findById(req.user.sub).lean();
    } else {
      r = sampleData.find((x) => x._id === req.user.sub);
    }
    if (!r) return res.status(404).json({ error: 'Restaurant not found' });
    const id = r._id ? String(r._id) : r.id;
    res.json({ id, email: r.email, name: r.name, verified: r.verified });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', userAuth, async (req, res) => {
  try {
    let u;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      u = await User.findById(req.user.sub);
    } else {
      u = inMemoryUsers.find((x) => x.id === req.user.sub);
    }
    if (!u) return res.status(404).json({ error: 'Not found' });
    const id = u._id ? String(u._id) : u.id;
    res.json({ id, email: u.email, name: u.name, verified: u.verified, phone: u.phone, city: u.city, address: u.address, role: u.role });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delivery Partner Auth
app.post('/api/delivery-auth/signup', async (req, res) => {
  try {
    const { email, name, password, phone, city } = req.body || {};
    if (!email || !password || !name) return res.status(400).json({ error: 'name, email, password required' });
    
    // Check if already registered and verified
    let existing;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      existing = await DeliveryPartner.findOne({ email: email.toLowerCase() });
    } else {
      existing = inMemoryDeliveryPartners.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
    }

    if (existing && existing.verified) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const token = String(Math.floor(1000 + Math.random() * 9000));
    
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      await Verification.findOneAndDelete({ email: email.toLowerCase() });
      await Verification.create({ 
        email: email.toLowerCase(), 
        token, 
        userData: { name, passwordHash: hashPassword(password), phone, city },
        role: 'delivery'
      });
    } else {
      const oldIdx = inMemoryVerifications.findIndex(v => v.email.toLowerCase() === String(email).toLowerCase());
      if (oldIdx !== -1) inMemoryVerifications.splice(oldIdx, 1);
      
      inMemoryVerifications.push({ 
        email: email.toLowerCase(), 
        token, 
        userData: { name, passwordHash: hashPassword(password), phone, city },
        role: 'delivery',
        createdAt: new Date() 
      });
    }
    
    const html = `
      <div style="font-family: 'Fraunces', Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #FAF9F6; border-radius: 20px;">
        <h1 style="color: #161B18; font-size: 28px; text-align: center; margin-bottom: 24px;">Welcome to Satvic Delivery</h1>
        <p style="color: #5A655E; font-size: 16px; line-height: 1.6; text-align: center;">
          To join our network of delivery partners, please verify your email with the code below:
        </p>
        <div style="background: #FFFFFF; border: 1px solid rgba(44, 51, 46, 0.06); border-radius: 14px; padding: 32px; margin: 32px 0; text-align: center;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #5F8B6E;">${token}</span>
        </div>
      </div>
    `;

    await maybeSendEmail(email, 'Verify your Satvic Delivery account', `Your verification code is ${token}`, html);
    res.status(201).json({ email, requiresVerification: true });
  } catch (e) {
    console.error('Delivery signup error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Create Delivery Partner
// DEPRECATED: use /api/admin/delivery-partners/create instead
app.post('/api/admin/delivery-partners', adminAuth, async (req, res) => {
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
        verified: true
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

// Remove old delivery signup endpoint
// ... other routes ...


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
    res.json({ id, email: dp.email, name: dp.name, status: dp.status, phone: dp.phone, city: dp.city });
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

app.post('/api/admin/delivery-partners/create', adminAuth, async (req, res) => {
  try {
    const { email, name, password } = req.body || {};
    if (!email || !password || !name) return res.status(400).json({ error: 'All fields required' });
    
    const emailLower = email.toLowerCase();
    
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const existing = await DeliveryPartner.findOne({ email: emailLower });
      if (existing) return res.status(400).json({ error: 'Email already exists' });
      
      const dp = await DeliveryPartner.create({
        name,
        email: emailLower,
        passwordHash: hashPassword(password),
        verified: true // Admin created partners are pre-verified
      });
      
      return res.status(201).json({ success: true, id: dp._id });
    }
    
    // In-memory fallback
    if (inMemoryDeliveryPartners.find(u => u.email.toLowerCase() === emailLower)) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const id = String(Date.now());
    const dp = { 
      id, 
      name, 
      email: emailLower, 
      passwordHash: hashPassword(password), 
      verified: true,
      assignedRestaurants: []
    };
    
    inMemoryDeliveryPartners.push(dp);
    res.status(201).json({ success: true, id });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/restaurants/:id/assign-dp', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { dpId } = req.body;
    if (!dpId) return res.status(400).json({ error: 'DP ID required' });

    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const restaurant = await Restaurant.findById(id);
      const dp = await DeliveryPartner.findById(dpId);
      
      if (!restaurant || !dp) return res.status(404).json({ error: 'Restaurant or DP not found' });

      // Add DP to restaurant's assigned list if not already there
      if (!restaurant.assignedDeliveryPartners.includes(dpId)) {
        restaurant.assignedDeliveryPartners.push(dpId);
        await restaurant.save();
      }

      // Add Restaurant to DP's assigned list if not already there
      if (!dp.assignedRestaurants.includes(id)) {
        dp.assignedRestaurants.push(id);
        await dp.save();
      }

      return res.json({ success: true });
    }
    
    // In-memory fallback
    const restaurant = sampleData.find(r => r._id === id);
    const dp = inMemoryDeliveryPartners.find(d => d.id === dpId);
    
    if (!restaurant || !dp) return res.status(404).json({ error: 'Not found' });

    if (!restaurant.assignedDeliveryPartners) restaurant.assignedDeliveryPartners = [];
    if (!restaurant.assignedDeliveryPartners.includes(dpId)) {
      restaurant.assignedDeliveryPartners.push(dpId);
    }

    if (!dp.assignedRestaurants) dp.assignedRestaurants = [];
    if (!dp.assignedRestaurants.includes(id)) {
      dp.assignedRestaurants.push(id);
    }

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/restaurants/:id/unassign-dp', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { dpId } = req.body;

    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      await Restaurant.findByIdAndUpdate(id, { $pull: { assignedDeliveryPartners: dpId } });
      await DeliveryPartner.findByIdAndUpdate(dpId, { $pull: { assignedRestaurants: id } });
      return res.json({ success: true });
    }

    const restaurant = sampleData.find(r => r._id === id);
    const dp = inMemoryDeliveryPartners.find(d => d.id === dpId);

    if (restaurant && restaurant.assignedDeliveryPartners) {
      restaurant.assignedDeliveryPartners = restaurant.assignedDeliveryPartners.filter(x => x !== dpId);
    }
    if (dp && dp.assignedRestaurants) {
      dp.assignedRestaurants = dp.assignedRestaurants.filter(x => x !== id);
    }

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/delivery/assigned-restaurants', deliveryPartnerAuth, async (req, res) => {
  try {
    const dpId = req.user.sub;
    let restaurants = [];

    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const dp = await DeliveryPartner.findById(dpId);
      if (!dp) return res.status(404).json({ error: 'DP not found' });
      
      restaurants = await Restaurant.find({ _id: { $in: dp.assignedRestaurants } }).lean();
      return res.json(restaurants.map(r => ({ ...r, id: String(r._id) })));
    }

    const dp = inMemoryDeliveryPartners.find(d => d.id === dpId);
    if (!dp) return res.status(404).json({ error: 'DP not found' });
    
    restaurants = sampleData.filter(r => (dp.assignedRestaurants || []).includes(r._id));
    res.json(restaurants);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/restaurants', adminAuth, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const list = await Restaurant.find({}).sort({ createdAt: -1 }).lean();
      return res.json(list.map(r => ({ ...r, id: String(r._id) })));
    }
    res.json(sampleData);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/delivery-partners/:id/verify', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const doc = await DeliveryPartner.findByIdAndUpdate(id, { verified: true }, { new: true });
      if (!doc) return res.status(404).json({ error: 'Not found' });
      res.json(doc);
    } else {
      const idx = inMemoryDeliveryPartners.findIndex(d => d.id === id);
      if (idx !== -1) {
        inMemoryDeliveryPartners[idx].verified = true;
        res.json(inMemoryDeliveryPartners[idx]);
      } else {
        res.status(404).json({ error: 'Not found' });
      }
    }
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/restaurants/:id/verify', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const doc = await Restaurant.findByIdAndUpdate(id, { verified: true }, { new: true });
      if (!doc) return res.status(404).json({ error: 'Not found' });
      res.json(doc);
    } else {
      const idx = sampleData.findIndex(r => r._id === id);
      if (idx !== -1) {
        sampleData[idx].verified = true;
        res.json(sampleData[idx]);
      } else {
        res.status(404).json({ error: 'Not found' });
      }
    }
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Create Restaurant Partner (Directly in Restaurant collection)
app.post('/api/admin/partners/create', adminAuth, async (req, res) => {
  try {
    const { email, name, password } = req.body || {};
    if (!email || !password || !name) return res.status(400).json({ error: 'All fields required' });
    
    const emailLower = email.toLowerCase();
    
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const existing = await Restaurant.findOne({ email: emailLower });
      if (existing) return res.status(400).json({ error: 'Email already exists for a restaurant' });
      
      const existingUser = await User.findOne({ email: emailLower });
      if (existingUser) return res.status(400).json({ error: 'Email already exists in User collection' });

      const restaurant = await Restaurant.create({
        name,
        email: emailLower,
        passwordHash: hashPassword(password),
        verified: false // Must complete KYC
      });
      
      return res.status(201).json({ success: true, partnerId: String(restaurant._id) });
    }
    
    // In-memory fallback
    if (sampleData.find(r => r.email?.toLowerCase() === emailLower)) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const restaurantId = 'r' + Date.now();
    const restaurant = {
      _id: restaurantId,
      name,
      email: emailLower,
      passwordHash: hashPassword(password),
      verified: false,
      assignedDeliveryPartners: []
    };
    
    sampleData.push(restaurant);
    res.status(201).json({ success: true, partnerId: restaurantId });
  } catch (e) {
    console.error("Partner creation error:", e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Create Delivery Partner (Directly in DeliveryPartner collection)
app.post('/api/admin/delivery-partners/create', adminAuth, async (req, res) => {
  try {
    const { email, name, password, phone, city } = req.body || {};
    if (!email || !password || !name) return res.status(400).json({ error: 'All fields required' });
    
    const emailLower = email.toLowerCase();
    
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const existing = await DeliveryPartner.findOne({ email: emailLower });
      if (existing) return res.status(400).json({ error: 'Email already exists' });
      
      const existingUser = await User.findOne({ email: emailLower });
      if (existingUser) return res.status(400).json({ error: 'Email already exists in User collection' });

      const dp = await DeliveryPartner.create({
        name,
        email: emailLower,
        passwordHash: hashPassword(password),
        phone,
        city,
        verified: true // Admin created partners are pre-verified
      });
      
      return res.status(201).json({ success: true, id: dp._id });
    }
    
    // In-memory fallback
    if (inMemoryDeliveryPartners.find(u => u.email.toLowerCase() === emailLower)) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const id = String(Date.now());
    const dp = { 
      id, 
      name, 
      email: emailLower, 
      passwordHash: hashPassword(password), 
      phone,
      city,
      verified: true,
      assignedRestaurants: []
    };
    
    inMemoryDeliveryPartners.push(dp);
    res.status(201).json({ success: true, id });
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
      stats.restaurants = await Restaurant.countDocuments({});
      stats.partners = await PartnerSubmission.countDocuments({});
      stats.deliveryPartners = await DeliveryPartner.countDocuments({});
      stats.deliveries = await Delivery.countDocuments({});
      stats.users = await User.countDocuments({ role: 'user' });
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
    
    const query = { verified: true };
    if (city && city.trim()) query.city = city;
    if (satvikType && satvikType.trim()) query.satvikType = satvikType;

    let results = await Model.find(query);

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
    const { userId, restaurantId, planId, deliveryAddress, deliveryTime, selectedItems } = req.body || {};
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

    const subData = {
      userId,
      restaurantId,
      planId,
      status: 'active',
      endDate,
      deliveryAddress: deliveryAddress || '',
      deliveryTime: deliveryTime || '12:00',
      selectedItems: Array.isArray(selectedItems) ? selectedItems : [],
      remainingMeals: plan.type === 'daily_meal' ? plan.durationDays : undefined,
    };

    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const doc = await UserSubscription.create(subData);
      return res.status(201).json({ id: String(doc._id), status: doc.status });
    }
    const id = String(Date.now());
    inMemorySubs.push({ ...subData, id, createdAt: new Date() });
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

app.post('/api/orders/:id/cancel', userAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;

    let order;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      order = await Order.findById(id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      if (order.userId !== userId) return res.status(403).json({ error: 'Forbidden' });
      if (order.status !== 'PLACED') return res.status(400).json({ error: 'Order cannot be cancelled now' });
      
      order.status = 'CANCELLED';
      await order.save();
    } else {
      order = inMemoryOrders.find(x => x.id === id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      if (order.userId !== userId) return res.status(403).json({ error: 'Forbidden' });
      if (order.status !== 'PLACED') return res.status(400).json({ error: 'Order cannot be cancelled' });
      
      order.status = 'CANCELLED';
    }
    
    await notifyRestaurant(order.restaurantId, 'Order Cancelled', `Order #${(order._id ? String(order._id) : order.id).slice(-6)} has been cancelled by the user.`);
    res.json({ success: true, status: 'CANCELLED' });
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

// --- Order Management Endpoints ---

// Partner: Update Order Status (ACCEPTED, PREPARING, READY)
app.post('/api/partner/orders/:id/status', partnerAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.sub;

    if (!['ACCEPTED', 'PREPARING', 'READY', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status transition for partner' });
    }

    let order;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      order = await Order.findById(id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      
      const restaurant = await Restaurant.findById(order.restaurantId);
      if (!restaurant || restaurant.ownerId !== userId) {
        return res.status(403).json({ error: 'Forbidden: You do not own this restaurant' });
      }

      const updateData = { status };
      if (status === 'ACCEPTED') updateData.acceptedAt = new Date();
      if (status === 'READY') updateData.readyAt = new Date();
      
      order = await Order.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      order = inMemoryOrders.find(x => x.id === id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      
      const restaurant = sampleData.find(r => r._id === order.restaurantId);
      if (restaurant && restaurant.ownerId && restaurant.ownerId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const updateData = { status };
      if (status === 'ACCEPTED') updateData.acceptedAt = new Date();
      if (status === 'READY') updateData.readyAt = new Date();
      Object.assign(order, updateData);
    }

    const orderIdShort = (order._id ? String(order._id) : order.id).slice(-6);
    if (status === 'ACCEPTED') {
      await notifyUser(order.userId, 'Order Accepted', `Your order #${orderIdShort} has been accepted by the restaurant.`);
    } else if (status === 'READY') {
      await notifyUser(order.userId, 'Order Ready', `Your order #${orderIdShort} is ready and will be picked up soon.`);
      // Admin will now see this order as ready for assignment
    }

    res.json({ id: order._id ? String(order._id) : order.id, status: order.status });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Assign Delivery Partner
app.post('/api/admin/orders/:id/assign', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryPartnerId } = req.body;
    if (!deliveryPartnerId) return res.status(400).json({ error: 'Delivery partner ID required' });

    let order;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      order = await Order.findById(id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      if (order.status !== 'READY') return res.status(400).json({ error: 'Order must be READY before assignment' });

      order.status = 'ASSIGNED';
      order.deliveryPartnerId = deliveryPartnerId;
      order.assignedAt = new Date();
      await order.save();
    } else {
      order = inMemoryOrders.find(x => x.id === id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      if (order.status !== 'READY') return res.status(400).json({ error: 'Order not ready' });

      order.status = 'ASSIGNED';
      order.deliveryPartnerId = deliveryPartnerId;
      order.assignedAt = new Date();
    }

    const orderIdShort = (order._id ? String(order._id) : order.id).slice(-6);
    await notifyUser(order.userId, 'Delivery Partner Assigned', `A delivery partner has been assigned to your order #${orderIdShort}.`);
    await notifyDeliveryPartner(deliveryPartnerId, 'New Delivery Assigned', `You have been assigned a new delivery #${orderIdShort}.`);

    res.json({ success: true, status: 'ASSIGNED' });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delivery Partner: View Available Orders
app.get('/api/delivery/available-orders', deliveryPartnerAuth, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      const list = await Order.find({ status: 'READY' }).sort({ readyAt: 1 }).lean();
      return res.json(list.map(o => ({ ...o, id: String(o._id) })));
    }
    res.json(inMemoryOrders.filter(o => o.status === 'READY').sort((a, b) => a.readyAt - b.readyAt));
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delivery Partner: Accept Order for Delivery
app.post('/api/delivery/orders/:id/accept', deliveryPartnerAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const dpId = req.user.sub;

    let order;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      order = await Order.findById(id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      if (order.status !== 'READY') return res.status(400).json({ error: 'Order is not ready for pickup' });
      
      order = await Order.findByIdAndUpdate(id, { 
        status: 'ASSIGNED', 
        deliveryPartnerId: dpId,
        assignedAt: new Date()
      }, { new: true });
    } else {
      order = inMemoryOrders.find(x => x.id === id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      if (order.status !== 'READY') return res.status(400).json({ error: 'Order not ready' });
      
      Object.assign(order, { 
        status: 'ASSIGNED', 
        deliveryPartnerId: dpId,
        assignedAt: new Date()
      });
    }

    const orderIdShort = (order._id ? String(order._id) : order.id).slice(-6);
    await notifyUser(order.userId, 'Delivery Partner Assigned', `A delivery partner has been assigned to your order #${orderIdShort}.`);
    
    res.json({ id: order._id ? String(order._id) : order.id, status: order.status });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delivery Partner: Update Delivery Status (PICKED, DELIVERED)
app.post('/api/delivery/orders/:id/status', deliveryPartnerAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const dpId = req.user.sub;

    if (!['PICKED', 'DELIVERED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status transition for delivery partner' });
    }

    let order;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      order = await Order.findById(id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      if (order.deliveryPartnerId !== dpId) return res.status(403).json({ error: 'Forbidden' });

      const updateData = { status };
      if (status === 'PICKED') updateData.pickedAt = new Date();
      if (status === 'DELIVERED') updateData.deliveredAt = new Date();
      
      order = await Order.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      order = inMemoryOrders.find(x => x.id === id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      if (order.deliveryPartnerId !== dpId) return res.status(403).json({ error: 'Forbidden' });

      const updateData = { status };
      if (status === 'PICKED') updateData.pickedAt = new Date();
      if (status === 'DELIVERED') updateData.deliveredAt = new Date();
      Object.assign(order, updateData);
    }

    const orderIdShort = (order._id ? String(order._id) : order.id).slice(-6);
    if (status === 'PICKED') {
      await notifyUser(order.userId, 'Order Picked Up', `Your order #${orderIdShort} has been picked up and is on its way.`);
    } else if (status === 'DELIVERED') {
      await notifyUser(order.userId, 'Order Delivered', `Your order #${orderIdShort} has been delivered. Enjoy your meal!`);
    }

    res.json({ id: order._id ? String(order._id) : order.id, status: order.status });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/orders/:id/status', async (req, res) => {
  // Keeping this for backward compatibility but routing to correct logic internally if possible
  // or just keeping it simple for admin/test purposes
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updateData = { status };
    if (status === 'ACCEPTED') updateData.acceptedAt = new Date();
    if (status === 'READY') updateData.readyAt = new Date();
    if (status === 'ASSIGNED') updateData.assignedAt = new Date();
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
    const updateData = { ...req.body };
    
    // Strip restricted fields
    delete updateData._id;
    delete updateData.id;
    delete updateData.__v;
    delete updateData.ownerId;

    // Check if this is a KYC submission
    const isKycSubmission = updateData.phone || updateData.city || updateData.address;
    if (isKycSubmission) {
      console.log(`[KYC Submission] Auto-verifying restaurant for ID/OwnerID: ${id}`);
      updateData.verified = true; 
    }

    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      // Try finding by _id first, then by ownerId
      let doc = await Restaurant.findByIdAndUpdate(id, updateData, { new: true });
      if (!doc) {
        doc = await Restaurant.findOneAndUpdate({ ownerId: id }, updateData, { new: true });
      }
      
      if (!doc) return res.status(404).json({ error: 'Restaurant not found' });
      res.json(doc);
    } else {
      let idx = sampleData.findIndex(r => r._id === id);
      if (idx === -1) idx = sampleData.findIndex(r => r.ownerId === id);

      if (idx !== -1) {
        sampleData[idx] = { ...sampleData[idx], ...updateData };
        res.json(sampleData[idx]);
      } else {
        res.status(404).json({ error: 'Not found' });
      }
    }
  } catch (e) {
    console.error("PUT /api/restaurants/:id error:", e.message);
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
    const { id } = req.params;
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      // Try finding by _id first, then by ownerId
      let restaurant = await Restaurant.findById(id).lean();
      if (!restaurant) {
        restaurant = await Restaurant.findOne({ ownerId: id }).lean();
      }
      
      if (!restaurant) return res.status(404).json({ error: 'Not found' });
      return res.json({ ...restaurant, id: String(restaurant._id) });
    }
    
    let restaurant = sampleData.find((r) => r._id === id);
    if (!restaurant) restaurant = sampleData.find((r) => r.ownerId === id);
    
    if (!restaurant) return res.status(404).json({ error: 'Not found' });
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
    
    // Find owner user by email
    const ownerEmail = profile.email || '';
    let ownerUser = inMemoryUsers.find(u => u.email.toLowerCase() === ownerEmail.toLowerCase());
    
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
      ownerId: ownerUser ? ownerUser.id : undefined,
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
      
      if (ownerUser) {
        ownerUser.partnerId = String(created._id);
      }

      return res.json({
        id: String(created._id),
        status: 'approved',
        restaurantId: String(created._id),
      });
    }
    const newRestaurant = { ...restaurantData, _id: String(sampleData.length + 1) };
    sampleData.push(newRestaurant);
    const inMem = inMemorySubmissions.find((s) => s.id === id);
    if (inMem) inMem.status = 'approved';
    
    if (ownerUser) {
      ownerUser.partnerId = newRestaurant._id;
    }

    res.json({
      id: submission.id,
      status: 'approved',
      restaurantId: newRestaurant._id,
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

// --- Auto-Order Generation for Subscriptions ---
async function checkAndSpawnSubscriptionOrders() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    let activeSubs = [];
    if (mongoose.connection.readyState === 1 && MONGO_URI) {
      activeSubs = await UserSubscription.find({ status: 'active' });
    } else {
      activeSubs = inMemorySubs.filter(s => s.status === 'active');
    }

    for (const sub of activeSubs) {
      // 1. Skip if already ordered today
      if (sub.lastOrderDate === today) continue;

      // 2. Parse delivery time (e.g., "12:00")
      const [h, m] = (sub.deliveryTime || "12:00").split(':').map(Number);
      const deliveryDate = new Date();
      deliveryDate.setHours(h, m, 0, 0);

      // 3. Check if current time is 30 mins before delivery time
      const leadTimeMs = 30 * 60 * 1000;
      const spawnTime = deliveryDate.getTime() - leadTimeMs;

      if (now.getTime() >= spawnTime && now.getTime() < deliveryDate.getTime()) {
        console.log(`[SUBSCRIPTION] Spawning order for User ${sub.userId} from Restaurant ${sub.restaurantId}`);
        
        const orderData = {
          restaurantId: sub.restaurantId,
          userId: sub.userId,
          items: sub.selectedItems,
          totalPrice: 0, // Subscription orders are prepaid
          paymentStatus: 'paid',
          deliveryAddress: sub.deliveryAddress,
          status: 'PLACED',
          isSubscriptionOrder: true,
          createdAt: new Date()
        };

        if (mongoose.connection.readyState === 1 && MONGO_URI) {
          const newOrder = await Order.create(orderData);
          sub.lastOrderDate = today;
          if (sub.remainingMeals != null) sub.remainingMeals -= 1;
          await sub.save();
          
          const orderIdShort = String(newOrder._id).slice(-6);
          await notifyUser(sub.userId, 'Subscription Order Placed', `Your daily subscription meal order #${orderIdShort} has been placed for ${sub.deliveryTime}.`);
        } else {
          const newOrder = { ...orderData, id: String(Date.now() + Math.random()) };
          inMemoryOrders.push(newOrder);
          sub.lastOrderDate = today;
          if (sub.remainingMeals != null) sub.remainingMeals -= 1;
          
          await notifyUser(sub.userId, 'Subscription Order Placed', `Your daily subscription meal order #${newOrder.id.slice(-6)} has been placed for ${sub.deliveryTime}.`);
        }
      }
    }
  } catch (e) {
    console.error('Error spawning subscription orders:', e.message);
  }
}

connectMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
  });
  setInterval(escalateCheck, 60000);
  setInterval(checkAndSpawnSubscriptionOrders, 5 * 60000); // Check every 5 mins
  checkAndSpawnSubscriptionOrders(); // Initial check
});
