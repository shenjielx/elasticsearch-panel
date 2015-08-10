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
        postData["_source"] = fields;
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
      postData.query = get_basic_condition();

      var result = postData;
      result = JSON.stringify(postData);
      return result;
    }

    // 获取基本查询条件
    var get_basic_condition = function(){
        var query = {
          bool:{
            must:[],
            must_not:[],
            should:[]
          }
        };
        var list = $(".searchBasic .search-column");
        $.each(list,function(key,val){
            var bool_val = $(this).find(".searchBool").val();
            var field_val = $(this).find(".searchField").val();
            var op_val = $(this).find(".searchOperation").val();
            var val = $(this).find(".searchInput").val();
            if (op_val && val != null && val.length > 0) {
                // 有该选项才是有用的操作条件
                var field = {}, op = {};
                field[field_val] = val;
                op[op_val] = field;
                query["bool"][bool_val].push(op);
            }
        });
        return query;
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
        for (var i = start; i < start + 5; i++) {
          var active = i == pageIndex ? ' class="active"' : '';
          var pager_class = i != pageIndex ? ' class="J_pager"' : '';
          _htm += '<li'+ active +'><a'+ pager_class +' href="javascript:;" data-index="'+ i +'">'+ (i + 1) +'</a></li>';
        }
      }
      if (pageIndex <= total_page && total_page > 1) {
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
        var filed_val = item["_source"];

        for (var j = 0; j < fields.length; j++) {
          var field = fields[j];
          var len = '';
          var val = '';
          if (field in filed_val) {
            val = filed_val[field];
            val = val!=null&&typeof(filed_val[field]) === 'object'?"--":val;
            if (val != null) {
              var strlength = strlen(val);
              var len = ' style="min-width:'+ (strlength * 9) +'px;"';
            }
          }
          _tbody += '<td'+ len +'>'+ HTMLDecode(val).replace(/\s+/g,"").replace("<","&lt;").replace(">","&gt;") +'</td>';
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
    var HTMLEncode = function(html){
        var temp = document.createElement ("div");
        (temp.textContent != null) ? (temp.textContent = html) : (temp.innerText = html);
        var output = temp.innerHTML;
        temp = null;
        return output;
    }

    var HTMLDecode = function(text){
        var temp = document.createElement("div");
        temp.innerHTML = text;
        var output = temp.innerText || temp.textContent;
        temp = null;
        return output;
    }
    // 初始化设置
    var handelControls = function () {
      // 搜索查询
      $("#btnSearch").click(function(){
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
