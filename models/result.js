

var mongodb = require('./db');

//获取成绩表单提交的信息
function Result(studentID,name,projectName,gameClass,group,fendao,projectResult){
    this.studentID = studentID;
    this.name = name;
    this.projectName = projectName;
    this.gameClass = gameClass;  //预决赛
    this.group = group; //分组分道
    this.fendao = fendao;
    this.projectResult = projectResult;
}

//存储成绩表及其相关信息
Result.prototype.save = function(callback){
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
    var Result = {
        studentID: this.studentID,
        name: this.name,
        projectName: this.projectName,
        gameClass: this.gameClass,
        group: this.group,
        fendao: this.fendao,
        projectResult: this.projectResult
    }

    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        //读取Result集合
        db.collection('Result',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //将文档插入Project集合
            collection.insert(Result,{
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

//读取成绩及相关信息
Result.get = function (studentID,callback) {
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        //读取Result集合
        db.collection('Result',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if(studentID){
                query.studentID = studentID;
            }
            //根据query对象查询文章
            collection.find(query).sort().toArray(function(err,docs){
                mongodb.close();
                if(err){
                    return callback(err); //失败！返回err
                }
                callback(null,docs); //成功！ 以数组形式查询的结果
            });
        });
    });
};

//修改项目
Result.update = function(studentID,name, projectName,gameClass,group,fendao,projectResult,callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 Result 集合
        db.collection('Result', function (err, collection) {
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
                    "projectName": projectName,
                    "gameClass": gameClass,
                    "group": group,
                    "fendao": fendao,
                    "projectResult": projectResult
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
Result.remove = function(studentID, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 Result 集合
        db.collection('Result', function (err, collection) {
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
module.exports = Result;