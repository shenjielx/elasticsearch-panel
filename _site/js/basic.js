var statistics = function () {
    var fileds_list = [];
    var url=$(".J_connectUrl").val();//"http://112.124.51.187:9200/";

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

    // 获取ElasticSearh基本节点信息
    var get_collapse_node_info = function () {
      var index = layer.load(2, {time: 30*1000,shade: [0.8, '#393D49']});
      $(".J_connectWarning").text("");
      var postData={};
      $.ajax({
          type: "GET",
          data: postData,
          url: url,
          success: function (data) {
            var items = [];
            $('#collapse_node_info .panel-body').html('');
            items = jsonToHtml(data);

            $('<ul/>', {
              'class': 'my-new-list',
              html: items.join('')
            }).appendTo('#collapse_node_info .panel-body');
            layer.close(index);
            get_collapse_index_info();
          },
          error: function (res) {
            $(".J_connectWarning").text("连接失败！");
            layer.close(index);
            layer.msg('连接失败！',{time:1000,shade: [0.8, '#393D49']});
          }
      });

    }

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

    // 获取ElasticSearh基本节点信息
    var get_collapse_index_info = function () {
        var postData={};
        $.ajax({
            type: "GET",
            data: postData,
            url: url+"_status",
            success: function (data) {
              var items = [],docs=[];
              $('#collapse_index_info .panel-body').html('');
              items = jsonToHtml(data);

              docs.push(data["indices"]);
              set_docs_list(docs);

              $('<ul/>', {
                'class': 'my-new-list',
                html: items.join('')
              }).appendTo('#collapse_index_info .panel-body');
            },
            error: function (res) {

            }
        });
    }
    // 获取文档列表
    var set_docs_list=function(docs){
      var _htm='';
      $.each(docs[0], function(key, val) {  // key是序号:1,2,...., val是遍历值.
        var temp=val["docs"]["num_docs"];
        _htm += '<option value="'+key+'">'+key+'('+temp+'个文档)</option>';
      });
      $('.searchDocs').html(_htm);

      get_docs_mapping();
    }
    // 初始化设置
    var handelControls = function () {
        $(".J_connectUrl").val(location.href);

        //连接ES集群
        $(".btnConnect").click(function(){
          get_collapse_node_info();
        });

        // 获取文档mapping映射字段
        $(".searchDocs").change(function(){
          get_docs_mapping();
        });

        // 获取字段赋值控件
        $(".searchField,.searchFieldComplex").change(function(){
          var op_sel = $(this).parents(".search-column");
          op_sel.find(".searchInput").remove();
          set_field_operation(this);
        });

        //添加新的条件行
        $(".btnAdd").click(function(){
          add_column(this);
        });
        set_default();

        $("#J_tips").click(function(){
          layer.tips($("#J_tipsContent").html(), '#J_tips', {
              tips: [2, '#3595CC'],
              time: 0,
              closeBtn: 1,
              maxWidth: '540px',
              area: 'auto'
          });
        });
        $("#J_tipsFormat").click(function(){
          layer.tips($("#J_tipsFormatContent").html(), '#J_tipsFormat', {
              tips: [2, '#3595CC'],
              time: 0,
              closeBtn: 1,
              maxWidth: '540px',
              area: 'auto'
          });
        });
    }
    // 设置部分初始化操作
    var set_default=function(){
        //删除条件行
        $(".btnDel").click(function(){
          var remove_col = $(this).parents(".J_add_column");
          var that = $(this).parents(".search-column");
          if (remove_col && remove_col.length > 0) {
            remove_col.remove();
          }else{
            var field = that.find(".searchField");
            field && field.val(field.children("option:first").val());
            var field_complex = that.find(".searchFieldComplex");
            field_complex && field_complex.val(field_complex.children("option:first").val());
            that.find(".J_add_operation").remove();
            that.find(".J_add_input").remove();
            that.find(".J_add_range").remove();
            that.find(".J_add_fuzzy").remove();
          }
        });
    }

    // 设置字段赋值输入框的初始化
    var set_init_operation = function(){
      // 获取字段赋值输入框
      $(".searchOperation").change(function(){
        $(this).parent("span").next().remove();
        var val = $(this).val();
        var _input = set_field_input(val);
        $(this).parent("span").after(_input);
        $(".J_chkFields")[0].checked = true;
      });
    }

    // 设置查询的字段
    var set_default_fields = function(){
      $(".J_chkFields").click(function(){
        var isChecked = $(this)[0].checked;
        var list = $('#collapse_field .panel-body input');
        $.each(list,function(key,val){
          $(this)[0].checked = isChecked;
        });
      })
    }

    //添加条件行
    var add_column=function(obj){
      //var btnHtml=$(obj).parent("span").html();
      var parent=$(obj).parents("dd");
      var col1=parent.find(".search-column span:first");
      var col2=parent.find(".search-column span:last");
      var _htm='<span>'+col1.html()+'</span>'+'<span>'+col2.html()+'</span>';
      //_htm=_htm.replace(btnHtml,"");
      $('<div/>', {
        'class': 'search-column J_add_column',
        html:_htm
      }).appendTo(parent);

      // 获取字段赋值控件
      $(".searchField,.searchFieldComplex").change(function(){
        var op_sel = $(this).parents(".search-column");
        op_sel.find(".searchInput").remove();
        set_field_operation(this);
      });
      set_default();
    }

    // 获取文档mapping映射
    var get_docs_mapping=function(){
      $("#search_time").text('--');
      $("#search_total").text('--');
      $(".pagination").html('');
      $(".J_result").html('');
      //var index = layer.load(2, {time: 30*1000,shade: [0.8, '#393D49']});
      var sel_docs=$(".searchDocs").val();
      var postData={};
      $.ajax({
          type: "GET",
          data: postData,
          url: url+"_cluster/state",
          success: function (data) {
            var mapping=parseJsonToField(data["metadata"]["indices"][sel_docs]);
            $(".searchField").html(mapping);
            $(".sortField").html(mapping);
            $(".J_add_column").remove();
            $(".J_add_operation").remove();
            $(".J_add_input").remove();
            $(".J_add_range").remove();
            $(".J_add_fuzzy").remove();
            //layer.close(index);
          },
          error: function (res) {
            //layer.close(index);
            layer.msg('获取文档mapping映射失败！',{shade: [0.8, '#393D49']});
          }
      });
    }

    // 解析json
    var parseJsonToField = function collapse(data) {
      var default_field = '<option value="match_all">match_all</option>';
      var options = [];
      var complex = [];
      if (data) {
        fileds_list = new Array();
        var mapping=data["mappings"];
        $.each(mapping, function(key_map, val_map) {
          var index=key_map;
          var fields=val_map["properties"];
          $.each(fields, function(key_field, val_field) {
            fileds_list.push(key_field);
            var sub_fields = val_field["properties"];
            var filed = index+"."+key_field;
            var data_type = val_field["type"];
            if(data_type == "nested"){
                $.each(sub_fields, function(key_sub, val_sub) {
                    var sub_field = filed + "." + key_sub;
                    var sub_data_type = val_field["type"];
                    var temp_option = '<option value="' + sub_field + '" data-type="' + sub_data_type + '">' + sub_field + '</option>';
                    complex.push(temp_option);
                });
            }else{
                var temp_option = '<option value="'+filed+'" data-type="'+data_type+'">'+filed+'</option>';
                options.push(temp_option);
            }

          });
        });

        fileds_list.sort();
        var _chk_htm = '';// 设置该文档的所有字段
        var i = 0;
        $.each(fileds_list,function(k,v){
            i++;
            _chk_htm += '<span class="col-md-2 col-xs-3 col-sm-4"><input type="checkbox" class="chkShowJson" checked="true" id="' + i + '_' + v + '" value="'+ v +'" />';
            _chk_htm += '<label for="' + i + '_' + v + '" class="form-label">'+ v +'</label></span>';
        });

        $("#collapse_field .panel-body").html(_chk_htm);
        set_default_fields();
      }
      $(".searchFieldComplex").html(default_field + " " + complex.join(" "));

      options.sort();
      return default_field + " " + options.join(" ");
    }

    // 设置字段赋值控件操作选项
    var set_field_operation=function(obj){
      var that=$(obj);
      var val=that.val();
      that.parents(".search-column").find(".span-Operation").remove();
      if (val.indexOf(".")>0) {
        var _htm='<span class="span-Operation J_add_operation"><select class="searchOperation form-control pull-left" name="searchOperation" style="max-width:130px;">';
        _htm+='<option value="term">term</option>';
        _htm+='<option value="wildcard">wildcard</option>';
        _htm+='<option value="fuzzy">fuzzy</option>';
        _htm+='<option value="range">range</option>';
        _htm+='<option value="prefix">prefix</option>';
        _htm+='<option value="query_string">query_string</option>';
        _htm+='<option value="text">text</option>';
        _htm+='<option value="missing">missing</option></select>';
        _htm+='</select><span>';

        that.parent("span").after(_htm);
        var span_Operation=that.parents(".search-column").find(".span-Operation");
        if (span_Operation!="undefined") {
          var _input = set_field_input(span_Operation.find(".searchOperation").val());
          span_Operation.after(_input);
        }
        set_init_operation();
      }
    }

    // 设置字段赋值控件框
    var set_field_input=function(val){
      var _htm='<span>';
      switch (val) {
        case "term":
        case "wildcard":
        case "prefix":
        case "query_string":
        case "text":
            _htm='<input type="text" class="searchInput form-control pull-left J_add_input" name="searchInput" style="max-width:150px;" />';
            break;
        case "range":
            _htm += '<span class="J_add_range"><select class="searchRangeLeft form-control pull-left" name="searchRangeLeft" style="max-width:80px;">';
            _htm += '<option value="from">from</option>';
            _htm += '<option value="gt">gt</option>';
            _htm += '<option value="gte">gte</option>';
            _htm += '</select><span>';
            _htm += '<input type="text" class="searchInputLeft form-control pull-left J_add_input" name="searchInputLeft" style="max-width:150px;" />';
            _htm += '<span class="J_add_range"><select class="searchRangeRight form-control pull-left" name="searchRangeRight" style="max-width:70px;">';
            _htm += '<option value="to">to</option>';
            _htm += '<option value="lt">lt</option>';
            _htm += '<option value="lte">lte</option>';
            _htm += '</select><span>';
            _htm += '<input type="text" class="searchInputRight form-control pull-left J_add_input" name="searchInputRight" style="max-width:150px;" />';
          break;
        case "fuzzy":
            _htm += '<input type="text" class="searchInputLeft form-control pull-left J_add_input" name="searchInputLeft" style="max-width:150px;" />';
            _htm += '<span class="J_add_fuzzy"><select class="searchFuzzy form-control pull-left" name="searchFuzzy" style="max-width:150px;">';
            _htm += '<option value="max_expansions">max_expansions</option>';
            _htm += '<option value="min_similarity">min_similarity</option>';
            _htm += '</select><span>';
            _htm += '<input type="text" class="searchInputRight form-control pull-left J_add_input" name="searchInputRight" style="max-width:150px;" />';
            break;
        case "missing":
            break;
        default:
            break;
      }
      _htm += '<span>';
      return _htm;
    }

    // last return
    return {
        init: function () {
            handelControls();
            get_url();
            get_collapse_node_info();
        }
    };
}();
