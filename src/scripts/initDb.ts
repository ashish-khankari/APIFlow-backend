import pool from "../config/database";

const createTables = async () => {
  try {
    console.log("⏳ Connecting to database to create tables...");

    // 1. Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT NOT NULL AUTO_INCREMENT,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        password VARCHAR(100) NOT NULL,
        company_name VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY email (email)
      );
    `);
    console.log("✅ Table 'users' verified/created");

    // 2. Flow table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS flow (
        id INT NOT NULL AUTO_INCREMENT,
        user_id INT NOT NULL,
        flow_name VARCHAR(50) NOT NULL,
        flow_description VARCHAR(100) NOT NULL,
        token_key VARCHAR(60) DEFAULT NULL,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY user_id (user_id),
        CONSTRAINT flow_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);
    console.log("✅ Table 'flow' verified/created");

    // 3. Node table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS node (
        id INT NOT NULL AUTO_INCREMENT,
        node_title VARCHAR(40) NOT NULL,
        node_description VARCHAR(80) DEFAULT NULL,
        node_order INT NOT NULL,
        flow_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY flow_order_unique (flow_id, node_order),
        KEY user_id (user_id),
        CONSTRAINT node_ibfk_1 FOREIGN KEY (flow_id) REFERENCES flow (id) ON DELETE CASCADE,
        CONSTRAINT node_ibfk_2 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);
    console.log("✅ Table 'node' verified/created");

    // 4. Node API table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS node_api (
        id INT NOT NULL AUTO_INCREMENT,
        node_id INT NOT NULL,
        flow_id INT NOT NULL,
        user_id INT NOT NULL,
        node_api_method ENUM('POST','PUT','DELETE','GET','PATCH') NOT NULL DEFAULT 'GET',
        node_api_base_url VARCHAR(255) NOT NULL,
        node_api_end_point VARCHAR(255) NOT NULL,
        node_api_token TEXT,
        node_api_headers JSON DEFAULT NULL,
        node_api_request_body JSON DEFAULT NULL,
        node_api_query JSON DEFAULT NULL,
        node_api_params JSON DEFAULT NULL,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY node_id (node_id),
        KEY flow_id (flow_id),
        KEY user_id (user_id),
        CONSTRAINT node_api_ibfk_1 FOREIGN KEY (node_id) REFERENCES node (id) ON DELETE CASCADE,
        CONSTRAINT node_api_ibfk_2 FOREIGN KEY (flow_id) REFERENCES flow (id) ON DELETE CASCADE,
        CONSTRAINT node_api_ibfk_3 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);
    console.log("✅ Table 'node_api' verified/created");

    // 5. Execution log table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS execution_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        run_id VARCHAR(36) NOT NULL UNIQUE,
        flow_id INT NOT NULL,
        user_id INT NOT NULL,
        status ENUM('completed', 'failed') NOT NULL,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        FOREIGN KEY (flow_id) REFERENCES flow(id) ON DELETE CASCADE
      );
    `);
    console.log("✅ Table 'execution_log' verified/created");

    // 6. Execution step log table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS execution_step_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        run_id VARCHAR(36) NOT NULL,
        node_id INT NOT NULL,
        node_title VARCHAR(255),
        node_order INT NOT NULL,
        status ENUM('success', 'failed') NOT NULL,
        status_code INT,
        response_body JSON,
        duration_ms INT,
        error_message TEXT,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (run_id) REFERENCES execution_log(run_id) ON DELETE CASCADE
      );
    `);
    console.log("✅ Table 'execution_step_log' verified/created");

    console.log("🎉 All tables created successfully in Aiven MySQL!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create tables:", error);
    process.exit(1);
  }
};

createTables();
