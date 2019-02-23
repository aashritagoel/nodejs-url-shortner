class UrlRepository {

  constructor(dao) {
    this.dao = dao
  }

  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS urls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      original_url TEXT,
      new_url TEXT)`
    return this.dao.run(sql)
  }

  create(original_url, new_url) {
    return this.dao.run(
      'INSERT INTO urls (original_url, new_url) VALUES (?, ?)',
      [original_url, new_url])
  }

  getAll() {
    return this.dao.all(`SELECT * FROM urls`)
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
