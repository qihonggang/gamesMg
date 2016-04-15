var mongodb = require('./db');

//获取报名表单提交的信息
function Medals(faculty,goldMedal,silverMedal,bronzeMedal){
    this.faculty = faculty;
    this.goldMedal = parseInt(goldMedal);
    this.silverMedal = parseInt(silverMedal);
    this.bronzeMedal = parseInt(bronzeMedal);
    this.medalsNum = parseInt(goldMedal)+parseInt(silverMedal)+parseInt(bronzeMedal);
    this.score = 3*parseInt(goldMedal)+ 2*parseInt(silverMedal)+parseInt(bronzeMedal);

}

//存储报名表及其相关信息
Medals.prototype.save = function(callback){
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
    var medals = {
        faculty: this.faculty,
        goldMedal: this.goldMedal,
        silverMedal: this.silverMedal,
        bronzeMedal: this.bronzeMedal,
        medalsNum: this.medalsNum,
        score: this.score
    }

    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('medals',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //将文档插入posts集合
            collection.insert(medals,{
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
Medals.get = function (faculty,callback) {
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('medals',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if(faculty){
                query.faculty = faculty;
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

//修改报名表及相关信息
Medals.update = function(faculty,goldMedal, silverMedal,bronzeMedal,callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 medals 集合
        db.collection('medals', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //更新项目内容
            collection.update({
                "faculty": faculty,
            }, {
                $set: {
                    "faculty": faculty,
                    "goldMedal": goldMedal,
                    "silverMedal": silverMedal,
                    "bronzeMedal": bronzeMedal
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
Medals.remove = function(faculty, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 medals 集合
        db.collection('medals', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据项目ID查找并删除项目
            collection.remove({
                "faculty": faculty
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
module.exports = Medals;
