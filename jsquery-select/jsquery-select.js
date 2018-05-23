/**
 * @desc 基于jQuery生成下拉框，前端模糊搜索的插件
 * @使用方法  实例化：$("#id_name").createSearch(options);
 *              取值：$("#id_name").getValue();
 * @param {Object} options参数
 *      {
 *          data: [],  数据列表
 *          initVal: {},        已选择对象
 *          filterKey: ""   匹配的字段，默认为name
 *          requestFlag: Boolean   每次输入是否进行请求，默认为false,请求返回的列表key值为‘data’
 *          requestFlag:{
 *              url: ""         请求地址，默认为空
 *              type: ""        请求方法，默认为post
 *              searchKey: ""   请求的字段，默认为name
 *          }
 *      }
 */

(function($){
    let a;
    let ms = {
        "currentVal": "",
        "filterList": [],
        "listFlag": false,
        "init": function(obj, args){
            obj.addClass("jmgo-search-data")
            ms.currentVal = args.initVal[args.filterKey];
            obj.data("info", args.initVal);
            obj.data("fullData", args.data);
            obj.data("filterKey", args.filterKey);
            obj.data("requestFlag", args.requestFlag);
            obj.data("requestInfo", args.requestInfo);
            ms.fillTopHtml(obj);
            return ms;
        },
        "fillTopHtml": function(obj){
            obj.empty();
            let htmlStr = `
                <style>
                    *{
                        padding: 0;
                        margin: 0;
                    }
                    ul, li{
                        list-style: none;
                    }
                    .jmgo-search-data{
                        width: 100%;
                        height: 100%;
                        position: relative;
                    }
                    .jmgo-search-data input{
                        width: 100%;
                        height: 100%;
                        padding-left: 14px;
                        border: none;
                        -webkit-box-sizing: border-box;
                        -moz-box-sizing: border-box;
                        box-sizing: border-box;
                    }
                    .jmgo-search-data input:focus{
                        border: none;
                        outline-color: #bcc8d9;
                    }
                    .jmgo-search-box{
                        position: fixed;
                        display: ${ms.listFlag ? "block" : "none"};
                        top: 30px;
                        width: 100%;
                        height: 160px;
                        overflow-y: auto;
                        border: 1px solid #bcc8d9;
                        background-color: #fff;
                        -webkit-box-sizing: border-box;
                        -moz-box-sizing: border-box;
                        box-sizing: border-box;
                        z-index: 20180523;
                    }
                    .jmgo-search-box li span{
                        display: block;
                        width: calc(100% - 27px);
                        line-height: 24px;
                        margin: 3px 11px;
                        padding-left: 3px;
                        font-size: 12px;
                        color: #687993;
                        border-radius: 4px;
                        border: 1px solid transparent;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        overflow: hidden;
                    }
                    .jmgo-search-box li.active-search-li span{
                        background: #dfe3eb;
                    }
                    .jmgo-search-box li:hover span{
                        background: #eaeff8;
                    }
                </style>
                <input type="text" value="" placeholder="请输入关键字" />
            `;
            obj.html(htmlStr);
            obj.find("input").val(ms.currentVal);
            ms.fillHtml(obj);
        },
        "fillHtml": function(obj){
            ms.filter(obj);
            obj.find(".jmgo-search-box").remove();
            let filterKey = obj.data("filterKey");
            let htmlStr = `
                <ul class="jmgo-search-box">
            `;
            for(let i = 0;i < ms.filterList.length; i++){
                htmlStr += `<li style="height: 30px;width: 100%;float: left;border: none;text-align: left;cursor: default;"  data-info=${JSON.stringify(ms.filterList[i])}>
                    <span title="${ms.filterList[i][filterKey]}">${ms.filterList[i][filterKey]}</span>
                </li>`
            };
            htmlStr += `</ul>`;
            obj.append(htmlStr);
            ms.listFlag ? obj.find("input").focus() : null;
            obj.find("li").first().addClass("active-search-li");
            ms.bindEvent(obj);
        },
        "filter": function(obj){
            ms.filterList = [];
            let fullData = obj.data("fullData");
            let filterKey = obj.data("filterKey");
            let len = fullData.length;
            let re = new RegExp(ms.currentVal)
            for(let i = 0; i < len; i++){
                if (re.test(fullData[i][filterKey])){
                    ms.filterList.push(fullData[i])
                }
            }
        },
        bindEvent: function(obj){
            obj.off("click");
            obj.off("focus").on("focus", "input", function(){
                obj.find("ul").css({"width": obj.width() + "px","left": $(this).offset().left + "px","top": $(this).offset().top + $(this).height() + "px"})
                $(".jmgo-search-box").hide();
                obj.find("ul").show();
            });
            $("body").off("click").on("click", function(){
                $(".jmgo-search-box").hide();
            });
            obj.off("input propertychange").on("input propertychange", "input", function(e){
                ms.listFlag = true;
                ms.currentVal = this.value;
                let requestFlag = obj.data("requestFlag");
                let requestInfo = obj.data("requestInfo");
                if (requestFlag) {
                    $.ajax({
                        url: requestInfo.url,
                        type: requestInfo.type,
                        dataType: "JSON",
                        data: {
                            [requestInfo.searchKey]: ms.currentVal
                        },
                        async: false,
                        success: function(res){
                            obj.data("fullData", res.data);
                        }
                    })
                };
                ms.fillHtml(obj);                    
            })
            obj.off("keyup").on("keyup", "input", function(e){
                e = e || window.event;
                let eCode = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
                if (eCode == 13) {
                    ms.listFlag = false;
                    // 回车
                    ms.currentVal = obj.children("ul").children(".active-search-li").find("span")[0].innerHTML;                    
                    obj.data('info', obj.children("ul").children(".active-search-li").data("info"));
                    ms.fillTopHtml(obj);
                };
            });
            obj.off("keydown").on("keydown", "input", function(e){
                e = e || window.event;
                let eCode = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
                if (eCode == 40) {
                    // 方向键下
                    let index = obj.find("li").index(obj.find(".active-search-li"));
                    index < ms.filterList.length - 1 ? obj.find("li").removeClass("active-search-li").eq(index + 1).addClass("active-search-li") : null;
                    if (index > 3 && ms.filterList.length > 4) {
                        obj.find("ul").scrollTop(obj.find("ul").scrollTop() + 30.4)
                    };
                }else if (eCode == 38) {
                    // 方向键上
                    let index = obj.find("li").index(obj.find(".active-search-li"));
                    index > 0 ? obj.find("li").removeClass("active-search-li").eq(index - 1).addClass("active-search-li") : null;
                    if (index > 3 &&  obj.find("ul").scrollTop() > 0) {
                        obj.find("ul").scrollTop(obj.find("ul").scrollTop() - 30)
                    };
                }
            })
            obj.on("click", function(e){
                e = e || window.event;
                if (e.stopPropagation) {
                    e.stopPropagation();
                }else{
                    e.cancelBubble = true;
                };
            });
            obj.on("click", "li", function(e){
                ms.listFlag = false;
                ms.currentVal = $(this).find("span")[0].innerHTML;
                obj.data('info', $(this).data("info"));
                ms.fillTopHtml(obj);
            })
        }
    };
    $.fn.createSearch = function(options){
        let args = $.extend({
            "data": [],
            "initVal": {},
            "filterKey": 'name',
            "requestFlag": false,
            "requestInfo":{
                "url": "",
                "type": "POST",
                "searchKey": 'name'                
            }
        }, options)
        ms.init(this, args);
        return ms;
    }
    $.fn.getValue = function(){
        return this.data("info");
    }
})(jQuery)