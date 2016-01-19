$(function(){
    $('select[name=raceTeam]').hide();
    $('select[name=raceIndividuals]').hide();
    $('input[type=radio][name=applyType]').change(function () {
        var checkapplyType=$(this).val();
        if(checkapplyType == '个人赛'){
            $('select[name=raceIndividuals]').show();
            $('select[name=raceTeam]').hide();
        }else if(checkapplyType == '团体赛'){
            $('select[name=raceTeam]').show();
            $('select[name=raceIndividuals]').hide();
        }

        //按男子、女子与个人、团队分类
        //if(checkapplyType == '个人赛' && sex == '男'){
        //    $('select[name=manTeam]').hide();
        //    $('select[name=woTeam]').hide();
        //    $('select[name=womanTndividuals]').hide();
        //    $('select[name=manIndividuals]').show();
        //} else if(checkapplyType == '团体赛' && sex == '男'){
        //    $('select[name=manIndividuals]').hide();
        //    $('select[name=womanIndividuals]').hide();
        //    $('select[name=womanTeam]').hide();
        //    $('select[name=manTeam]').show();
        //} else if(checkapplyType == '个人赛' && sex == '女') {
        //    $('select[name=manIndividuals]').hide();
        //    $('select[name=womanIndividuals]').show();
        //    $('select[name=womanTeam]').hide();
        //    $('select[name=manTeam]').hide();
        //} else if(checkapplyType == '团体赛' && sex == '女') {
        //    $('select[name=manTndividuals]').hide();
        //    $('select[name=womanTndividuals]').hide();
        //    $('select[name=womanTeam]').show();
        //    $('select[name=mantTeam]').hide();
        //}
    })

    console.log(sex);
})
