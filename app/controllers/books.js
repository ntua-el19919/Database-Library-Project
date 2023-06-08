const { pool } = require('../utils/database');

/* Controller to retrieve books from database */
exports.getBooks = (req, res, next) => {

    /* check for messages in order to show them when rendering the page */
    let messages = req.flash("messages");
    if (messages.length == 0) messages = [];

    const { searchFilter, searchTerm } = req.query;
    const sqlParams = [];
    const schoolId = req.session.schoolId;
  
    let sqlQuery = `SELECT b.isbn, b.title, b.publisher, b.pages, b.summary, b.available_copies, b.image, b.language, b.keywords, c.name, CONCAT(a.first_name, ' ', a.last_name) AS author_name
                    FROM book b
                    JOIN author a ON b.author_id = a.author_id
                    JOIN category c ON b.category_id = c.category_id `;

  
    if (searchFilter && searchTerm) {
      switch (searchFilter) {
        case 'title':
          sqlQuery += ' WHERE b.title LIKE ?';
          sqlParams.push(`%${searchTerm}%`);
          break;
        case 'name':
          sqlQuery += ' WHERE c.name LIKE ?';
          sqlParams.push(`%${searchTerm}%`);
          break;
        case 'author_name':
          sqlQuery += ` WHERE CONCAT(a.first_name, ' ', a.last_name) LIKE ?`;
          sqlParams.push(searchTerm);
          break;
        case 'available_copies':
          sqlQuery += ' WHERE b.available_copies = ?';
          sqlParams.push(searchTerm);
          break;
      }
    }
    
    sqlQuery += ' AND school_id = ?';
    sqlParams.push(schoolId);
    /* create the connection, execute query, render data */
    pool.getConnection((err, conn) => {
        if (err) {
            console.error('Error acquiring database connection:', err);
            return next(err);
          }
        conn.promise().query(sqlQuery, sqlParams)
        .then(([rows, books]) => {
            res.render('books.ejs', {
                pageTitle: "Books Page",
                books: rows,
                messages: messages,
                searchFilter: searchFilter,
                searchTerm: searchTerm
              });
        })
        .then(() => pool.releaseConnection(conn))
        .catch(err => console.log(err))
    })

}


exports.updateBook = (req, res, next) => {
  const isbn = req.body.isbn;
  const updatedFields = {};
  const category_name = req.body.name;
  const author_name = req.body.author_name;
  // Check if each field is provided in the request body and add it to the updatedFields object
  if (req.body.title) {
    updatedFields.title = req.body.title;
  }
  if (req.body.publisher) {
    updatedFields.publisher = req.body.publisher;
  }
  if (req.body.pages) {
    updatedFields.pages = req.body.pages;
  }
  // Add other fields here
  if (req.body.summary) {
    updatedFields.summary = req.body.summary;
  }
  if (req.body.available_copies) {
    updatedFields.available_copies = req.body.available_copies;
  }
  if (req.body.image) {
    updatedFields.image = req.body.image;
  }
  if (req.body.language) {
    updatedFields.language = req.body.language;
  }
  if (req.body.keywords) {
    updatedFields.keywords = req.body.keywords;
  }

  const sqlParams = [];
  let sqlQuery = 'UPDATE book';
  if(category_name){
    sqlQuery += ` 
                SET book.category_id = (
                SELECT category_id FROM category WHERE name = ?
                ),`;
                sqlParams.push(category_name);
    }
    if(author_name){
      sqlQuery += ` book.author_id = (
                  SELECT author_id FROM author WHERE CONCAT(first_name, ' ', last_name) = ?
                  ),`;
                  sqlParams.push(author_name);
      }

  // Loop through the updatedFields object to build the SQL query and collect the corresponding parameter values
  Object.entries(updatedFields).forEach(([key, value], index) => {
    sqlQuery += ` ${key} = ?`;
    sqlParams.push(value);
    if (index < Object.keys(updatedFields).length - 1) {
      sqlQuery += ',';
    }
  });

  sqlQuery += ' WHERE isbn = ?';
  sqlParams.push(isbn);

  pool.getConnection((err, conn) => {
    if (err) {
      console.error('Error acquiring database connection:', err);
      return next(err);
    }
    conn.promise()
      .query(sqlQuery, sqlParams)
      .then(() => {
        pool.releaseConnection(conn);
        console.log('SQL Query:', sqlQuery);
        console.log('SQL Parameters:', sqlParams);
        res.redirect('/books');
      })
      .catch(err => {
        console.error('Error updating book:', err);
        console.log('SQL Query:', sqlQuery);
        console.log('SQL Parameters:', sqlParams);
        next(err);
      });
  });
};

exports.postBook = (req, res, next) => {
  const isbn = req.body.isbn;
  const title = req.body.title;
  const publisher = req.body.publisher;
  const pages = req.body.pages;
  const summary = req.body.summary;
  const available_copies = req.body.available_copies;
  const image = req.body.image;
  const language = req.body.language;
  const keywords = req.body.keywords;
  const category_id = req.body.category_id;
  const author_id = req.body.author_id;
  const sec_category_id = req.body.sec_category_id;
  const school_id = req.body.school_id;


  pool.getConnection((err,conn) =>{
      var sqlQuery = `INSERT INTO book(isbn, title, publisher, pages, summary, available_copies, image, language, keywords, category_id, author_id, sec_category_id, school_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      conn.promise().query(sqlQuery, [isbn, title, publisher, pages, summary, available_copies, image, language, keywords, category_id, author_id, sec_category_id, school_id])
      .then(() =>{
          pool.releaseConnection(conn);
          res.redirect('/books');
      })
      .catch(err => {
          res.send(err);
          //res.redirect('/users');
      })
  })

}


exports.getUserBooks = (req, res, next) => {

  /* check for messages in order to show them when rendering the page */
  let messages = req.flash("messages");
  if (messages.length == 0) messages = [];

  const { searchFilter, searchTerm } = req.query;
  const sqlParams = [];
  const schoolId = req.session.schoolId;

  let sqlQuery = `SELECT b.isbn, b.title, b.publisher, b.pages, b.summary, b.available_copies, b.image, b.language, b.keywords, c.name, CONCAT(a.first_name, ' ', a.last_name) AS author_name
                  FROM book b
                  JOIN author a ON b.author_id = a.author_id
                  JOIN category c ON b.category_id = c.category_id `;

  if (searchFilter && searchTerm) {
    switch (searchFilter) {
      case 'title':
        sqlQuery += ' WHERE b.title LIKE ?';
        sqlParams.push(`%${searchTerm}%`);
        break;
      case 'name':
        sqlQuery += ' WHERE c.name LIKE ?';
        sqlParams.push(`%${searchTerm}%`);
        break;
      case 'author_name':
        sqlQuery += ` WHERE CONCAT(a.first_name, ' ', a.last_name) LIKE ?`;
        sqlParams.push(searchTerm);
        break;
    }
  }
  sqlQuery += ' AND school_id = ?';
  sqlParams.push(schoolId);
  /* create the connection, execute query, render data */
  pool.getConnection((err, conn) => {
      if (err) {
          console.error('Error acquiring database connection:', err);
          return next(err);
        }
      conn.promise().query(sqlQuery, sqlParams)
      .then(([rows, books]) => {
          res.render('book-details.ejs', {
              pageTitle: "Books Page",
              books: rows,
              messages: messages,
              searchFilter: searchFilter,
              searchTerm: searchTerm
            });
      })
      .then(() => pool.releaseConnection(conn))
      .catch(err => console.log(err))
  })

}

// Controller function for submitting a review for a book
exports.submitReview = (req, res, next) => {
  const isbn = req.body.isbn;
  const userId = req.session.userId;
  const review_text = req.body.review_text;
  const rating = req.body.rating;
  const sqlQuery = `INSERT INTO Review (isbn, user_id, review_text, rating, approved, created_at ) VALUES (?, ?, ?, ?, '0', NOW())`;

  pool.getConnection((err, conn) => {
    if (err) {
      console.error('Error acquiring database connection:', err);
      return next(err);
    }

    conn.promise()
      .query(sqlQuery, [isbn, userId, review_text, rating])
      .then(() => {
        res.redirect('/books/users');
      })
      .then(() => pool.releaseConnection(conn))
      .catch((err) => {
        console.error('Error executing SQL query:', err);
  
      });
  });
};
