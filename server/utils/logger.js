import pkg from 'pg';
const { Pool } = pkg;

// PostgreSQL connection for logging
const pool = new Pool({
  connectionString: process.env.POSTGRES_URI,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize logs table if it doesn't exist
const initLogTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        action VARCHAR(100) NOT NULL,
        project_id VARCHAR(255),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Activity logs table initialized');
  } catch (error) {
    console.error('Error initializing logs table:', error);
  }
};

// Initialize on startup
initLogTable();

export const logActivity = async ({ userId, action, projectId, metadata = {} }) => {
  try {
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, project_id, metadata) VALUES ($1, $2, $3, $4)',
      [userId, action, projectId, JSON.stringify(metadata)]
    );
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

export const getActivityLogs = async (projectId, limit = 50, offset = 0) => {
  try {
    const result = await pool.query(
      'SELECT * FROM activity_logs WHERE project_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [projectId, limit, offset]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return [];
  }
};