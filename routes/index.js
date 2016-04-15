var crypto = require('crypto'),
    User = require('../models/user.js'),
    Post = require("../models/post.js"),
    Medals = require("../models/medals.js"),
    Result = require("../models/result.js")
    Project = require("../models/project.js");
var express = require('express');
var router = express.Router();

/* 首页 */
router.get('/', function(req, res) {
  Project.get(null, function (err, projects) {
    if (err) {
      projects = [];
    }
    res.render('index', {
      title: '主页',
      user: req.session.user,
      manager: req.session.manager,
      projects: projects,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

router.post('/',function(req,res){
    //删除模块
  console.log(req.body.projectId);
  Project.remove(req.body.projectId,function(err){
    if(err){
      req.flash('error',err);
      return res.redirect('/')
    }
    req.flash('success',req.session.user.name);
    res.redirect('/');
  })
})



router.post('/update',function(req,res){
    Project.update(req.body.projectId,req.body.projectName, req.body.projectRule, req.body.projectSort, req.body.rscoreBest, function (err) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');//出错!返回文章页
        }
        req.flash('success', '修改成功!');
        res.redirect('/');//成功!返回文章页
    });
})

/*注册*/
router.get('/reg',checkNotLogin);
router.get('/reg',function(req,res){
  res.render('reg', {
    title: '注册',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/reg',checkNotLogin);
router.post('/reg', function (req, res) {
    var studentID = req.body.studentID,
        name = req.body.name,
        password = req.body.password,
        password_re = req.body['password-repeat'];

    //检验用户两次输入的密码是否一致
    if (password_re != password) {
      req.flash('error', '两次输入的密码不一致!');
      return res.redirect('/reg');//返回注册页
    }

    //生成密码的 md5 值
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
      studentID: studentID,
      name: name,
      password: password,
      sex: req.body.sex
    });

    //检查用户名是否已经存在
    User.get(newUser.studentID, function (err, user) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      if (user) {
        req.flash('error', '用户已存在!');
        return res.redirect('/reg');//返回注册页
      }

      //如果不存在则新增用户
      newUser.save(function (err, user) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/reg');//注册失败返回主册页
        }
        req.session.user = user;//用户信息存入 session
        req.flash('success', '注册成功!');
        res.redirect('/');//注册成功后返回主页
      });
    });
  });

/*登陆*/
router.get('/login',checkNotLogin);
router.get('/login', function (req, res) {
  res.render('login', {
    title: '登录',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()});
});

router.post('/login',checkNotLogin);
router.post('/login', function (req, res) {
  //生成密码的 md5 值
  var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
  //检查用户是否存在
  User.get(req.body.studentID, function (err, user) {
    if (!user) {
      req.flash('error', '用户不存在!');
      return res.redirect('/login');//用户不存在则跳转到登录页
    }
    //检查密码是否一致
    if (user.password != password) {
      req.flash('error', '密码错误!');
      return res.redirect('/login');//密码错误则跳转到登录页
    }
    //用户名密码都匹配后,将用户信息存入 session
    req.session.user = user;
    req.flash('success', '登陆成功!');
    res.redirect('/');//登陆成功后跳转到主页
  });
});

/*管理员登陆*/
router.post('/manager',function(req,res){
  //生成密码的 md5 值
  var managerID = req.body.managerID,
      password = req.body.password;

    //检查密码是否一致
    if (password != 'admin') {
      req.flash('error', '管理员密码错误!');
      return res.redirect('back');//密码错误则返回
    }

    //用户名密码都匹配后,将管理员信息存入 session
    req.session.user.managerID = managerID;
    req.flash('success', '管理员登陆成功!');
    res.redirect('/managerIndex');//登陆成功后跳转到管理员界面
  });

/*报名*/
router.get('/post',checkLogin);
router.get('/post', function (req, res) {
  res.render('post', {
    title: '登录',
    user: req.session.user,
    sex: req.session.user.sex,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/post',checkLogin);
router.post('/post', function (req, res) {
  var currentUser = req.session.user,
      post = new Post(currentUser.studentID,currentUser.name,currentUser.sex,req.body.raceIndividuals,req.body.raceTeam);
  post.save(function(err){
    if(err){
      req.flash('error',err);
      return res.redirect('/');
    }
    req.flash('success','发布成功!');
    res.redirect('/'); //发表成功跳转到主页
  });
});

/*项目的增删查改*/
router.get('/project',checkLogin);
router.get('/project', function (req, res) {
  Post.get(null, function (err, projects) {
    if (err) {
      projects = [];
    }
    res.render('project', {
      title: '登录',
      projects: projects,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

router.post('/project',checkLogin);
router.post('/project', function (req, res) {
  project = new Project(req.body.projectId,req.body.projectName,req.body.projectRule,req.body.projectSort,req.body.scoreBest);
  project.save(function(err){
    if(err){
      req.flash('error',err);
      return res.redirect('/');
    }
    req.flash('success','发布成功!');
    res.redirect('/'); //发表成功跳转到主页
  });
});

/*管理员首页*/
router.get('/managerIndex',checkLogin);
router.get('/managerIndex',function(req,res){
  res.render('managerIndex',{
    title: '欢迎您，管理员',
    user: req.session.user,
    success: req.flash('success').toString(),
    success: req.flash('error').toString()
  });
});

router.post('/managerIndex',checkLogin);
router.post('/managerIndex',function(req,res){

});

/*项目信息页*/
router.get('/item',checkLogin);
router.get('/item',function(req,res){
  Project.get(null,function(err,projects){
    if(err){
      projects = [];
    }
    res.render('item',{
      title: '项目信息',
      user: req.session.user,
      projects: projects,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

router.post('/item',checkLogin);
router.post('/item',function(req,res){

});

/*添加项目*/
router.post('/item_insert',checkLogin);
router.post('/item_insert',function(req,res){
  project = new Project(req.body.projectId,req.body.projectName,req.body.projectRule,req.body.projectSort,req.body.scoreBest);
  project.save(function(err){
    if(err){
      req.flash('error',err);
      return res.redirect('/item');
    }
    req.flash('success','添加成功！');
    res.redirect('/item');
  });
});

/*修改项目*/
router.post('/item_update',checkLogin);
router.post('/item_update',function(req,res){
  Project.update(req.body.projectId,req.body.projectName,req.body.projectRule,req.body.projectSort,req.body.scoreBest,function(err){
    if(err){
      req.flash('error',err);
      return res.redirect('/item');
    }
    req.flash('success','修改成功！');
    res.redirect('/item');
  });
});

/*删除项目*/
router.post('/item_remove',checkLogin);
router.post('/item_remove',function(req,res){
  Project.remove(req.body.projectId,function(err){
    if(err){
      req.flash('error',err);
      return res.redirect('/item');
    }
    req.flash('success','删除成功！');
    res.redirect('/item');
  });
});

/*学生信息页*/
router.get('/students',checkLogin);
router.get('/students',function(req,res){
  User.getAll(null,function(err,users){
    if(err){
      users = [];
    }
    res.render('students',{
      title: '学生信息',
      user: req.session.user,
      users: users,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

router.post('/students',checkLogin);
router.post('/students',function(req,res){

});

/*添加用户信息*/
router.post('/students_insert',checkLogin);
router.post('/students_insert',function(req,res){
  var studentID = req.body.studentID,
      name = req.body.name,
      password = req.body.password,
      password_re = req.body['password-repeat'];

  //检验用户两次输入的密码是否一致
  if (password_re != password) {
    req.flash('error', '两次输入的密码不一致!');
    return res.redirect('/students');//返回注册页
  }

  //生成密码的 md5 值
  var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
  var newUser = new User({
    studentID: studentID,
    name: name,
    password: password,
    sex: req.body.sex,
    faculty:req.body.faculty
  });

  //检查用户名是否已经存在
  User.get(newUser.studentID, function (err, user) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/students');
    }
    if (user) {
      req.flash('error', '用户已存在!');
      return res.redirect('/students');//返回注册页
    }

    //如果不存在则新增用户
    newUser.save(function (err, user) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/students');//注册失败返回主册页
      }
      req.flash('success', '注册成功!');
      res.redirect('/students');//注册成功后返回主页
    });
  });
})

/*修改用户信息*/
router.post('/students_update',checkLogin);
router.post('/students_update',function(req,res){
  User.update(req.body.studentID,req.body.name,req.body.password,req.body.sex,req.body.faculty,function(err){
    if(err){
      req.flash('error',err);
      return res.redirect('/students');
    }
    req.flash('success','修改成功！');
    res.redirect('/students');
  });
});

/*删除用户信息*/
router.post('/students_remove',checkLogin);
router.post('/students_remove',function(req,res){
  User.remove(req.body.studentID,function(err){
    if(err){
      req.flash('error',err);
      return res.redirect('/students');
    }
    req.flash('success','删除成功！');
    res.redirect('/students');
  });
});

/*个人项目成绩页*/
router.get('/individualItem',checkLogin);
router.get('/individualItem',function(req,res){
  Result.get(null,function(err,individualItems){
    if(err){
      individualItems = [];
    }
    res.render('individualItem',{
      title: '个人成绩',
      user: req.session.user,
      individualItems: individualItems,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

router.post('/individualItem',checkLogin);
router.post('/individualItem',function(req,res){

});

/*添加成绩*/
router.post('/individualItem_insert',checkLogin);
router.post('/individualItem_insert',function(req,res){
  individualItem = new Result(req.body.studentID,req.body.name,req.body.projectName,req.body.gameClass,req.body.group,req.body.fendao,req.body.projectResult);
  individualItem.save(function(err){
    if(err){
      req.flash('error',err);
      return res.redirect('/individualItem');
    }
    req.flash('success','添加成功！');
    res.redirect('/individualItem');
  });
});

/*修改成绩*/
router.post('/individualItem_update',checkLogin);
router.post('/individualItem_update',function(req,res){
  Result.update(req.body.studentID,req.body.name,req.body.projectName,req.body.gameClass,req.body.group,req.body.fendao,req.body.projectResult,function(err){
    if(err){
      req.flash('error',err);
      return res.redirect('/individualItem');
    }
    req.flash('success','修改成功！');
    res.redirect('/individualItem');
  });
});

/*删除成绩*/
router.post('/individualItem_remove',checkLogin);
router.post('/individualItem_remove',function(req,res){
  Result.remove(req.body.studentID,function(err){
    if(err){
      req.flash('error',err);
      return res.redirect('/individualItem');
    }
    req.flash('success','删除成功！');
    res.redirect('/individualItem');
  });
});


/*团队项目成绩页*/
router.get('/teamItem',checkLogin);
router.get('/teamItem',function(req,res){
  Result.get(null,function(err,teamItems){
    if(err){
      teamItems = [];
    }
    res.render('teamItem',{
      title: '团队成绩',
      user: req.session.user,
      teamItems: teamItems,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});


router.post('/teamItem',checkLogin);
router.post('/teamItem',function(req,res){

});



/*个人信息首页*/
router.get('/stu_index',checkLogin);
router.get('/stu_index',function(req,res){
  Project.get(null,function(err,projects){
    if(err){
      projects = [];
    }
    res.render('stu_index',{
      title: '项目信息',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

/*个人查看项目信息*/
router.get('/stu_item',checkLogin);
router.get('/stu_item',function(req,res){
  Project.get(null,function(err,projects){
    if(err){
      projects = [];
    }
    res.render('stu_item',{
      title: '项目信息',
      user: req.session.user,
      projects: projects,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

/*个人修改个人信息*/
router.get('/changeInfo',checkLogin);
router.get('/changeInfo',function(req,res){
  User.get(null,function(err,users){
    if(err){
      users = [];
    }
    res.render('changeInfo',{
      title: '学生信息',
      user: req.session.user,      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

router.post('/changeInfo_update',checkLogin);
router.post('/changeInfo_update',function(req,res){
  User.update(req.body.studentID,req.body.name,req.body.password,req.body.sex,req.body.faculty,function(err){
    if(err){
      req.flash('error',err);
      return res.redirect('/changeInfo');
    }
    req.flash('success','修改成功！');
    res.redirect('/changeInfo');
  });
});

/*删除成绩*/
router.post('/changeInfo_remove',checkLogin);
router.post('/changeInfo_remove',function(req,res){
  Result.remove(req.body.studentID,function(err){
    if(err){
      req.flash('error',err);
      return res.redirect('/changeInfo');
    }
    req.flash('success','删除成功！');
    res.redirect('/changeInfo');
  });
});


/*修改个人密码*/
router.get('/changePassword',checkLogin);
router.get('/changePassword',function(req,res){
  User.get(null,function(err,users){
    if(err){
      users = [];
    }
    res.render('changePassword',{
      title: '学生信息',
      user: req.session.user,
      users: users,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

router.post('/changeInfo',checkLogin);
router.post('/changeInfo',function(req,res){
  User.update(req.body.studentID,req.body.name,req.body.password,req.body.sex,req.body.faculty,function(err){
    if(err){
      req.flash('error',err);
      return res.redirect('/students');
    }
    req.flash('success','修改成功！');
    res.redirect('/students');
  });
});

/*个人查看个人项目成绩*/
router.get('/stu_individualItem',checkLogin);
router.get('/stu_individualItem',function(req,res){
  Result.get(null,function(err,individualItems){
    if(err){
      individualItems = [];
    }
    res.render('stu_individualItem',{
      title: '个人成绩',
      user: req.session.user,
      individualItems: individualItems,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

/*个人查看团队项目成绩*/
router.get('/stu_teamItem',checkLogin);
router.get('/stu_teamItem',function(req,res){
  User.getAll(null,function(err,users){
    if(err){
      users = [];
    }
    res.render('stu_teamItem',{
      title: '团队分数',
      user: req.session.user,
      users: users,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

/*个人查看团队总分*/
router.get('/stu_teamPoint',checkLogin);
router.get('/stu_teamPoint',function(req,res){
  Medals.get(null,function(err,medalses){
    if(err){
      medalses = [];
    }
    res.render('stu_teamPoint',{
      title: '团队分数',
      user: req.session.user,
      medalses: medalses,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});


/*团队奖牌及积分表*/
router.get('/teamPoint',checkLogin);
router.get('/teamPoint',function(req,res){
  var faculty = new Array();
  faculty[0] = '计算机学院';
  faculty[1] = '软件学院';
  faculty[2] = '数学学院';
  faculty[3] = '机械学院';
  faculty[4] = '经管学院';
  faculty[5] = '水利学院';
  faculty[6] = '轻纺学院';
  Medals.get(null,function(err,medalses){
    if(err){
      medalses = [];
    }
    res.render('teamPoint',{
      title: '团队总分',
      user: req.session.user,
      medalses: medalses,
      faculty: faculty,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

/*添加积分表*/
router.post('/teamPoint_insert',checkLogin);
router.post('/teamPoint_insert',function(req,res){
  teamPoint = new Medals(req.body.faculty,req.body.goldMedal,req.body.silverMedal,req.body.bronzeMedal,req.body.score);
  teamPoint.save(function(err){
    if(err){
      req.flash('error',err);
      return res.redirect('/teamPoint');
    }
    req.flash('success','添加成功！');
    res.redirect('/teamPoint');
  });
});

/*修改总分表*/
router.post('/teamPoint_update',checkLogin);
router.post('/teamPoint_update',function(req,res){
  Medals.update(req.body.faculty,req.body.goldMedal,req.body.silverMedal,req.body.bronzeMedal,function(err){
    if(err){
      req.flash('error',err);
      return res.redirect('/teamPoint');
    }
    req.flash('success','修改成功！');
    res.redirect('/teamPoint');
  });
});

/*删除团队总分*/
router.post('/teamPoint_remove',checkLogin);
router.post('/teamPoint_remove',function(req,res){
  Medals.remove(req.body.projectId,function(err){
    if(err){
      req.flash('error',err);
      return res.redirect('/teamPoint');
    }
    req.flash('success','删除成功！');
    res.redirect('/teamPoint');
  });
});

router.post('/teamPoint',checkLogin);
router.post('/teamPoint',function(req,res){

});

/*个人管理界面*/
router.get('/stu_individualItem',checkLogin);
router.get('/stu_individualItem',function(req,res){
  User.getAll(null,function(err,users){
    if(err){
      users = [];
    }
    res.render('stu_individualItem',{
      title: '学生信息',
      user: req.session.user,
      users: users,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

router.post('/students',checkLogin);
router.post('/students',function(req,res){

});




/*用户登出*/
router.get('/logout',checkLogin);
router.get('/logout', function (req, res) {
  req.session.user = null;
  req.flash('success', '登出成功!');
  res.redirect('/stu_teampoint');//登出成功后跳转到主页
});

/*管理员登出*/
router.get('/mangerLogout',checkLogin);
router.get('/mangerLogout',function(req,res){
  req.session.user.managerID = null;
  req.flash('success', '管理员登出成功!');
  res.redirect('/stu_teampoint');//登出成功后返回
})


/*检查是否为登录状态*/
function checkLogin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', '未登录!');
    return res.redirect('/login');
  }
  next();
}

/*检查是否为未登录状态*/
function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.flash('error', '已登录!');
    return res.redirect('back');
  }
  next();
}

module.exports = router;
