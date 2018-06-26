//获取当前时间
function getCurentTime() {
    var date = new Date();
    var y = date.getUTCFullYear();
    var m = date.getUTCMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getUTCDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getUTCHours();
    h=h < 10 ? ('0' + h) : h;
    var minute = date.getUTCMinutes();
    minute = minute < 10 ? ('0' + minute) : minute;
    var second = date.getUTCSeconds();
    second = second < 10 ? ('0' + second) : second;

    var timeStr = y+'-'+m+'-'+d;
    // var timeStr = y+'-'+m+'-'+d+' '+h+':'+minute+':'+second;
    return timeStr;
}


//生成从minNum到maxNum的随机数
function randomNum(minNum, maxNum){
    switch(arguments.length){
        case 1:
            return parseInt(Math.random() * minNum + 1, 10);
            break;
        case 2:
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
            break;
        default:
            return 0;
            break;
    }
}

//随机获取数组中任意一个元素
function randomArray(arr) {
    return arr[randomNum(0, arr.length - 1)]
}
