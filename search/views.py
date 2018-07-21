from django.http import HttpResponse
from django.http import JsonResponse
from django.shortcuts import render
from elasticsearch import Elasticsearch
from search.elasticsearch import ElasticSearchClass
import datetime

# Create your views here.

try:
    from django.utils import simplejson as json
except ImportError:
    import json

class DateEncoder(json.JSONEncoder):  
    def default(self, obj):  
        if isinstance(obj, datetime.datetime):  
            return obj.strftime('%Y-%m-%d %H:%M:%S')  
        elif isinstance(obj, date):  
            return obj.strftime("%Y-%m-%d")  
        else:  
            return json.JSONEncoder.default(self, obj) 

def toShortName(name):
    short_name = name[-5:-1]
    if short_name == '凯尔特人' :
        return short_name
    short_name = name[-4:-1]
    if short_name in ['76人','步行者','独行侠','森林狼'] :
        return short_name
    short_name = name[-3:-1]
    return short_name

def index(request):

    if request.method == 'GET':
        passed = {}
        return render(request, 'index.html', passed)
    
    print("xxxxxxxxxxxxx")

    es = ElasticSearchClass()
    

    category = request.POST.get('label', None)
    if category == '0':
        # this is all
        es.make_index_table()

        keyword_list = request.POST.get('keyword', None)
        source = request.POST.getlist('source[]', None)
        team = request.POST.getlist('team[]', None)
        player = request.POST.getlist('star[]', None)
        search_str = keyword_list
        search_type = "news"
        search_order = "by score"
        search_source = source
        
        team_str = ""
        if team != []:
            for i in team:
                team_str = team_str + toShortName(i) + " "
        if team_str != "":
            search_str = team_str[0:-1]

        list2 = es.search_keywords(search_type, search_str)
        list2 = es.filter(list2, 'source', search_source)
        recent = request.POST.get('recent', None)
        
        if recent == '1':
            list2 = es.filter(list2, 'recent_1day', [])
        elif recent == '2':
            list2 = es.filter(list2, 'recent_7day', [])
        elif recent == '3':
            list2 = es.filter(list2, 'recent_30day', [])
        
        temp = {}
        temp['recent_list'] = es.count_recent(list2)
        temp['source_list'] = es.count_source(list2)
        temp['data_list'] = list2
        #print(temp['recent_list'])
        #print(temp['source_list'])

        #print(list2)
        #list2 = es.sort(list2, search_order)
        keyword_list = request.POST.get('keyword', None)
        
        search_str = keyword_list
        search_type = "team"
        search_order = "by defen"
        
        list2 = es.search_team(search_str)
        list2 = es.filter(list2, 'by team', team)
        
        temp['team_list'] = list2
        list0 = []
        
        i = 0

        for i in list2:
            name = i['_source']['name']
            short_name = toShortName(name)
            listx = es.search_data_season(short_name, "2017")
            listx = es.sort(listx, search_order)
            list0.append(listx)
        
        temp['team_data_list'] = list0
        
        keyword_list = request.POST.get('keyword', None)
        search_str = keyword_list
        search_type = "player"
        search_order = "by season"
        
        list2 = es.search_player(search_str)
        list2 = es.filter(list2, 'by player', player)
        
        temp['player_list'] = list2
        list0 = []

        for i in list2:
            name = i['_source']['中文名']
            listx = es.search_data(name)
            
            listx = es.sort(listx, search_order)
            list0.append(listx)

            break
        
        temp['player_data_list'] = list0


    if category == '1':
        # this is a news
        es.make_index_table()

        keyword_list = request.POST.get('keyword', None)
        source = request.POST.getlist('source[]', None)
        search_str = keyword_list
        search_type = "news"
        search_order = "by score"
        search_source = source
        
        list2 = es.search_keywords(search_type, search_str)
        list2 = es.filter(list2, 'source', search_source)
        recent = request.POST.get('recent', None)

        if recent == '1':
            list2 = es.filter(list2, 'recent_1day', [])
        elif recent == '2':
            list2 = es.filter(list2, 'recent_7day', [])
        elif recent == '3':
            list2 = es.filter(list2, 'recent_30day', [])
        
        temp = {}
        temp['recent_list'] = es.count_recent(list2)
        temp['source_list'] = es.count_source(list2)
        temp['data_list'] = list2
        
        #print(temp['recent_list'])
        #print(temp['source_list'])

        #print(list2)
        #list2 = es.sort(list2, search_order)
    
    elif category == '2':
        # this is a team
        temp = {}
        keyword_list = request.POST.get('keyword', None)
        team = request.POST.getlist('team[]', None)
        search_str = keyword_list
        search_type = "team"
        search_order = "by defen"

        list2 = es.search_team(search_str)
        list2 = es.filter(list2, 'by team', team)
        temp = {}
        
        temp['team_list'] = list2
        list0 = []
        
        i = 0

        for i in list2:
            name = i['_source']['name']
            short_name = toShortName(name)
            listx = es.search_data_season(short_name, "2017")
            listx = es.sort(listx, search_order)
            list0.append(listx)
        
        temp['team_data_list'] = list0

        #temp['data_list'] = 

    elif category == '3':
        # this is a player
        temp = {}
        keyword_list = request.POST.get('keyword', None)
        player = request.POST.getlist('star[]', None)
        search_str = keyword_list
        search_type = "player"
        search_order = "by season"
        
        list2 = es.search_player(search_str)
        list2 = es.filter(list2, 'by player', player)
        
        temp = {}
        
        temp['player_list'] = list2
        list0 = []

        for i in list2:
            name = i['_source']['中文名']
            listx = es.search_data(name)
            
            listx = es.sort(listx, search_order)
            list0.append(listx)
            
            break
        
        temp['player_data_list'] = list0

    elif category == '4':
        # this is a news of label
        keyword_list = request.POST.get('keyword', None)
        source = request.POST.getlist('source[]', None)
        search_str = keyword_list
        search_type = "news"
        search_order = "by score"
        search_source = source
        list2 = es.get_by_index(keyword_list)
        
        list2 = es.filter(list2, 'source', search_source)
        recent = request.POST.get('recent', None)
        
        if recent == '1':
            list2 = es.filter(list2, 'recent_1day', [])
        elif recent == '2':
            list2 = es.filter(list2, 'recent_7day', [])
        elif recent == '3':
            list2 = es.filter(list2, 'recent_30day', [])
        
        temp = {}
        temp['recent_list'] = es.count_recent(list2)
        temp['source_list'] = es.count_source(list2)
        temp['data_list'] = list2
        
        #print(temp['recent_list'])
        #print(temp['source_list'])

        #print(list2)
        #list2 = es.sort(list2, search_order)
    '''
    
    #print(es.search_all("news"))

    search_str = ["詹姆斯"]
    search_type = "data"
    search_order = "by season"
    search_source = ["all"]

    list = es.search_keywords(search_type, search_str)
    list = es.filter(list, 'source', search_source)
    list = es.sort(list, search_order)
    print(list)
    '''


    passed = {}
    passed['result'] = temp
    #print(passed['list'])
    print("xxxxxxxxxxxxx")
    
    #print(list2)
    return HttpResponse(json.dumps(passed, cls=DateEncoder), content_type='application/json')

    
    