class UserAccessRepository {

  constructor(dao) {
    this.dao = dao
  }

  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS user_access (
      user_id INTEGER,
      url_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (url_id) REFERENCES urls(id)
      )`
    return this.dao.run(sql)
  }

  create(userId, urlId) {
    return this.dao.run(
      'INSERT INTO user_access (user_id, url_id) VALUES (?, ?)',
      [userId, urlId])
  }
}

module.exports = UserAccessRepository
