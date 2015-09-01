var search = function () {
    var url=$(".J_connectUrl").val();//"http://112.124.51.187:9200/";
    var pageIndex = 0;
    var pageSize = 10;
    var get_url = function(){
      url = $(".J_connectUrl").val();
      if (location.href.indexOf("http://")>0) {
        url=location.href;
      }
      if (url.length<1) {
        url="http://localhost:9200/";
      }
      if(url.indexOf("/_plugin/")>0) {
        url = url.replace(/_plugin\/.*/, '');
      }
    }
    //url=location.href;

    // 解析json递归
    var jsonToHtml = function(data){
        var items = [];
        for (var key in data) {
            var val = data[key];
            if (typeof(val) === 'object') {
                items.push('<li id="' + key + '"><strong>'+key+'：</strong>');
                items.push('<ul>');
                var temp = jsonToHtml(val);
                items = items.concat(temp);
                items.push('</ul>');
                items.push('</li>');
            }else{
                items.push('<li id="' + key + '"><strong>'+key+'：</strong>"' + val + '"</li>');
            }
        }
        return items;
    }

    var set_post_data = function (fields) {
      pageSize = $(".pageSize").val();
      var postData={
        query:{
          bool:{
            must:[
              {
                match_all:{}
              }
            ],
            must_not:[],
            should:[]
          }
        },
        from:pageIndex,
        size:pageSize,
        sort:[],
        facets:{}
      };
      // 返回字段
      if (fields != null) {
        postData["fields"] = fields;
      }
      // 排序
      var sortField = $(".sortField").val();
    	if (sortField != "match_all" && sortField != "_all" && sortField.length>1) {
    		var sortType = $(".sortType").val();
    		var sortinfo = {}, sortfield = {};
        sortfield[sortField] = { "order": sortType };
    		sortinfo = [sortfield];
    		postData.sort=sortinfo;
    	}
      // 基本条件
      var list_basic = $(".searchBasic .search-column");
      postData.query = get_basic_condition(list_basic , 'searchField');
      // 复合字段
      var list_complex = $(".searchComplex .search-column");
      var list_complex_query = get_complex_condition(list_complex);
      if (list_complex_query != null && list_complex_query.length > 0) {
          postData.query.bool.must.push(list_complex_query);
      }
      //postData.query = get_basic_condition(query, list_complex, false);


      var result = postData;
      $("#collapse_search_json .panel-body .my_search_json").html(jsonToHtml(result).join(''));
      result = JSON.stringify(postData);
      return result;
    }

    // 获取查询条件
    var get_basic_condition = function(list, fieldClass){
        var query = {
          bool:{
            must:[
              {
                "match_all":{}
              }
            ],
            must_not:[],
            should:[]
          }
        };
        query = fieldClass == "searchField" ? query : {
          bool:{
            must:[
              {
                "match_all":{}
              }
            ]
          }
        };
        $.each(list,function(key,val){
            var has_query = false;
            var field = {}, op = {};
            var bool_val = $(this).find(".searchBool").val();
            var field_val = $(this).find("." + fieldClass).val();
            if (field_val!="match_all") {
              field_val = fieldClass == "searchFieldComplex" ? field_val.split('.')[2] : field_val;
              var op_val = $(this).find(".searchOperation").val();
              if (op_val) {

                switch (op_val) {
                  case "term":
                  case "prefix":
                  case "query_string":
                  case "text":
                      var val = $(this).find(".searchInput").val();
                      if (op_val && val != null && val.length > 0) {
                          // 有该选项才是有用的操作条件
                          field[field_val] = ""+val;
                          op[op_val] = field;
                          has_query = true;
                      }
                      break;
                  case "range":
                    var val_left = $(this).find(".searchInputLeft").val();
                    var val_right = $(this).find(".searchInputRight").val();
                    var op_val_left = $(this).find(".searchRangeLeft").val();
                    var op_val_right = $(this).find(".searchRangeRight").val();
                    if (op_val) {
                        var range = {};
                        //{"range":{"webfeed.author":{"from":"1","to":"2"}}}
                        if (val_left != null && val_left.length > 0) {
                            // 有该选项才是有用的操作条件
                            range[op_val_left] = val_left;
                        }
                        if (val_right != null && val_right.length > 0) {
                            // 有该选项才是有用的操作条件
                            range[op_val_right] = val_right;
                        }
                        field[field_val] = range;
                        op[op_val] = field;
                        has_query = true;
                    }
                    break;
                  case "fuzzy":

                      break;
                  case "missing":
                      // {"constant_score":{"filter":{"missing":{"field":"webfeed.author"}}}}
                      var missing = {};
                      field = {"field" : field_val};
                      missing["missing"] = field;
                      op["constant_score"] = {"filter" : missing};
                      has_query = true;
                      break;
                  default:
                      break;
                }
                if(has_query){
                    query["bool"][bool_val].push(op);
                }
            }
          }
        });
        return query;
    }

    // 获取复合字段查询
    var get_complex_condition = function(list){
      var list_complex = new Array();
      var arr = new Array();
      $.each(list,function(key,val){
        var field_val = $(this).find(".searchFieldComplex").val();
        if (field_val!="match_all") {
          var temp_arr = field_val.split('.');
          var parent_field = field_val;
          if (temp_arr.length > 2) {
              parent_field = temp_arr[1];
          }
          var temp = new Array();
          var isExists = false;
          if (arr && arr.length > 0) {
              $.each(arr,function(key,val){
                  if(val['name'] == parent_field){
                      temp = val;
                      isExists = true;
                  }
              });
          }
          if(isExists){
              temp['list'].push(this);
          }else{
              temp['name'] = parent_field;
              temp['list'] = new Array();
              temp['list'].push(this);
              arr.push(temp);
          }
        }
          //var query = get_basic_condition(key,"searchFieldComplex");
      });
      if (arr && arr.length > 0) {
          $.each(arr,function(key,val){
              var path = val.name;
              var filtered = {
                filtered:{
                  filter:{
                    nested:{
                      query: {},
                      path: path
                    }
                  }
                }
              };
              var query = get_basic_condition(val.list,"searchFieldComplex");
              filtered.filtered.filter.nested.query = query;
              list_complex.push(filtered);
          });
      }
      return list_complex;
    }


    var get_chk_val = function(){
      var fields = [];
      var list = $('#collapse_field .panel-body input:checked');
      $.each(list,function(key,val){
        fields.push($(this).val());
      });
      return fields;
    }

    // 获取ElasticSearh基本节点信息
    var search = function () {
      var fields = get_chk_val();
      var index = layer.load(2, {time: 30*1000,shade: [0.8, '#393D49']});
      var sel_docs = $(".searchDocs").val();

      var postData = set_post_data(fields);
      $.ajax({
          type: "POST",
          data: postData,
          dataType : "json",
          url: url+sel_docs+"/_search",
          success: function (data) {
            var hits = data["hits"];

            // 获取table格式
            var _htm = '';
            _htm = get_table(hits["hits"],fields);
            $(".J_result").html(_htm);

            // 查询耗时
            var time = parseFloat(data["took"])/1000;
            $("#search_time").text(time);

            // 查询结果总数
            var total = hits["total"];
            $("#search_total").text(total);
            set_pager(total);

            // 收缩和展开字段列
            $(".J_flexHide").click(function(){
      				$(this).hide();
      				$(".J_flex").hide();
      				$(".J_flexShow").show();
      			});
      			$(".J_flexShow").click(function(){
      				$(this).hide();
      				$(".J_flex").show();
      				$(".J_flexHide").show();
      			});

            layer.close(index);
          },
          error: function (res) {
            layer.close(index);
            layer.msg('查询失败！',{time:1000,shade: [0.8, '#393D49']});
          }
      });

    }

    // 设置分页
    var set_pager = function(total){
      var _htm = '';
      var total_page = Math.ceil(total / pageSize);
      if (pageIndex > 0) {
        _htm += '<li><a class="J_pager" href="javascript:;" data-index="0" aria-label="first"><span aria-hidden="true">首页</span></a></li>';
        _htm += '<li><a class="J_pager" href="javascript:;" data-index="0" aria-label="Previous"><span aria-hidden="true">上一页</span></a></li>';
      }
      var pager = [];
      if (total_page > 1) {
        var start = pageIndex > 5 ? (pageIndex - 2) : 0;
        var end = start + 5;
        end = total_page > end? end : total_page;
        for (var i = start; i < end; i++) {
          var active = i == pageIndex ? ' class="active"' : '';
          var pager_class = i != pageIndex ? ' class="J_pager"' : '';
          _htm += '<li'+ active +'><a'+ pager_class +' href="javascript:;" data-index="'+ i +'">'+ (i + 1) +'</a></li>';
        }
      }
      if (pageIndex < total_page && total_page > 1) {
        _htm += '<li><a class="J_pager" href="javascript:;" data-index="'+ total_page +'" aria-label="Next"><span aria-hidden="last">下一页</span></a></li>';
          _htm += '<li><a class="J_pager" href="javascript:;" data-index="'+ total_page +'" aria-label="first"><span aria-hidden="true">尾页</span></a></li>';
      }
      $(".pagination").html(_htm);
      set_pager_init();
    }

    // 返回Table
    var get_table = function(list,fields){
      var _htm = '<table class="table table-bordered table-hover">';
      var _thead = '<thead><tr>';
      _thead += '<th style="min-width:60px;">序号 <a class="glyphicon glyphicon-triangle-right pull-right J_flexShow" aria-hidden="true" href="javascript:;" style="display:none;"></a></th>';
      _thead += '<th class="J_flex">_index</th>';
      _thead += '<th class="J_flex">_type</th>';
      _thead += '<th class="J_flex">_id</th>';
      _thead += '<th class="J_flex" style="min-width: 120px;">_score <a class="pull-right J_flexHide" href="javascript:;"><span class="glyphicon glyphicon-triangle-left" aria-hidden="true"></span> 收缩</a></th>';

      for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        _thead += '<th>'+ field +'</th>';
      }
      _thead += '</tr></thead>';

      var _tbody = '<tbody>';
      for (var i = 0; i < list.length; i++) {
        _tbody += '<tr>';
        _tbody += '<th scope="row">'+ (pageIndex * pageSize + i + 1) +'</th>';
        var item = list[i];
        _tbody += '<td class="J_flex" style="min-width:'+ (strlen(item["_index"]) * 10) +'px;">'+ item["_index"] +'</td>';
        _tbody += '<td class="J_flex" style="min-width:'+ (strlen(item["_type"]) * 10) +'px;">'+ item["_type"] +'</td>';
        _tbody += '<td class="J_flex" style="min-width:'+ (strlen(item["_id"]) * 10) +'px;">'+ item["_id"] +'</td>';
        _tbody += '<td class="J_flex" style="min-width:'+ (strlen(item["_score"]) * 10) +'px;">'+ item["_score"] +'</td>';
        var filed_val = item["fields"];

        for (var j = 0; j < fields.length; j++) {
          var field = fields[j];
          var len = '';
          var val = '';
          if (field in filed_val) {
            val = filed_val[field];
            val = val != null && typeof(filed_val[field]) === 'object' ? JSON.stringify(val) : val;

          }
          _tbody += '<td>'+ escapeHTML(val) +'</td>';//.replace(/\s+/g,"")
        }
        _tbody += '</tr>';
      }
      _tbody += '</tbody>';
      _htm += _thead + _tbody;
      _htm += '</table>';
      return _htm;
    }

    // 计算字符串长度(英文占1个字符，中文汉字占2个字符)
    function strlen(str){
        if (str == null || str == "undefined") {
          return 10;
        }
        var len = 0;
        for (var i=0; i<str.length; i++) {
         var c = str.charCodeAt(i);
        //单字节加1
         if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) {
           len++;
         }
         else {
          len+=2.2;
         }
        }
        return len;
    }

    /**
     * @function escapeHTML 转义html脚本 < > & " '
     * @param a - 字符串
     */
    var escapeHTML = function(a){
        a = "" + a;
        return a.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");;
    };
    /**
     * @function unescapeHTML 还原html脚本 < > & " '
     * @param a - 字符串
     */
    var unescapeHTML = function(a){
        a = "" + a;
        return a.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
    };

    // 初始化设置
    var handelControls = function () {
      // 搜索查询
      $("#btnSearch").click(function(){
        pageIndex = 0;
        search();
      });
    }

    // 分页初始化
    var set_pager_init = function(){
      $(".J_pager").click(function(){
        pageIndex = $(this).data("index");
        search();
      })
    }

    // last return
    return {
        init: function () {
            handelControls();
            get_url();
            //search();

        }
    };
}();
