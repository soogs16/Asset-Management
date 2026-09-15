const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. MySQL Database Connection Pool
// Database connection reading from Environment Variables
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ams',
  port: process.env.DB_PORT || 3306,
  ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false
});

// Test Connection on Startup
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ DB Connection Error:', err.message);
  } else {
    console.log('✅ Connected to MySQL database "ams" successfully!');
    connection.release();
  }
});

// ====================================================
// 🔐 AUTHENTICATION ROUTES
// ====================================================

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log(`🔐 Login attempt for: ${email}`);

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const sql = 'SELECT * FROM users WHERE email = ? LIMIT 1';

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error('❌ SQL Auth Error:', err.message);
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = results[0];

    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log(`✅ Login successful for: ${user.email} (${user.role})`);

    res.json({
      message: 'Login successful',
      token: 'demo-token-' + Date.now(),
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        unit: user.unit || 'General'
      }
    });
  });
});

// POST /api/auth/register
// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { full_name, email, password, unit } = req.body;

  if (!full_name || !email || !password || !unit) {
    return res.status(400).json({ error: 'Full name, email, password, and unit are required' });
  }

  // Force every new signup to staff
  const userRole = 'staff';
  const userUnit = unit || 'General';

  const sql = `
    INSERT INTO users (full_name, email, password, role, unit)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [full_name, email, password, userRole, userUnit], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      console.error('❌ Register SQL Error:', err.message);
      return res.status(500).json({ error: err.message });
    }

    console.log(`✅ User registered as staff in unit: ${userUnit}`);
    res.json({ message: 'User registered successfully', id: result.insertId });
  });
});

// ====================================================
// 👥 USER DIRECTORY ROUTES
// ====================================================

// Shared SQL: all users + assigned asset count
const ALL_USERS_SQL = `
  SELECT 
    u.id,
    u.full_name,
    u.email,
    u.role,
    COALESCE(u.unit, 'General') AS unit,
    COUNT(a.asset_id) AS assigned_items
  FROM users u
  LEFT JOIN assets a
    ON LOWER(TRIM(a.assignee)) = LOWER(TRIM(u.full_name))
  GROUP BY u.id, u.full_name, u.email, u.role, u.unit
  ORDER BY u.full_name ASC
`;

// GET /api/users - Fetch ALL users (admin, manager, staff)
app.get('/api/users', (req, res) => {
  console.log('📡 GET /api/users request received');

  db.query(ALL_USERS_SQL, (err, results) => {
    if (err) {
      console.error('❌ SQL Users Error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// GET /api/users/staff - kept for compatibility (now also returns ALL users)
app.get('/api/users/staff', (req, res) => {
  console.log('📡 GET /api/users/staff request received');

  db.query(ALL_USERS_SQL, (err, results) => {
    if (err) {
      console.error('❌ SQL Staff Error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// GET /api/users/:id - Fetch single user + their assigned assets
// IMPORTANT: this must stay AFTER /api/users and /api/users/staff
app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  console.log(`📡 GET /api/users/${userId}`);

  const userSql = `
    SELECT id, full_name, email, role, COALESCE(unit, 'General') AS unit, created_at
    FROM users
    WHERE id = ?
  `;

  db.query(userSql, [userId], (err, userResults) => {
    if (err) {
      console.error('❌ SQL GET User Error:', err.message);
      return res.status(500).json({ error: err.message });
    }

    if (userResults.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResults[0];
    const assetsSql = `
      SELECT *
      FROM assets
      WHERE LOWER(TRIM(assignee)) = LOWER(TRIM(?))
      ORDER BY asset_id DESC
    `;

    db.query(assetsSql, [user.full_name], (err, assetResults) => {
      if (err) {
        console.error('❌ SQL GET User Assets Error:', err.message);
        return res.status(500).json({ error: err.message });
      }

      res.json({
        user: user,
        assets: assetResults
      });
    });
  });
});

// ====================================================
// 📊 DASHBOARD STATS ROUTE
// ====================================================

// GET /api/dashboard/stats
app.get('/api/dashboard/stats', (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) AS total_assets,
      SUM(CASE WHEN LOWER(status) = 'active' THEN 1 ELSE 0 END) AS active_assets,
      SUM(
        CASE 
          WHEN LOWER(status) LIKE '%maintenance%' 
            OR LOWER(asset_condition) IN ('needs repair', 'damaged') 
          THEN 1 ELSE 0 
        END
      ) AS maintenance_assets,
      COALESCE(SUM(price), 0) AS total_value
    FROM assets
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ SQL Stats Error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(results[0]);
  });
});

// ====================================================
// 📦 ASSET MANAGEMENT ROUTES
// ====================================================

// GET /api/assets - All assets
app.get('/api/assets', (req, res) => {
  const sql = 'SELECT * FROM assets ORDER BY asset_id DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET /api/assets/:id - Single asset
app.get('/api/assets/:id', (req, res) => {
  const sql = 'SELECT * FROM assets WHERE asset_id = ?';
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Asset not found' });
    res.json(results[0]);
  });
});

// POST /api/assets - Create new asset
app.post('/api/assets', (req, res) => {
  const assetName = req.body.asset_name || req.body.name || 'Unnamed Asset';
  const category = req.body.category || 'General';
  const parsedPrice = parseFloat(req.body.price);
  const price = isNaN(parsedPrice) ? 0.00 : parsedPrice;

  let purchaseDate = req.body.purchase_date;
  if (!purchaseDate || purchaseDate === '' || purchaseDate === 'Invalid Date') {
    purchaseDate = null;
  }

  const location = req.body.location || '';
  const vendor = req.body.vendor || '';
  const assignee = req.body.assignee || '';
  const status = req.body.status || 'Active';
  const assetCondition = req.body.asset_condition || 'Good';

  const sql = `
    INSERT INTO assets 
    (asset_name, category, price, purchase_date, location, vendor, assignee, status, asset_condition) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    assetName,
    category,
    price,
    purchaseDate,
    location,
    vendor,
    assignee,
    status,
    assetCondition
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Asset created successfully', id: result.insertId });
  });
});

// DELETE /api/assets/:id
app.delete('/api/assets/:id', (req, res) => {
  const sql = 'DELETE FROM assets WHERE asset_id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Asset deleted successfully' });
  });
});

// ====================================================
// 🚀 START SERVER ON PORT 5000
// ====================================================
const PORT = 5000;
// PUT /api/users/:id/role - Admin assigns role
// PUT /api/users/:id/role - Update User Role
app.put('/api/users/:id/role', (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  console.log(`📝 Updating User ${userId} to Role: ${role}`);

  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }

  const newRole = role.toLowerCase();
  const allowedRoles = ['staff', 'manager', 'admin'];

  if (!allowedRoles.includes(newRole)) {
    return res.status(400).json({ error: 'Invalid role. Choose staff, manager, or admin' });
  }

  const sql = 'UPDATE users SET role = ? WHERE id = ?';

  db.query(sql, [newRole, userId], (err, result) => {
    if (err) {
      console.error('❌ SQL Role Update Error:', err.message);
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`✅ Successfully updated User ${userId} role to: ${newRole}`);
    res.json({ message: 'Role updated successfully', role: newRole });
  });
});
app.put('/api/assets/:id', (req, res) => {
  const assetId = req.params.id;
  const { asset_name, category, price, purchase_date, location, vendor, assignee, status, asset_condition } = req.body;

  const sql = `
    UPDATE assets 
    SET asset_name=?, category=?, price=?, purchase_date=?, location=?, vendor=?, assignee=?, status=?, asset_condition=?
    WHERE asset_id=?
  `;

  const values = [
    asset_name, category, price ? parseFloat(price) : 0, 
    purchase_date || null, location, vendor, assignee, status, asset_condition, assetId
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Asset updated successfully' });
  });
});

// POST /api/maintenance - Report an issue (Feature D)
app.post('/api/maintenance', (req, res) => {
  const { asset_id, reported_by, issue } = req.body;

  // 1. Create the ticket
  const ticketSql = `INSERT INTO maintenance_tickets (asset_id, reported_by, issue) VALUES (?, ?, ?)`;
  
  db.query(ticketSql, [asset_id, reported_by, issue], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    // 2. Automatically change the asset's status to 'In Maintenance'
    const updateAssetSql = `UPDATE assets SET status = 'In Maintenance', asset_condition = 'Needs Repair' WHERE asset_id = ?`;
    db.query(updateAssetSql, [asset_id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: 'Issue reported and asset status updated!' });
    });
  });
});

// GET /api/assets/:id/maintenance - Get ticket history for an asset
app.get('/api/assets/:id/maintenance', (req, res) => {
  const sql = `SELECT * FROM maintenance_tickets WHERE asset_id = ? ORDER BY created_at DESC`;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// PUT /api/maintenance/:id/resolve - Mark ticket as resolved
app.put('/api/maintenance/:id/resolve', (req, res) => {
  const ticketId = req.params.id;
  const { asset_id } = req.body;

  // 1. Mark ticket resolved
  const resolveSql = `UPDATE maintenance_tickets SET status = 'Resolved', resolved_at = NOW() WHERE id = ?`;
  db.query(resolveSql, [ticketId], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    // 2. Automatically return asset to 'Active'
    const fixAssetSql = `UPDATE assets SET status = 'Active', asset_condition = 'Good' WHERE asset_id = ?`;
    db.query(fixAssetSql, [asset_id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: 'Ticket resolved and asset is active again!' });
    });
  });
});
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});