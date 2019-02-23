class UrlRepository {

  constructor(dao) {
    this.dao = dao
  }

  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS urls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      original_url TEXT,
      new_url TEXT)`
    return this.dao.run(sql)
  }

  create(id, userId, originalUrl, shortUrl) {
    return this.dao.run(
      'INSERT INTO urls (id, user_id, original_url, new_url) VALUES (?, ?, ?, ?)',
      [id, userId, originalUrl, shortUrl])
  }

  getAllByUserId(id) {
    return this.dao.all(`SELECT * FROM urls where user_id = ?`, [id])
  }

  getById(id) {
    return this.dao.get(
      `SELECT * FROM urls WHERE id = ?`,
      [id])
  }

  getByLongUrl(url) {
    return this.dao.get(
      `SELECT * FROM urls WHERE original_url = ?`,
      [url])
  }

  getMaxId() {
    return this.dao.get(`SELECT MAX(id) AS id FROM urls`)
  }

}
module.exports = UrlRepository
