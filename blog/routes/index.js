var express = require('express');
var router = express.Router();
var crypto = require('crypto');
const mysql = require('./../database');
const formate = require('./../util/formate');

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  // 不加分页
  // var query = 'SELECT * FROM article ORDER BY articleID DESC';
  // mysql.query(query, function (err, rows, fields) {
  //   var articles = rows;
  //   articles.forEach(function(ele) {
  //     ele.articleTime = formate(ele.articleTime);
  //   });
  //   res.render('index', {articles: articles, user: req.session.user});
  // })

  // 加分页
  var page = req.query.page || 1;
  var start = (page - 1) * 5;
  var end = page * 5;
  var queryCount = 'SELECT COUNT(*) AS articleNum FROM article';
  var queryArticle = 'SELECT * FROM article ORDER BY articleID DESC LIMIT ' + start + ',' + end;
  mysql.query(queryArticle, function (err, rows, fields) {
    var articles = rows;
    articles.forEach(function (ele) {
      ele.articleTime = formate(ele.articleTime);
    });
    mysql.query(queryCount, function (err, rows, fields) {
      var articleNum = rows[0].articleNum;
      var pageNum = Math.ceil(articleNum / 5);
      // console.log(articles)
      res.render("index", {articles: articles, user: req.session.user, pageNum: pageNum, page: page})
    })
  })
});

/*登录界面，由于这个界面要显示错误提示，所以要加一个message，
要不然由于找不到message会报错*/
router.get('/login', function (req, res, next) {
  res.render('login', {message:''});
});

router.post('/login', function (req, res, next) {
  var name = req.body.name;
  var password = req.body.password;
  var hash = crypto.createHash('md5');
  hash.update(password);
  password = hash.digest('hex');
  var query = 'SELECT * FROM author WHERE authorName=' + mysql.escape(name) + ' AND authorPassword=' + mysql.escape(password);
  mysql.query(query, function (err, rows, fields) {
    if (err) {
      console.log(err);
      return;
    }
    var user = rows[0];
    console.log(user);
    if (!user) {
      res.render('login', {message:'用户名或者密码错误'});
      return;
    }
    req.session.user = user;
    res.redirect('/');
  })
});

//点击文章，进入文章详情页
router.get('/articles/:articleID', function (req, res, next) {
  var articleID = req.params.articleID;
  var query = 'SELECT * FROM article WHERE articleID=' + mysql.escape(articleID);
  mysql.query(query, function (err, rows, fields) {
    if(err) {
      console.log(err);
      return;
    }
    var query = 'UPDATE article SET articleClick=articleClick+1 WHERE articleID=' + mysql.escape(articleID);
    var article= rows[0];
    mysql.query(query, function (err, rows, fields) {
      if (err) {
        console.log(err);
        return;
      }
      article.articleTime = formate(article.articleTime);
      res.render('article', {article: article, user: req.session.user});
    })
  })
});

//进入新建文章页
router.get('/edit', function (req, res, next) {
  var user = req.session.user;
  if (!user) {
    res.redirect('/login');
    return;
  }
  res.render('edit',{user:req.session.user});
});

// 撰写文章
router.post('/edit', function(req, res, next) {
  var title = req.body.title;
  var content = req.body.content;
  var author = req.session.user.authorName;
  var query = 'INSERT article SET articleTitle=' + mysql.escape(title) + ',articleAuthor=' + mysql.escape(author) + ',articleContent=' + mysql.escape(content) + ',articleTime=CURDATE()';
  mysql.query(query, function(err, rows, fields) {
    if(err) {
      console.log(err);
      return;
    }
    res.redirect('/');
  });
});

// 友情链接
router.get('/friends', function(req, res, next){
  res.render('friends', {user:req.session.user});
});

// 关于博客
router.get('/about', function(req, res, next) {
  res.render('about', {user:req.session.user});
});

// 注销
router.get('/logout', function(req, res, next) {
  req.session.user = null;
  res.redirect('/');
});

//点击编辑
router.get('/modify/:articleID', function (req, res, next) {
  var articleID = req.params.articleID;
  var user = req.session.user;
  var query = 'SELECT * FROM article WHERE articleID=' + mysql.escape(articleID);
  if(!user) {
    res.redirect('/login');
    return;
  }
  mysql.query(query, function (err, rows, fields) {
    if (err) {
      console.log(err);
      return;
    }
    var article = rows[0];
    var title = article.articleTitle;
    var content = article.articleContent;
    // console.log(title,content);
    res.render('modify', {user:user,title: title, content: content});
  })
});

//提交编辑的文章信息，以达到更新目的
router.post('/modify/:articleID', function(req, res, next) {
  var articleID = req.params.articleID;
  var user = req.session.user;
  var title = req.body.title;
  var content = req.body.content;
  var query = 'UPDATE article SET articleTitle=' + mysql.escape(title) + ',articleContent=' + mysql.escape(content) + 'WHERE articleID=' + mysql.escape(articleID);
  mysql.query(query, function(err, rows, fields) {
    if(err) {
      console.log(err);
      return;
    }
    res.redirect('/');
  });
});

//删除文章
router.get('/delete/:articleID', function(req, res, next) {
  var articleID = req.params.articleID;
  var user = req.session.user;
  var query = 'DELETE FROM article WHERE articleID=' + mysql.escape(articleID);
  if(!user) {
    res.redirect('/login');
    return;
  }
  mysql.query(query, function(err, rows, fields) {
    res.redirect('/')
  });
});

module.exports = router;
