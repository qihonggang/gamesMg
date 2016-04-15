var mongodb = require('./db');
function User(user) {
    this.studentID = user.studentID;
    this.name = user.name;
    this.password = user.password;
    this.sex = user.sex;
    this.faculty = user.faculty;
};

//存储用户信息
User.prototype.save = function(callback) {
    //要存入数据库的用户文档
    var user = {
        studentID: this.studentID,
        name: this.name,
        password: this.password,
        sex: this.sex,
        faculty: this.faculty
    };
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);//错误,返回 err 信息
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {mongodb.close();
                return callback(err);//错误,返回 err 信息
            }
            //将用户数据插入 users 集合
            collection.insert(user, {
                safe: true
            }, function (err, user) {
                mongodb.close();
                if (err) {
                    return callback(err);//错误,返回 err 信息
                }
                callback(null, user[0]);//成功!err 为 null,并返回存储后的用户文档
            });
        });
    });
};

User.getAll = function (studentID,callback) {
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        //读取users集合
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if(studentID){
                query.studentID = studentID;
            }
            //根据query对象查询文章
            collection.find(query).sort({
                score: -1
            }).toArray(function(err,docs){
                mongodb.close();
                if(err){
                    return callback(err); //失败！返回err
                }
                callback(null,docs); //成功！ 以数组形式查询的结果
            });
        });
    });
};


//读取当前用户信息
User.get = function(studentID, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);//错误,返回 err 信息
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);//错误,返回 err 信息
            }

            //查找用户名(stduentID)值为 student 一个文档
            collection.findOne({
                studentID: studentID
            }, function (err, user) {
                mongodb.close();
                if (err) {
                    return callback(err);//失败!返回 err 信息
                }
                callback(null, user);//成功!返回查询的用户信息
            });
        });
    });
};

//修改项目
User.update = function(studentID,name, password, sex,faculty,callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 User 集合
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //更新项目内容
            collection.update({
                "studentID": studentID,
            }, {
                $set: {
                    "studentID": studentID,
                    "name": name,
                    "password": password,
                    "sex": sex,
                    "faculty": faculty
                }
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};

//删除项目
User.remove = function(studentID, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 User 集合
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据学生ID查找并删除学生信息
            collection.remove({
                "studentID": studentID
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};

module.exports = User;
