

var mongodb = require('./db');

//获取项目表单提交的信息
function Project(projectId,projectName,projectRule,projectSort,scoreBest){
    this.projectId = projectId;
    this.projectName = projectName;
    this.projectRule = projectRule;
    this.projectSort = projectSort;
    this.scoreBest = scoreBest;
}

//存储项目表及其相关信息
Project.prototype.save = function(callback){
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
    var Project = {
        projectId: this.projectId,
        projectName: this.projectName,
        projectRule: this.projectRule,
        time: time,
        projectSort: this.projectSort,
        scoreBest: this.scoreBest
    }

    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        //读取Project集合
        db.collection('Project',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //将文档插入Project集合
            collection.insert(Project,{
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

//读取项目及相关信息
Project.get = function (projectId,callback) {
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        //读取Project集合
        db.collection('Project',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if(projectId){
                query.projectId = projectId;
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

module.exports = Project;