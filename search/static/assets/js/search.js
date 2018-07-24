$(function() {
	$.ajaxSetup({
		headers: {
			'X-CSRF-Token':$('meta[name="_token"]').attr('content')
		}
	})
})


$(document).ready(function(){
	$('.shader-box').hide();
	$('.search-keyword').hide();
	$('#main').hide();
	$('.loading-box').hide();

	var search_keyword_num = 0;
	var search_word_array = new Array();
	var news_array = new Array();
	var news_in_box = 5;
	var select_page = -1;
	var Max_length = -1;
	var last_page = -1;
	var search_tab = '全部';
	var search_order_tab = '相关度';
	var time_condition = '';
	var label_search_word = '';
	var star_info_array = new Array();
	var StarisDetailDataHide;
	var select_star = 0;
	var team_info_array = new Array();
	var star_info_data_array = new Array();
    var	team_info_data_array = new Array();
	var TeamisDetailDataHide;
	var select_team = 0;
	var search_type = 0;

	var isSearching = false;


	$(".dropdown-presentation").mouseenter(function(){
    		$(this).find('text').css('color','#000')	
    })

    $(".dropdown-presentation").mouseleave(function(){
    		$(this).find('text').css('color','#fff')	
    })

    $(".dropdown-presentation").click(function(){
    		$('#dropdownMenu1>text').text($(this).text());
    		search_tab = $(this).find('text').text();
    })

    $(".dropdown-presentation-order").mouseenter(function(){
    		$(this).find('text').css('color','#000')	
    })

    $(".dropdown-presentation-order").mouseleave(function(){
    		$(this).find('text').css('color','#fff')	
    })

    $(".dropdown-presentation-order").click(function(){
    		if (search_order_tab != $(this).find('text').text()) {
    			search_order_tab = $(this).find('text').text();
    			$('#dropdownMenu2 > text').text(search_order_tab);
    			if (search_order_tab == '时间')
    				news_array = news_array.sort(time_cmp); // [1, 2, 3]
    			else 
    				news_array = news_array.sort(rel_cmp); // [1, 2, 3]
    		}
    		$('.news-detail').empty();
    		$('.change-page-box').empty();
    		putNews();
    })

    //排序函数
    function time_cmp(a, b){
    	if (a['_source']['my_time'] > b['_source']['my_time']) return -1
    	else return 1
    }

	function rel_cmp(a, b){
    	if (a['_score'] > b['_score']) return -1
    	else return 1
    }


    $('.fa-search').mouseenter(function(){
    		$(this).css('background-color','rgba(255, 255, 255, 0.2)')	
    })

    $('.fa-search').mouseleave(function(){
    		$(this).css('background-color','rgba(255, 255, 255, 0)')	
    })

    $('.search-box').keydown(function(event) {
    		if (event.which == 13) {
    			$('.fa-search').click();
    		}
    })


    $('.fa-search').click(function(){
    		var search_origin_word = $('.search-box').val();
    		if ((  ($('.search-box').val().length > 0 && $.trim(search_origin_word) != '')  || search_type > 0) && (!isSearching) ) {
    			
	    		$(this).css('background-color','rgba(255, 255, 255, 0.2)')	
	    		$('#header > div.content').animate({'margin-top':'8rem'});
	    		$('.nba-logo').hide();
	    		$('#main').show();
	    		setTimeout(function(){
					$('.shader-box').show(); 
					$('.search-keyword').show();
				},300);

				//清空
				$('.change-page-box').empty();
				$('.news-box-title').hide();
				$('.news-detail').empty();
				$('.star-box').empty();
				$('.team-box').empty();

				$('.star-box-title').hide();
				$('.team-box-title').hide();
				$('.relative-star-box').empty();
				$('.relative-team-box').empty();

				$('.star-divide-line').hide();
				$('.team-divide-line').hide();

				$('.change-button-skip-box > div:nth-child(2)').hide();
				$('.research').remove();
				search_order_tab = '相关度';
				
    			$('#dropdownMenu2 > text').text(search_order_tab);
    			var recent_res = 0;
    			var search_word;
    			var search_source = new Array();
    			var search_label;
    			var search_star = new Array();
    			var search_team = new Array();
				var search_recent;

    			if (search_type == 0) {
    				$('.condition-box').remove();
    				search_keyword_num = 0;
    				search_word_array = [];
    				$('.search-container').empty();

    				search_keyword_num = search_keyword_num + 1;
					AddKeyword(search_tab, search_keyword_num, true);
					search_word_array.push(['tab', search_tab]);

					search_word = $.trim(search_origin_word);
					search_keyword_num = search_keyword_num + 1;
					AddKeyword(search_word, search_keyword_num, true);
					search_word_array.push(['key', search_word]);

					time_condition = '';

					search_label_map = {'全部':0, '新闻':1, '球队':2, '球星':3};
					search_label = search_label_map[search_tab];
					recent_res = 0;

					search_source.push('all');

    			} else if (search_type == 1){
    				time_label_map = {'近一天':1, '近一周': 2, '近一月': 3, '': 0};
    				search_label_map = {'全部':0, '新闻':1, '球队':2, '球星':3, '标签': 4};
    				recent_res = time_label_map[time_condition];
    				for (var i=0; i < search_word_array.length; i++) {
    					if (search_word_array[i][0] == 'tab') 
    						search_label = search_label_map[search_word_array[i][1]]
    					else if (search_word_array[i][0] == 'key')
    						search_word =search_word_array[i][1]
    					else if (search_word_array[i][0] == 'source') 
    						search_source.push(search_word_array[i][1]);
    					else if (search_word_array[i][0] == 'star')
    						search_star.push(search_word_array[i][1]);
    					else if (search_word_array[i][0] == 'team')
    						search_team.push(search_word_array[i][1]);
    				}
    			} else if (search_type == 2) {
    				$('.search-box').val('');
					$('.condition-box').remove();

    				search_keyword_num = 0;
    				search_word_array = [];
    				$('.search-container').empty();

    				search_keyword_num = search_keyword_num + 1;
					AddKeyword('标签', search_keyword_num, true);
					search_word_array.push(['tab', '标签']);

					search_word = label_search_word; 
					label_search_word = '';
					search_keyword_num = search_keyword_num + 1;
					AddKeyword(search_word, search_keyword_num, true);
					search_word_array.push(['key', search_word]);

					time_condition = '';

					search_label = 4;
					recent_res = 0;

					search_source.push('all');
    			}
    			star_info_array = []
    			team_info_array = []
				star_info_data_array = []
    			team_info_data_array = []
				
    			select_star = 0
				//发送数据给后台	
				
				console.log("search word: " + search_word);
				console.log("search label: " + search_label);
				console.log("search source: " + search_source);
				console.log("search recent: " + recent_res);
				console.log("search star: " + search_star);
				console.log("search team: " + search_team);

				var csrf_token = Cookies.get('csrftoken');
				$('.loading-box').show();
				isSearching = true;
				$.ajax({
					type: "POST",
					url: "http://127.0.0.1:8000/search/index",
					data:
					{
	                	'keyword': search_word,
                    	'source':search_source, 
                    	'recent':recent_res,
                    	'label': search_label,
          				'star': search_star,
          				'team': search_team,
						'csrfmiddlewaretoken': csrf_token,
					 },
					success: function(data,status,request){
						console.log(data);
							
						if (search_tab == '全部' || search_tab == '新闻') {
							data_source_count = data.result.source_list;
							data_recent_list = data.result.recent_list;
							time_count = [data_recent_list['count_recent_1day'], data_recent_list['count_recent_7day'], data_recent_list['count_recent_30day']];
							source_count = [data_source_count['count_source_souhu'], data_source_count['count_source_sina'], data_source_count['count_source_wangyi'], data_source_count['count_source_hupu']]

							news_array = data.result.data_list;
							for (var i=0; i<news_array.length; i++) {
								newtime = news_array[i]['_source']['my_time'];
								var date=new Date(newtime.replace(/-/g, '/'));
								news_array[i]['_source']['my_time'] = date;
							}
							news_array = news_array.sort(rel_cmp); // [1, 2, 3]
							$('#news-total-count').text('总共为您找到相关结果' + data.result.recent_list['count_recent_all'] + '个')
						}
						$('.loading-box').hide();
						
						if (search_tab == '全部' && search_type != 2) {
							if ( "player_list" in data.result) {
								star_info_array =data.result.player_list;
								star_info_data_array = data.result.player_data_list;
								if (star_info_array.length > 0)
									putStar(true);
								
							}
							if ("team_list" in data.result){
								team_info_array = data.result.team_list;
								team_info_data_array = data.result.team_data_list;
								if (team_info_array.length > 0)
									putTeam(true);
								
							}
							putNews();
							if (search_type != 1) {
								generateTimeCondition('时间', ['近一天','近一周','近一月'], time_count, false)
								generateCondition('来源', ['搜狐体育','新浪体育','网易体育','虎扑体育'], 'source', source_count, false)
							}
							starnameList = new Array();
							if (star_info_array.length > 0) {
								for (var i=0; i<star_info_array.length; i++)
									starnameList.push(star_info_array[i]['_source']['中文名']);
								if (search_type != 1) {
									generateCondition('球星', starnameList, 'star', [], true);
								}
							}
							teamnameList = new Array();
							if (team_info_array.length > 0) {
								for (var i=0; i<team_info_array.length; i++)
									teamnameList.push(team_info_array[i]['_source']['name']);
								if (search_type != 1) {
									generateCondition('球队', teamnameList, 'team', [], true);
								}
							}
							
						} else if (search_tab == '球队') {
							team_info_array = data.result.team_list;
							team_info_data_array = data.result.team_data_list;
							if (team_info_array.length > 0) {
								putTeam(false);
							} else {
								$('.team-box-title').show();
								$('.team-box').append('<text style="font-size: 0.8rem; color:rgb(200, 200, 200);">没有找到相关球队</text>');
							}
							
							teamnameList = new Array();
							if (team_info_array.length > 0) {
								for (var i=0; i<team_info_array.length; i++)
									teamnameList.push(team_info_array[i]['_source']['name']);
								if (search_type != 1) {
									generateCondition('球队', teamnameList, 'team', [], true);
								}
							}
						} else if (search_tab == '球星') {
							star_info_array = data.result.player_list;
							star_info_data_array = data.result.player_data_list;
							if (star_info_array.length > 0) {
								putStar(false);
							} else {
								$('.star-box-title').show();
								$('.star-box').append('<text style="font-size: 0.8rem; color:rgb(200, 200, 200);">没有找到相关球星</text>');
							}
							starnameList = new Array();
							if (star_info_array.length > 0) {
								for (var i=0; i<star_info_array.length; i++)
									starnameList.push(star_info_array[i]['_source']['中文名']);
								if (search_type != 1) { 
									generateCondition('球星', starnameList, 'star', [], true);
								}
							}
						} else if (search_tab == '新闻' || search_type == 2) {
							putNews();
							if (search_type != 1) {
								generateTimeCondition('时间', ['近一天','近一周','近一月'], time_count, false)
								generateCondition('来源', ['搜狐体育','新浪体育','网易体育','虎扑体育'], 'source', source_count, false)
							}
						}

						$('.navigator-bar').append('<button class="research">筛选</button>')

						$('.research').click(function(){
							search_type = 1;
							$('.fa-search').click();
						})

						search_type = 0;
						isSearching = false;
					}
	            });
			
    		}
    })

    function putNews() {
    		$('.news-box-title').show();
    		$('.change-button-skip-box > div:nth-child(2)').show();
    		//返回数据
    		
			last_page = Math.ceil(news_array.length / news_in_box);
			Max_length = Math.floor(Math.log10(last_page)+1);

			$('#total-page-button').text("(共" + last_page + "页)")

    		if (news_array.length/news_in_box > 5) {
    			for (var i=1; i<5; i++) 
	    			generateChangeButton(i);
	    		generateRightButton()
	    		select_page = 1;
	    		$('#page-1').css('background-color', 'rgba(255, 255, 255, 0.3)')
    		} else {
    			for (var i=1; i<news_array.length / news_in_box+1; i++) 
    				generateChangeButton(i);

    			select_page = 1;
    			$('#page-1').css('background-color', 'rgba(255, 255, 255, 0.3)')
    		}
    			
			changePage(0);
    }

    function putStar(IsShowDivideLine) {
    	$('.star-box-title').show();
    	putOneStar(0);
    	putRelativeStar();
    	if (IsShowDivideLine == false)
    		$('.star-divide-line').hide();
    	else
    		$('.star-divide-line').show();
    }

    function putOneStar(star_index) {
    	$('.star-box').empty();
    	StarisDetailDataHide = true;
		$('.star-box').append(FormStar(star_index, false))
		console.log(star_info_data_array);
		player_data_dict = star_info_data_array[0][0]['_source'];
		player_data_arr = [player_data_dict['season'], player_data_dict['得分'], player_data_dict['首发'],
							   player_data_dict['出场'], player_data_dict['时间'], player_data_dict['投篮'], 
							   player_data_dict['三分'], player_data_dict['罚球'], player_data_dict['篮板'],
							   player_data_dict['助攻'], player_data_dict['失误'], player_data_dict['犯规']]
		var append_str = '<tr>'
		for (var i=0; i<12; i++) {
			append_str = append_str + '<td class="small-font">'+ player_data_arr[i]+ '</td>'
		}
		append_str = append_str + '</tr>'
		$('#player-' + star_index +' > tbody').append(append_str);
		
		

		$('.people-more-data').click(function(){ 
			console.log(star_info_data_array)
			var button_id = parseInt($(this).attr('id').split('-')[2])
			if (StarisDetailDataHide == false) {
				$('#player-' + button_id + ' >tbody').find('.more-data').remove();
				$('#player-button-' + button_id).text('show more');
			} else {
				for (var j=1; j<=star_info_data_array[0].length-1; j++) {
					console.log(star_info_data_array)
					var append_str = '<tr class="more-data">';
					player_data_dict = star_info_data_array[0][j]['_source'];
					player_data_arr = [ player_data_dict['season'], player_data_dict['得分'], player_data_dict['首发'],
							  			player_data_dict['出场'], player_data_dict['时间'], player_data_dict['投篮'], 
							   			player_data_dict['三分'], player_data_dict['罚球'], player_data_dict['篮板'],
							   			player_data_dict['助攻'], player_data_dict['失误'], player_data_dict['犯规']]
					for (var i=0; i<12; i++) {
						append_str = append_str + '<td class="small-font">' + player_data_arr[i]+ '</td>';
					}
					append_str = append_str + '</tr>'
					$('#player-' + button_id + ' >tbody').append(append_str);
					$('#player-button-' + button_id).text('hide');
				}
			}
			StarisDetailDataHide = !StarisDetailDataHide;
		}) 
    }

    function putRelativeStar() {
    	$('.relative-star-box').empty();
    	RelativeStr = ''
    	for (var i=0; i<star_info_array.length; i++) {
    		RelativeStr =  RelativeStr + '<div class="star-brief-box" id="star-brief-' + i + '">'
    		RelativeStr =  RelativeStr + '<img src="' + star_info_array[i]['_source']['image_link'] + '" class="people-small-photo">';
    		RelativeStr =  RelativeStr + '<text class="star-brief-name">' + star_info_array[i]['_source']['中文名'] + '</text>';
    		RelativeStr =  RelativeStr + '</div>'
    	}
    	$('.relative-star-box').append(RelativeStr);
    	$('#star-brief-0').css('border-color', 'rgba(255, 255, 255, 0.3)')

    	$('.star-brief-box').mouseenter(function(){
    		var star_id = parseInt($(this).attr('id').split('-')[2])
    		if (star_id != select_star)
    			$(this).css('border-color', 'rgba(255, 255, 255, 0.2)')
    	})

    	$('.star-brief-box').mouseleave(function(){
    		var star_id = parseInt($(this).attr('id').split('-')[2])
    		if (star_id != select_star)
    			$(this).css('border-color', 'rgba(255, 255, 255, 0)')
    	})

    	$('.star-brief-box').click(function(){
    		$('#star-brief-' + select_star).css('border-color', 'rgba(255, 255, 255, 0)')
    		var star_id = parseInt($(this).attr('id').split('-')[2])
			var csrf_token = Cookies.get('csrftoken');

    		$.ajax({
					type: "POST",
					url: "http://127.0.0.1:8000/search/index",
					data:
					{
						'keyword':$(this).find('text').text(),
						'star':$(this).find('text').text(),
						'label': 3,
						'csrfmiddlewaretoken': csrf_token,
					 },
					success: function(data,status,request){
						console.log(data);
						star_info_data_array = data.result.player_data_list;
						putOneStar(star_id);
					}
			})
    		select_star = star_id;
    		$(this).css('border-color', 'rgba(255, 255, 255, 0.3)')
    	})

    }

    function putTeam(IsShowDivideLine) {
    	$('.team-box-title').show();
    	putOneTeam(0);
    	putRelativeTeam();
    	if (IsShowDivideLine == false)
    		$('.team-divide-line').hide();
    	else
    		$('.team-divide-line').show();
    }

    function putOneTeam(team_index) {
    	$('.team-box').empty();
    	TeamisDetailDataHide = true;
		$('.team-box').append(FormTeam(team_index, false))
		
		team_data_dict = team_info_data_array[team_index][0]['_source'];
		
		team_data = [ team_data_dict['name'], team_data_dict['得分'], team_data_dict['首发'],
					  team_data_dict['出场'], team_data_dict['时间'], team_data_dict['投篮'], 
					  team_data_dict['三分'], team_data_dict['罚球'], team_data_dict['篮板'],
					  team_data_dict['助攻'], team_data_dict['失误'], team_data_dict['犯规']]
		var append_str = '<tr>'
		for (var i=0; i<12; i++) {
			append_str = append_str + '<td class="small-font">'+ team_data[i]+ '</td>'
		}
		append_str = append_str + '</tr>'
		$('#team-' + team_index +' > tbody').append(append_str);

		$('.team-more-data').click(function(){ 
			var button_id = parseInt($(this).attr('id').split('-')[2])
			console.log(team_info_data_array);
			if (TeamisDetailDataHide == false) {
				$('#team-' + button_id + ' >tbody').find('.more-data').remove();
				$('#team-button-' + button_id).text('show more');
			} else {
				for (var j=1; j<=team_info_data_array[button_id].length-1; j++) {
					console.log(team_info_data_array);
					team_data_dict = team_info_data_array[button_id][j]['_source'];
					team_data = [ team_data_dict['name'], team_data_dict['得分'], team_data_dict['首发'],
					  			team_data_dict['出场'], team_data_dict['时间'], team_data_dict['投篮'], 
					  			team_data_dict['三分'], team_data_dict['罚球'], team_data_dict['篮板'],
					  			team_data_dict['助攻'], team_data_dict['失误'], team_data_dict['犯规']]
					var append_str = '<tr class="more-data">';
					for (var i=0; i<12; i++) {
						append_str = append_str + '<td class="small-font">' + team_data[i]+ '</td>';
					}
					append_str = append_str + '</tr>'
					$('#team-' + button_id + ' >tbody').append(append_str);
					$('#team-button-' + button_id).text('hide');
				}
			}
			TeamisDetailDataHide = !TeamisDetailDataHide;
		}) 
    }

    function putRelativeTeam() {
    	$('.relative-team-box').empty();
    	RelativeStr = ''
    	for (var i=0; i<team_info_array.length; i++) {
    		RelativeStr =  RelativeStr + '<div class="team-brief-box" id="team-brief-' + i + '">'
    		RelativeStr =  RelativeStr + '<img src="' + team_info_array[i]['_source']['image_link'] + '" class="team-small-photo">';
    		RelativeStr =  RelativeStr + '<text class="team-brief-name">' + team_info_array[i]['_source']['name'] + '</text>';
    		RelativeStr =  RelativeStr + '</div>'
    	}
    	$('.relative-team-box').append(RelativeStr);
    	$('#team-brief-0').css('border-color', 'rgba(255, 255, 255, 0.3)')

    	$('.team-brief-box').mouseenter(function(){
    		var team_id = parseInt($(this).attr('id').split('-')[2])
    		if (team_id != select_team)
    			$(this).css('border-color', 'rgba(255, 255, 255, 0.2)')
    	})

    	$('.team-brief-box').mouseleave(function(){
    		var team_id = parseInt($(this).attr('id').split('-')[2])
    		if (team_id != select_team)
    			$(this).css('border-color', 'rgba(255, 255, 255, 0)')
    	})

    	$('.team-brief-box').click(function(){
    		$('#team-brief-' + select_team).css('border-color', 'rgba(255, 255, 255, 0)')
    		var team_id = parseInt($(this).attr('id').split('-')[2])
    		putOneTeam(team_id);
    		select_team = team_id;
    		$(this).css('border-color', 'rgba(255, 255, 255, 0.3)')
    	})

    }


	$(".input-page").keydown(function(event) {
			event.preventDefault();
			event.stopPropagation();
    		var input_key_origin_value = $(this).val();
    		
    		if (event.which >= 48 &&  event.which <= 57) {
    				if (parseInt(input_key_origin_value + event.key) <= last_page)
    				//if (input_key_origin_value.length < Max_length)
		        		$('.input-page').val(input_key_origin_value + event.key);
		        	} else if (event.which == 8) {
		        		if (input_key_origin_value != "") 
		        			input_key_origin_value = input_key_origin_value.substr(0, input_key_origin_value.length-1)
		        		$('.input-page').val(input_key_origin_value)
		        	} else if (event.which == 13) {
		        		var next_page = parseInt(input_key_origin_value);
		        		if (next_page <= last_page && next_page > 0) {
		        			changePageButton(next_page);
		        			$(this).val('');
		        		}	
		    }

    })



    $('.main-href').mouseenter(function() {
			$(this).css('color', 'rgba(255, 255, 255, 0.7)');
			$(this).css('border-bottom', '0.15rem solid rgba(255, 255, 255, 0.7)');
	})
			
	$('.main-href').mouseleave(function() {
			$(this).css('color', 'rgba(255, 255, 255, 0.4)');
			$(this).css('border-bottom', '0.15rem solid rgba(255, 255, 255, 0.4)');
	})

	$('.main-href').click(function(){
			$('.shader-box').hide();
			$('.search-keyword').hide();
			$('#main').hide();
			$('#header > div.content').hide();
			setTimeout(function(){
				$('.nba-logo').show();			 
				$('#header > div.content').animate({'margin-top':'0rem'});
				$('#header > div.content').show();
			},300);	
			
	})

	$('.link-ref >a').mouseenter(function() {
			$(this).css('color', 'rgb(150, 150, 150)')
	})

	$('.link-ref >a').mouseleave(function() {
			$(this).css('color', 'rgb(255, 255, 255)')
	})

	$('.link-ref >a').click(function() {
			$(this).css('color', 'rgb(255, 255, 255)')
	})

	function changePageButton(next_page) {
			next_page = parseInt(next_page)
			if (last_page <= 5) {
		    	$('#page-' + select_page).css('background-color', 'rgba(255, 255, 255, 0)');
				changePage(next_page - 1);
				select_page = next_page;
				$('#page-' + select_page).css('background-color', 'rgba(255, 255, 255, 0.3)');
			} else {
		        select_page = next_page;
			    if (next_page <= last_page)
			        changePage(next_page-1);

			   	$('.change-page-box').empty();
			    if (next_page == 1 || next_page == 2 || next_page == 3 || next_page == 4) {
			        	for (var i=1; i<5; i++) 
					    	generateChangeButton(i);
						generateRightButton();
		    			$('#page-' + next_page).css('background-color', 'rgba(255, 255, 255, 0.3)');
			    } else if (next_page <= last_page && next_page >= last_page -2) {
			        	generateLeftButton();
			        	for (var i=last_page-3; i<=last_page; i++) 
					    	generateChangeButton(i);
					    $('#page-' + next_page).css('background-color', 'rgba(255, 255, 255, 0.3)');
			    } else {
			        	generateLeftButton();
			        	for (var i=next_page-1; i<=next_page + 1; i++) 
					    	generateChangeButton(i);
					    $('#page-' + next_page).css('background-color', 'rgba(255, 255, 255, 0.3)');
					    generateRightButton();
				}
		    }
	}

	function changePage(page){
			$('.news-detail').empty();
			for (var i=page * news_in_box; i < (page+1) * news_in_box && i < news_array.length; i++) {
				$('.news-detail').append(generateNew(news_array[i]['_source'], i));

				$('.new-label-' + i).mouseenter(function(){
					$(this).css('color', 'rgb(250, 250, 250);')
					$(this).css('border-bottom-color', 'rgb(250, 250, 250);')
				})

				$('.new-label-' + i).mouseleave(function(){
					$(this).css('color', 'rgb(200, 200, 200);')
					$(this).css('border-bottom-color', 'rgb(150, 150, 150);')
				})

				$('.new-label-' + i).click(function(){
					search_type = 2;
					label_search_word = $(this).text();
					$('.fa-search').click();
				})
			}

			$('.news-title').mouseenter(function(){
					$(this).css('color', 'rgb(200, 200, 200)');
			})

			$('.news-title').mouseleave(function(){
					$(this).css('color', 'rgb(255, 255, 255)');
			})

			$('.news-href').mouseenter(function(){
					$(this).css('color', 'rgb(200, 200, 200)');
			})

			$('.news-href').mouseleave(function(){
					$(this).css('color', 'rgb(255, 255, 255)');
			})


	}


	function generateChangeButton(id){
		$('.change-page-box').append('<div class="change-page" id="page-'+ id +'">'+ id +'</div>');
	    $('.change-page').mouseenter(function(){
	    		$(this).css('background-color', 'rgba(255, 255, 255, 0.2)')
	    })
	    $('.change-page').mouseleave(function(){
	    		var button_id = parseInt(($(this).attr('id').split('-'))[1]);
	    		if (button_id != select_page)
	    			$(this).css('background-color', 'rgba(255, 255, 255, 0)')
	    })
	    $('.change-page').click(function(){
	    		var button_id = parseInt(($(this).attr('id').split('-'))[1]);
	    		changePageButton(button_id);
	    })
	}

	function generateRightButton() {
		$('.change-page-box').append('<div class="change-page-more  icon fa-angle-right"></div>')
	    $('.fa-angle-right').mouseenter(function(){
				$(this).css('background-color', 'rgba(255, 255, 255, 0.2)')
		})

	    $('.fa-angle-right').mouseleave(function(){
				$(this).css('background-color', 'rgba(255, 255, 255, 0)')
		})

	    $('.fa-angle-right').click(function(){
				changePageButton(parseInt(select_page) + 1);
		})
	}

	function generateLeftButton() {
		$('.change-page-box').append('<div class="change-page-more  icon fa-angle-left"></div>')
		$('.fa-angle-left').click(function(){
				changePageButton(parseInt(select_page) - 1);
		})
	  
		$('.fa-angle-left').mouseenter(function(){
				$(this).css('background-color', 'rgba(255, 255, 255, 0.2)')
		})
		 
		$('.fa-angle-left').mouseleave(function(){
				$(this).css('background-color', 'rgba(255, 255, 255, 0)')
		})
	}

	function generateNew(news_info, news_index){
		NewsStr = '<div class="one-news">'
		NewsStr = NewsStr + '<a class="news-title" href="'+ news_info['link']+ '" target="_blank">';
		if (news_info['place'] == 'title' && news_info['index'] >= 0) {
			NewsStr = NewsStr + news_info['name'].slice(0, news_info['index'])
			for (var i=0; i< news_info['keyword'].length && i + news_info['index'] < news_info['name'].length; i++) {
				if (news_info['keyword'][i] == news_info['name'].slice(news_info['index'] + i, news_info['index'] + i + 1))
					NewsStr = NewsStr + '<text style="color:rgba(250, 40, 40, 0.8)">' + news_info['name'][news_info['index'] + i] + '</text>'
				else
					NewsStr = NewsStr + '<text>' + news_info['name'][news_info['index'] + i] + '</text>'
			}
			NewsStr = NewsStr + news_info['name'].slice(news_info['index'] + news_info['keyword'].length, news_info['name'].length) + '</a>'
		} else {
			NewsStr = NewsStr + news_info['name'] + '</a>'
		}
		NewsStr = NewsStr + '<div class="news-source news-label-box">' + news_info['source'] + '  ' 
		NewsStr = NewsStr + ParseTime(news_info['my_time'])
		NewsStr = NewsStr + '&nbsp;&nbsp;&nbsp;&nbsp;标签：'
		label_split = news_info['label'].split(' ')
		for (var i = 0; i < label_split.length; i++) {
			if (label_split[i] != '')
				NewsStr = NewsStr + '<div class="news-label new-label-'+ news_index +'">' + label_split[i]  + '</div>'
		}
		NewsStr = NewsStr + '</div>'
		if (news_info['place'] == 'content' &&  news_info['index']>=0 && news_info['index'] < 100) {
			NewsStr = NewsStr + '<div class="news-content">'+ news_info['content'].slice(0, news_info['index'])
			for (var i=0; i< news_info['keyword'].length; i++) {
				if (news_info['keyword'][i] == news_info['content'].slice(news_info['index'] + i, news_info['index'] + i + 1))
					NewsStr = NewsStr + '<strong>' + news_info['content'][news_info['index'] + i] + '</strong>'
				else
					NewsStr = NewsStr + news_info['content'][news_info['index'] + i]
			}

			if (news_info['index'] +  news_info['keyword'].length < 100)
				NewsStr = NewsStr + news_info['content'].slice(news_info['index'] +  news_info['keyword'].length, 100)
			NewsStr = NewsStr +'...&nbsp;&nbsp;<a class="news-href" href="'+ news_info['link']+ '">查看详情</a></div></div>'
		} else {
			NewsStr = NewsStr + '<div class="news-content">'+ news_info['content'].slice(0, 100) +'...&nbsp;&nbsp;<a class="news-href" href="'+ news_info['link']+ '" target="_blank">查看详情</a></div>'
			NewsStr = NewsStr + '</div>'
		}
		return NewsStr
	}

	function generateCondition(name, label, condition_type, number, isNoNumber) {
		cond_str = '<div class="condition-box"><div class="condition-name"><text">'+ name +'</text></div> <div class="condition-class">'
		for (var i=0; i<label.length; i++) {
			cond_str = cond_str + '<div class="condition-explicit" type="' + condition_type +'"> <span class="icon fa-caret-right">&nbsp;&nbsp;</span></span>'
			cond_str = cond_str + '<text class="condition">'+ label[i]+'</text>'
			if (!isNoNumber)
				cond_str = cond_str + '<text class="result-number">[&nbsp;' + number[i] + '&nbsp;]</text>'
			cond_str = cond_str + '</div>';
			
		}
		cond_str = cond_str + '</div> </div>'
		$('.navigator-bar').append(cond_str)

		$('.condition-explicit').mouseenter(function(){
			$(this).css('background-color', 'rgba(255, 255, 255, 0.3)');
		})

		$('.condition-explicit').mouseleave(function(){
				$(this).css('background-color', 'rgba(255, 255, 255, 0)');
		})

		$('.condition-explicit').click(function(){
				$(this).css('background-color', 'rgba(0, 0, 0, 0.3)');
				search_word = $(this).find('text[class="condition"]').text();
				var i=0;
				for (i=0; i<search_word_array.length; i++) {
					if (search_word_array[i][1] == search_word)
						break;
				}
				if (i == search_word_array.length) {
					search_keyword_num = search_keyword_num + 1;
					AddKeyword(search_word, search_keyword_num);
					search_word_array.push([$(this).attr('type'), search_word]);
				}
		})
	}

	function generateTimeCondition(name, label, number) {
		cond_str = '<div class="condition-box"> <div class="condition-name"><text">'+ name +'</text></div> <div class="condition-class">'
		for (var i=0; i<label.length; i++) {
			cond_str = cond_str + '<div class="condition-explicit-time"> <span class="icon fa-caret-right">&nbsp;&nbsp;</span></span>'
			cond_str = cond_str + '<text class="condition">'+ label[i]+'</text>'
			cond_str = cond_str + '<text class="result-number">[&nbsp;' + number[i] + '&nbsp;]</text></div>'
		}
		cond_str = cond_str + '</div>  </div>'
		$('.navigator-bar').append(cond_str)

		$('.condition-explicit-time').mouseenter(function(){
			$(this).css('background-color', 'rgba(255, 255, 255, 0.3)');
		})

		$('.condition-explicit-time').mouseleave(function(){
				$(this).css('background-color', 'rgba(255, 255, 255, 0)');
		})

		$('.condition-explicit-time').click(function(){
				$(this).css('background-color', 'rgba(0, 0, 0, 0.3)');
				search_word = $(this).find('text[class="condition"]').text();
				if (time_condition == '') {
					AddKeyword(search_word, 0, false, false);
					time_condition = search_word;
				}
				else if (search_word != time_condition ) {
					search_keyword_num = search_keyword_num + 1;
					AddKeyword(search_word, 0, false, true);
					time_condition = search_word;
				} 
		})
	}

	function FormStar(star_index, IsShowLine) {
		console.log(star_info_array);
		StarInfo = star_info_array[star_index]['_source']
    	star_str = '<div class="people-info"> <div class="detailed-box">'
    	star_str = star_str + '<img src="' + StarInfo['image_link'] + '" class="people-photo"></img>'
    	star_str = star_str + '<div class="people-detailed-info"> '
    	star_str = star_str + '<div class="info-one-line">中文姓名：<text>' + StarInfo['中文名']+ '</text></div>'
    	star_str = star_str + '<div class="info-one-line">英文姓名：<text>' + StarInfo['name'] + '</text></div>'
    	star_str = star_str + '<div class="info-one-line">球队：<text>' + star_info_data_array[0][0]['_source']['team'] + '</text></div>'
    	star_str = star_str + '<div class="info-one-line">身高：<text>' + StarInfo['身高'] + '</text></div>'
    	star_str = star_str + '<div class="info-one-line">体重：<text>' + StarInfo['体重'] + '</text></div>'
    	star_str = star_str + '<div class="info-one-line">出生情况：<text>' + StarInfo['出生年月'] + '</text></div>'
    	star_str = star_str + '<div class="info-one-line">位置：<text>' + StarInfo['位置'] + '</text></div>'
    	//star_str = star_str + '<div class="info-one-line">薪水：<text>' + StarInfo['salary'] + '</text></div>'
    	star_str = star_str + '</div></div><table class="people-data"  align="center" id="player-'+ star_index +'"><tr><td>赛季</td><td>场均得分</td><td>首发</td><td>出场</td><td>上场时间</td>'
		star_str = star_str + '<td>投篮命中率</td><td>三分命中率</td><td>罚球命中率</td><td>篮板数</td><td>助攻</td><td>失误</td><td>犯规</td></tr><tr></tr></table>'
		star_str = star_str + '<button class="people-more-data" id=player-button-'+ star_index +'>show more</button>'
		if (IsShowLine) 
			star_str = star_str + '<div class="divide-line"></div>'
		star_str = star_str + '</div>'
    	return star_str;
    }

    function FormTeam(team_index, IsShowLine) {
    	TeamInfo = team_info_array[team_index]['_source']
		console.log(team_info_array);
    	team_str = '<div class="team-info"> <div class="detailed-box">'
    	team_str = team_str + '<img src="' + TeamInfo['image_link'] + '" class="team-photo"></img>'
    	team_str = team_str + '<div class="people-detailed-info"> '
    	team_str = team_str + '<div class="info-one-line">中文队名：<text>' + TeamInfo['name']+ '</text></div>'
    	team_str = team_str + '<div class="info-one-line">英文队名：<text>' + TeamInfo['英文名字'] + '</text></div>'
    	team_str = team_str + '<div class="info-one-line">地区：<text>' + TeamInfo['所属地区'] + '</text></div>'
    	team_str = team_str + '<div class="info-one-line">体育馆：<text>' + TeamInfo['主球馆'] + '</text></div>'
    	team_str = team_str + '<div class="info-one-line">所属赛区：<text>' + TeamInfo['赛区'] + '</text></div>'
    	team_str = team_str + '<div class="info-one-line">成立时间：<text>' + TeamInfo['成立时间'] + '</text></div>'
    	team_str = team_str + '<div class="info-one-line">教练：<text>' + TeamInfo['拥有者'] + '</text></div>'
		team_str = team_str + '<div class="info-one-line">老板：<text>' + TeamInfo['主教练'] + '</text></div>'
    	team_str = team_str + '</div></div><table class="team-data"  align="center" id="team-'+ team_index +'"><tr><td>球员</td><td>场均得分</td><td>首发</td><td>出场</td><td>上场时间</td>'
		team_str = team_str + '<td>投篮命中率</td><td>三分命中率</td><td>罚球命中率</td><td>篮板数</td><td>助攻</td><td>失误</td><td>犯规</td></tr><tr></tr></table>'
		team_str = team_str + '<button class="team-more-data" id=team-button-'+ team_index +'>show more</button>'
		team_str = team_str + '</div>'
    	return team_str;
    }
				

	function ParseTime(datetime) {
		dateformat = datetime.getFullYear() + "-" + (datetime.getMonth()+1) + "-" + datetime.getDate() + " "
		if (datetime.getHours() < 10)
			dateformat = dateformat + '0'
		dateformat = dateformat + datetime.getHours() + ":";
		if (datetime.getMinutes() < 10)
			dateformat = dateformat + '0'
		dateformat = dateformat + datetime.getMinutes() + ":";
		if (datetime.getSeconds() < 10)
			dateformat = dateformat + '0'
		dateformat = dateformat + datetime.getSeconds();
		return dateformat
	}

	function AddKeyword(search_word , search_keyword_num, isLock, isModify){
			search_word = search_word.replace( /^\s*/, '');
			if (isModify == true) {
				$('#keyword-box-'+search_keyword_num + '>strong').text(search_word)
			}
			else if (!isLock) {
				$('.search-container').append('<div class="keyword-box" id="keyword-box-'+ search_keyword_num +'">\
										 	<strong style="color: rgb(150, 150, 150)">'+ search_word + '</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\
										 	<span class="icon fa-close" id="fa-close-'+ search_keyword_num +'"></span>\
										 	</div>');
			} else {

				search_split_word = search_word.split(' ')
				for (var i=0; i<search_split_word.length; i++)
					if (search_split_word[i] != '')
						$('.search-container').append('<div class="keyword-box locked" id="keyword-box-'+ search_keyword_num +'">\
										 	<strong style="color: rgb(150, 150, 150)">'+ search_split_word[i] +'</strong>\
										 	</div>');
			}
			
			$('.keyword-box').mouseenter(function(){
					$(this).css('background-color', 'rgba(255, 255, 255, 0.2)');
					$(this).find('strong').css('color','rgb(255, 255, 255, 0.8)')
			})

			$('.keyword-box').mouseleave(function(){
					$(this).css('background-color', 'rgba(255, 255, 255, 0)');
					$(this).find('strong').css('color','rgb(150, 150, 150)')
			})
			
			$('#fa-close-' + search_keyword_num).mouseenter(function(){
				 	var close_id = parseInt($(this).attr('id').split('-')[2]);
					$(this).append("<style>#fa-close-"+close_id+"::before{color: rgba(255, 255, 255, 0.8)}</style>")
			})

			$('#fa-close-' + search_keyword_num).mouseleave(function(){
				 	var close_id = parseInt($(this).attr('id').split('-')[2]);
					$(this).append("<style>#fa-close-"+close_id+"::before{color: rgb(150, 150, 150)}</style>")
			})

			$('#fa-close-' + search_keyword_num).click(function(){
				 	var close_id = parseInt($(this).attr('id').split('-')[2]);
				 	if (close_id == 0) {
				 		time_condition = '';
				 	}
					$('#keyword-box-' + close_id).remove();
					for (var i=0; i<search_word_array.length; i++) {
						if (search_word_array[i][1] == search_word)
							search_word_array.splice(i, 1)
					}
			})


	}

});