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

  create(id, originalUrl, shortUrl) {
    return this.dao.run(
      'INSERT INTO urls (id, original_url, new_url) VALUES (?, ?, ?)',
      [id, originalUrl, shortUrl])
  }

  getAllByUserId(id) {
    return this.dao.all(`SELECT DISTINCT urls.original_url, urls.new_url
      FROM urls, user_access
      where urls.id = user_access.url_id and user_access.user_id = ?`,
      [id])
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

  getByShortUrl(url) {
    return this.dao.get(
      `SELECT * FROM urls WHERE new_url = ?`,
      [url])
  }

  getMaxId() {
    return this.dao.get(`SELECT MAX(id) AS id FROM urls`)
  }

}
module.exports = UrlRepository
