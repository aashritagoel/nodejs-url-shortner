class UserRepository {
  constructor(dao) {
    this.dao = dao
  }

  createUserTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        email TEXT,
        user_provider TEXT,
        isAuthenticated INTEGER DEFAULT 0
        )`
    return this.dao.run(sql)
  }

  createUserKeyTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS user_key (
        id INTEGER PRIMARY KEY,
        password TEXT,
        FOREIGN KEY (id) REFERENCES users(id)
        )`
    return this.dao.run(sql)
  }

  createUserValidateTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS user_validate (
        email Text PRIMARY KEY,
        secret_key INTEGER
        )`
    return this.dao.run(sql)
  }

  createUser(username, email, provider) {
    return this.dao.run(
      'INSERT INTO users (username, email, user_provider) VALUES (?, ?, ?)',
      [username, email, provider])
  }

  create(username, email, password) {
    return this.createUser(username, email, "custom")
    .then((user) => {
      if(user) {
        this.dao.run(
        'INSERT INTO user_key (id, password) VALUES (?, ?)',
        [user.id, password]);
      }
    });
  }

  addSecret(email, secret) {
    return this.dao.run('INSERT INTO user_validate (email, secret_key) VALUES (?, ?)',
      [email, secret]);
  }

  checkSecret(email, secret) {
    return this.dao.get('SELECT * FROM user_validate WHERE email = ? and secret_key = ?',
      [email, secret]);
  }

  updateStatus(email) {
    return this.dao.run('UPDATE users SET isAuthenticated= 1 WHERE email = ?',
      [email]);
  }

  getByUsername(name) {
    return this.dao.get(
      `SELECT * FROM users WHERE username = ?`,
      [name])
  }

  getUserKey(id) {
    return this.dao.get(
      `SELECT * FROM user_key WHERE id = ?`,
      [id])
  }

  getByEmail(email) {
    return this.dao.get(
      `SELECT * FROM users WHERE email = ?`,
      [email])
  }

  getById(id) {
    return this.dao.get(
      `SELECT * FROM users WHERE id = ?`,
      [id])
  }
}

module.exports = UserRepository
