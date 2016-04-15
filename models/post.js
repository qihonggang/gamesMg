var mongodb = require('./db');

//获取报名表单提交的信息
function Post(studentID,name,sex,raceIndividuals,raceTeam){
    this.studentID = studentID;
    this.name = name;
    this.sex = sex;
    this.raceIndividuals = raceIndividuals;
    this.raceTeam = raceTeam;
}

//存储报名表及其相关信息
Post.prototype.save = function(callback){
    var date = new Date();

    //存储各种时间格式，方便以后拓展
    var time = {
        date: date,
        year: date.getFullYear(),
        month: date.getFullYear() + "-" + (date.getMonth() + 1),
        day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    }

    //要存入数据库的文档
    var post = {
        studentID: this.studentID,
        name: this.name,
        time: time,
        sex: this.sex,
        raceIndividuals: this.raceIndividuals,
        raceTeam: this.raceTeam
    }

    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //将文档插入posts集合
            collection.insert(post,{
                safe: true
            },function(err){
                mongodb.close();
                if(err){
                    return callback(err); //失败！ 返回err
                }
                callback(null); //返回err为null
            });
        });
    });
};

//读取报名表及相关信息
Post.get = function (studentID,callback) {
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts',function(err,collection){
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
                time: -1
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

//修改报名表及相关信息
Post.update = function(studentID,name, time, sex,raceIndividuals,raceTeam,callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
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
                    "time": time,
                    "sex": sex,
                    "raceIndividuals": raceIndividuals,
                    "raceTeam": raceTeam
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

//删除报名表及相关信息
Post.remove = function(studentID, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据项目ID查找并删除项目
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
module.exports = Post;