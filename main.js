"use strict"

var userAddress
var dappAddress = "n1r9uaw1yQusg7B9kU1ZD9eeKLgNxmgn7GM"

var nebulas = require("nebulas"),
    Account = nebulas.Account,
    neb = new nebulas.Neb()
neb.setRequest(new nebulas.HttpRequest("https://testnet.nebulas.io"))

var NebPay = require("nebpay"),
    nebPay = new NebPay()
// var callbackUrl = NebPay.config.mainnetUrl
var callbackUrl = NebPay.config.testnetUrl
var serialNumber
var intervalQuery

$(function(){
    initUserAddress()
    getAll()
})

function initUserAddress(){
    window.postMessage({
        "target": "contentscript",
        "data": {},
        "method": "getAccount",
    }, "*");
    window.addEventListener('message', function (e) {
        if (e.data && e.data.data && e.data.data.account) {
           userAddress = e.data.data.account;
           console.log(userAddress)
        }
    });
}

function getAll() {
	var from = Account.NewAccount().getAddressString()
    var value = "0"
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "2000000"
    var callFunction = "getAll"
    var callArgs = JSON.stringify([])
    var contract = {
        "function": callFunction,
        "args": callArgs
    }

    neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
        cbGetAll(resp)
    }).catch(function (err) {
        console.log("error:" + err.message)
    })
}

function cbGetAll(resp) {
    var result = resp.result
    console.log("return of rpc call: " + JSON.stringify(result))

    if (result.length > 0) {
    // var resultString = JSON.stringify(result)
    // if(resultString.search("tag") !== -1){
        result = JSON.parse(result)
        $('#show').html('')
        for (var data of result) {
            var item = `
                <div class="col-sm-6 col-md-4">
                  <div class="thumbnail">
                    <div class="caption">
                      <h3>`+data.tag+`</h3>
                      <p>`+data.content+`</p>
                      <p class="text-right">`+data.pubTime+`</p>
                    </div>
                  </div>
                </div>
                `
            $('#show').append(item)
        }
    } else {
        console.log(result)
    }
}

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

$("#showSaveModal").click(function() {
    $('#saveModal').modal()
})

$("#save").click(function() {
    var tag = $("#ipt_tag").val().trim()
    var content = $("#ipt_content").val().trim()
    if (tag == '') {
        alert('请输入专业！')
        $('#ipt_tag').focus()
        return
    }
    if (content == undefined || content == '') {
        alert('请随便说点什么吧！')
        $('#ipt_content').focus()
        return
    } else if (content.length > 300) {
        alert('内容只能输入300个字，言简意赅吧！')
        $('#ipt_content').focus()
        return
    }

    /*if(typeof(webExtensionWallet) === "undefined"){
        alert("请先安装星云钱包插件！");
        return
    }*/

    $('#saveModal').modal('hide')

    var to = dappAddress
    var value = "0"
    var callFunction = "save"
    var from = userAddress
    var pubTime = getCurentTime()
    var callArgs = JSON.stringify([from, tag, content, pubTime])

    serialNumber = nebPay.call(to, value, callFunction, callArgs, {
        // qrcode: {
        //     showQRCode: false
        // },
        listener: cbSave,
        callback: callbackUrl
    })

    intervalQuery = setInterval(function () {
        funcIntervalQuery()
    }, 10000)
})

function funcIntervalQuery() {
    var options = {
        callback: callbackUrl
    }
    nebPay.queryPayInfo(serialNumber,options)
        .then(function (resp) {
            console.log("tx result: " + resp)
            var respObject = JSON.parse(resp)
            if(respObject.code === 0){
                clearInterval(intervalQuery)
                // getAll()
            }
        })
        .catch(function (err) {
            console.log(err)
        })
}

function cbSave(resp) {
    console.log("response of push: " + JSON.stringify(resp))
    var respString = JSON.stringify(resp)
    if(respString.search("rejected by user") !== -1){
        clearInterval(intervalQuery)
        alert(respString)
    }else if(respString.search("txhash") !== -1){
        alert('发布成功！稍后刷新查看。\n交易地址：' + resp.txhash)
    }
}
