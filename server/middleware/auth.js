import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Insufficient permissions' });
    }
  };
};

export const rateLimiter = (maxRequests, windowMs) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    
    if (!requests.has(key)) {
      requests.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const requestData = requests.get(key);
    
    if (now > requestData.resetTime) {
      requests.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (requestData.count >= maxRequests) {
      return res.status(429).json({ message: 'Too many requests' });
    }
    
    requestData.count++;
    next();
  };
};