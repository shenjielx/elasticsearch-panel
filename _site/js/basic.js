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

            $.each(data, function(key, val) {  // key是序号:1,2,...., val是遍历值.
              items.push('<li id="' + key + '"><strong>'+key+'：</strong>');
              if (typeof(val) === 'object') {
                  items.push('<ul>');
                  $.each(val, function(key1, val1) {
                      items.push('<li id="' + key1 + '"><strong>'+key1+'：</strong>"' + val1 + '"</li>');
                  });
                  items.push('</ul>');
              }else{
                  items.push('"'+val+'"');
              }
              items.push('</li>');
            });

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

              $.each(data, function(key, val) {  // key是序号:1,2,...., val是遍历值.
                items.push('<li id="' + key + '"><strong>'+key+'：</strong>');
                if (typeof(val) === 'object') {
                    items.push('<ul>');
                    $.each(val, function(key1, val1) {
                        //items.push('<li id="' + key1 + '"><strong>'+key1+'：</strong>"' + val1 + '"</li>');
                        items.push('<li id="' + key1 + '"><strong>'+key1+'：</strong>');
                        if (typeof(val1) === 'object') {
                            items.push('<ul>');
                            $.each(val1, function(key2, val2) {
                                //items.push('<li id="' + key2 + '"><strong>'+key2+'：</strong>"' + val2 + '"</li>');
                                items.push('<li id="' + key2 + '"><strong>'+key2+'：</strong>');
                                if (typeof(val2) === 'object') {
                                    items.push('<ul>');
                                    $.each(val2, function(key3, val3) {
                                        items.push('<li id="' + key3 + '"><strong>'+key3+'：</strong>"' + val3 + '"</li>');
                                    });
                                    items.push('</ul>');
                                }else{
                                    items.push('"'+val2+'"');
                                }
                                items.push('</li>');
                            });
                            items.push('</ul>');
                        }else{
                            items.push('"'+val1+'"');
                        }
                        items.push('</li>');
                    });
                    items.push('</ul>');
                }else{
                    items.push('"'+val+'"');
                }
                items.push('</li>');

              });

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
        $(".searchField").change(function(){
          set_field_operation(this);
        });

        //添加新的条件行
        $(".btnAdd").click(function(){
          add_column(this);
        });
        set_default();
    }
    // 设置部分初始化操作
    var set_default=function(){
        //删除条件行
        $(".btnDel").click(function(){
          var len=$(this).parents("dd").children(".search-column").length;
          if (len>1) {
            var col=$(this).parents(".search-column");
            col.remove();
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
      var _htm='<span>'+col1.html()+'<span>'+'<span>'+col2.html()+'<span>';
      //_htm=_htm.replace(btnHtml,"");
      $('<div/>', {
        'class': 'search-column',
        'style':'margin-bottom:10px;',
        html:_htm
      }).appendTo(parent);
      set_default();
    }

    // 获取文档mapping映射
    var get_docs_mapping=function(){
      $("#search_time").text('--');
      $("#search_total").text('--');
      $(".J_result").html('');
      var index = layer.load(2, {time: 30*1000,shade: [0.8, '#393D49']});
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
            layer.close(index);
          },
          error: function (res) {
            layer.close(index);
            layer.msg('获取文档mapping映射失败！',{shade: [0.8, '#393D49']});
          }
      });
    }

    // 解析json
    var parseJsonToField = function collapse(data) {
      var options=['<option value="match_all">match_all</option>'];
      if (data) {
        var mapping=data["mappings"];
        var _chk_htm = '';// 设置该文档的所有字段
        $.each(mapping, function(key_map, val_map) {
          var index=key_map;
          var fields=val_map["properties"];
          $.each(fields, function(key_field, val_field) {
            fileds_list.push(key_field);
            var filed=index+"."+key_field;
            var data_type=val_field["type"];
            options.push('<option value="'+filed+'" data-type="'+data_type+'">'+filed+'</option>');
            _chk_htm += '<span class="col-md-2 col-xs-3 col-sm-4"><input type="checkbox" class="chkShowJson" checked="true" value="'+ key_field +'" /><label class="form-label">'+ key_field +'</label></span>';
          });
        });
        $("#collapse_field .panel-body").html(_chk_htm);
        set_default_fields();
      }

      return options.join(" ");
    }

    // 设置字段赋值控件操作选项
    var set_field_operation=function(obj){
      var that=$(obj);
      var val=that.val();
      $(".searchOperation").parent("span").remove();
      if (val.indexOf(".")>0) {
        var _htm='<span class="span-Operation"><select class="searchOperation form-control pull-left" name="searchOperation" style="max-width:150px;">';
        _htm+='<option value="term">term</option>';
        _htm+='<option value="range">range</option>';
        _htm+='<option value="fuzzy">fuzzy</option>';
        _htm+='<option value="query_string">query_string</option>';
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
        case "query_string":
          _htm='<input type="text" class="searchInput form-control pull-left" name="searchInput" style="max-width:150px;" />';
          break;
        default:

      }
      _htm+='<span>';
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
