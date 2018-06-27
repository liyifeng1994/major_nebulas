"use strict"

var userAddress
var dappAddress = "n1x3FC9ruJZUeQBCJoeDGqMVHHKSA2oPe8V"

var nebulas = require("nebulas"),
    Account = nebulas.Account,
    neb = new nebulas.Neb()
// neb.setRequest(new nebulas.HttpRequest("https://mainnet.nebulas.io"))
neb.setRequest(new nebulas.HttpRequest("https://testnet.nebulas.io"))

var NebPay = require("nebpay"),
    nebPay = new NebPay()
// var callbackUrl = NebPay.config.mainnetUrl
var callbackUrl = NebPay.config.testnetUrl
var serialNumber
var intervalQuery

$(function(){
    initUserAddress()
    getSize()
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

function getSize() {
    var from = Account.NewAccount().getAddressString()
    var value = "0"
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "2000000"
    var callFunction = "len"
    var callArgs = JSON.stringify([])
    var contract = {
        "function": callFunction,
        "args": callArgs
    }

    neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
        cbGetSize(resp)
    }).catch(function (err) {
        console.log("error:" + err.message)
    })
}

function cbGetSize(resp) {
    var result = resp.result
    console.log("return of rpc call: " + JSON.stringify(result))

    var resultString = JSON.stringify(result)
    if(resultString.search(/error/i) == -1){
        result = JSON.parse(result)
        $('#size').text(result)
    } else {
        console.log(result)
    }
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

var colors = ['primary','success','danger','warning','info']

function cbGetAll(resp) {
    var result = resp.result
    console.log("return of rpc call: " + JSON.stringify(result))

    var resultString = JSON.stringify(result)
    if(resultString.search(/error/i) == -1){
        result = JSON.parse(result)
        $('#show').html('')
        // for (var data of result) {
        for (var i = result.length - 1; i >= 0; i--) {
            var data = result[i]
            var color = randomArray(colors)
            var item = `
                <div class="col-sm-6 col-md-4 mb-4">
                  <div class="card border-`+color+`">
                    <div class="card-body">
                      <h5 class="card-title text-`+color+`">`+data.tag+`</h5>
                      <p class="card-text">`+data.content+`</p>
                      <p class="card-text"><small class="text-muted">`+data.pubTime+`</small></p>
                    </div>
                  </div>
                </div>
                `
            $('#show').append(item)
        }
    } else {
        $('#show').text('数据加载失败，请稍后再试！')
        console.log(result)
    }
}

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
        alert('内容只能输入300个字，要言简意赅！')
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
        qrcode: {
            showQRCode: false
        },
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
    }else if(respString.search("txhash") !== -1){
        $('#ipt_tag').val('')
        $('#ipt_content').val('')
        $('#successTips').html(`
            <div class="alert alert-success alert-dismissible fade show" role="alert">
              <strong>提交成功！</strong>稍后刷新页面查看结果。交易哈希：`+resp.txhash+`
              <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            `)
    }
}
