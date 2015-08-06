var statistics = function () {
    var url="http://112.124.51.187:9200/";
    //url=location.href;

    // 获取ElasticSearh基本节点信息
    var get_collapse_node_info = function () {
        $.getJSON(url, function(data) {
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
    }


    // last return
    return {
        init: function () {
            handelControls();
            get_collapse_node_info();
            get_collapse_index_info();
            //window.getuserlogs = getuserlogs;
        }//,
        //getuserlogs: getuserlogs
    };
}();
