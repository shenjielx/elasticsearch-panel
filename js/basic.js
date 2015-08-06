var statistics = function () {
    var url=$(".J_connectUrl").val();//"http://112.124.51.187:9200/";
    if (location.href.indexOf("http://")>0) {
      url=location.href;
      if(url.indexOf("/_plugin/")>0) {
        var base_uri = url.replace(/_plugin\/.*/, '');
      }
    }
    if (url.length<1) {
      url="http://localhost:9200/";
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
            layer.msg('连接失败！',{shade: [0.8, '#393D49']});
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


    var set_docs_list=function(docs){
      var _htm='';
      $.each(docs[0], function(key, val) {  // key是序号:1,2,...., val是遍历值.
        var temp=val["docs"]["num_docs"];
        _htm += '<option value="'+key+'">'+key+'('+temp+'个文档)</option>';
      });
      $('.searchDocs').html(_htm);
    }

    var handelControls = function () {
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

        //连接ES集群
        $(".btnConnect").click(function(){
          get_collapse_node_info();
        });

        //添加新的条件行
        $(".btnAdd").click(function(){
          add_column(this);
        });
        set_default();
    }

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

    //添加条件行
    var add_column=function(obj){
      var btnHtml=$(obj).parent("span").html();
      var parent=$(obj).parents("dd");
      var col=parent.children(".search-column:first");
      var _htm=col.html();
      _htm=_htm.replace(btnHtml,"");
      $('<div/>', {
        'class': 'search-column',
        'style':'margin-bottom:10px;',
        html:_htm
      }).appendTo(parent);
      set_default();
    }

    // last return
    return {
        init: function () {
            handelControls();
            get_collapse_node_info();

            //window.getuserlogs = getuserlogs;
        }//,
        //getuserlogs: getuserlogs
    };
}();
