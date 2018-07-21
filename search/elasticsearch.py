from elasticsearch import Elasticsearch
from elasticsearch import helpers
import datetime
import time

abstract_length = 40

def toShortName(name):
    short_name = name[-5:-1]
    if short_name == '凯尔特人' :
        return short_name
    short_name = name[-4:-1]
    if short_name in ['76人','步行者','独行侠','森林狼'] :
        return short_name
    short_name = name[-3:-1]
    return short_name 

class ElasticSearchClass(object):
    type_list = ["all", "news", "team", "player", "data"]
    max_window_size = 1000
    idx = 0
    index_table = {}

    def __init__(self):
        self.es = Elasticsearch(['localhost:9200'])
        
    def count_all(self):
        return self.es.count(index = None, doc_type = None)['count']
    
    def index(self, type_name, body):
        self.es.index(index = 'my_index', doc_type = type_name, id = None ,body = body)
        self.idx = self.idx + 1
        print(self.idx)

    def delete_all(self):

        allDoc = self.search_all("all")

        for i in allDoc:
            j = i['_type']
            try:
                print("delete "+ j + " " + i['_id'])
                self.es.delete(index = 'my_index', doc_type = j, id = i['_id'])
            except Exception:
                print("delete "+ j + " " + i['_id'] + " error")
                continue

    def get_by_id(self, id):
        try:
            query = {'query': {"term": { "_id" : id}}}
            allDoc = self.es.search(None, None, query)
            return allDoc['hits']['hits'][0]
        except Exception as err:
            print(err)
            return {}
    
    def get_by_index(self, index):
        list = []
        try:
            for i in self.index_table[index]:
                list.append(self.get_by_id(i))
        except Exception as err:
            print(err)
        return list
    
    def make_index_table(self):
        list = self.search_all('news')
        if self.index_table != {}:
            self.index_table = {}
        for i in list:
            for j in i['_source']['label'].strip(',').split(' '):
                try:
                    self.index_table[j].append(i['_id'])
                except Exception:
                    self.index_table[j] = [i['_id']]

    def make_abstract(self, list_step1, search_str):
        list_step2 = []
        abstract = ""
        list_search_str = []
        
        if('Untitled' not in search_str):
            list_i = search_str.strip(',').split(' ')
            list_search_str.extend(list_i)

        for j in list_step1:
            content = j['_source']['content']
            title = j['_source']['name']
            j['_source']['keyword'] = search_str
            j['_score'] = 0
            index = -1
            for temp in list_search_str:
                try:
                    if title.count(temp) != 0:
                        index = title.index(temp)
                        j['_source']['place'] = 'title'
                        j['_source']['keyword'] = temp
                        j['_score'] = title.count(temp) + content.count(temp) * 0.05
                        '''
                        abstract = title[index : index + abstract_length]
                        if(len(abstract) < abstract_length):
                            abstract = '...' + title[index + len(abstract) - abstract_length: index + abstract_length]
                        else:
                            abstract = abstract + '...'
                        '''  
                        break
                    if content.count(temp) != 0:
                        index = content.index(temp)
                        j['_source']['place'] = 'content'
                        j['_source']['keyword'] = temp
                        j['_score'] =  title.count(temp) + content.count(temp) * 0.05
                        '''
                        abstract = content[index : index + abstract_length]
                        if(len(abstract) < abstract_length):
                            abstract = '...' + content[index + len(abstract) - abstract_length: index + abstract_length]
                        else:
                            abstract = abstract + '...'
                        '''
                        break
                except Exception:
                    continue
            else:
                j['_source']['place'] = 'nowhere'
            j['_source']['index'] = index
            #j['_source']['abstract'] = abstract
            list_step2.append(j)
        
        return list_step2

    def search_all(self, type_name):

        if type_name == 'all':
            result = helpers.scan(
                self.es,
                query = {
                        'query': {
                            'match_all': {}
                            }
                        },
                index = 'my_index',
                doc_type = None
            )
            
            final_result = []
            for item in result:
                final_result.append(item)
            
            allDoc = final_result
        else:
            result = helpers.scan(
                self.es,
                query = {
                        'query': {
                            'match_all': {}
                            }
                        },
                index = 'my_index',
                doc_type = type_name
            )
            
            final_result = []
            for item in result:
                final_result.append(item)
            
            allDoc = final_result
        
        list_step1 = allDoc

        '''
        for j in allDoc:
            for k in list_step1:
                if j['_id'] == k['_id']:
                    break
            else:
                list_step1.append(j)
        '''
        #list_step1 = self.make_abstract(list_step1, ['Untitled'])
        
        return list_step1

    def search(self, type_name, keywords):
        if type_name == 'all':
            result = helpers.scan(
                self.es,
                query = {
                        'query':{
                            "multi_match":{
                                "query" : keywords, 
                                "fields": [ "name", "content" ] 
                                }
                            }
                        },
                index = 'my_index',
                doc_type = None
            )
            
            final_result = []
            for item in result:
                final_result.append(item)
            
            allDoc = final_result
        else:
            result = helpers.scan(
                self.es,
                query = {
                        'query': {
                            "multi_match": {
                                "query" : keywords, 
                                "fields": [ "name", "content" ] 
                                }
                            }
                        },
                index = 'my_index',
                doc_type = type_name
            )
            
            final_result = []
            for item in result:
                final_result.append(item)
            
            allDoc = final_result
        return allDoc

    def search_keywords(self, search_type, search_str):
        list_step1 = []
        '''
        for i in search_str:
            temp = self.search(search_type, i)
            for j in temp:
                for k in list_step1:
                    if j['_id'] == k['_id']:
                        break
                else:
                    list_step1.append(j)
        '''
        list_step1 = self.search(search_type, search_str)
        list_step1 = self.make_abstract(list_step1, search_str)
        return list_step1

    def search_team(self, search_str):
        temp = []
        search_list = search_str.strip(',').split(' ')
        
        if len(search_list) < 1:
            return []
        
        list_all_team = self.search_all("team")

        for i in list_all_team:
            for j in search_list:
                #print(i['_source']['name'])
                if j in i['_source']['name'] or j.upper() in i['_source']['content'].upper():
                    temp.append(i)
                    break
        
        return temp

    def search_player(self, search_str):
        temp = []
        search_list = search_str.strip(',').split(' ')
        if len(search_list) < 1:
            return []
        
        list_all_team = self.search_all("player")

        for i in list_all_team:
            for j in search_list:
                #print(i['_source']['name'])
                if j in i['_source']['name'] or j.upper() in i['_source']['content'].upper():
                    temp.append(i)
                    break

        return temp
    
    def search_data(self, search_str):
        temp = []
        search_list = search_str.strip(',').split(' ')
        if len(search_list) < 1:
            return []
        
        list_all_data = self.search_all("data")

        for i in list_all_data:
            for j in search_list:
                #print(i['_source']['name'])
                if j in i['_source']['name'] or j in i['_source']['team']:
                    temp.append(i)
                    break

        return temp
    
    def search_data_season(self, search_str, season):
        temp = []
        search_list = search_str.strip(',').split(' ')
        if len(search_list) < 1:
            return []
        
        list_all_data = self.search_all("data")

        for i in list_all_data:
            for j in search_list:
                #print(i['_source']['name'])
                if j in i['_source']['team'] and season in i['_source']['season']:
                    temp.append(i)
                    break

        return temp

    def sort(self, list, sign)  :
        lenl = len(list)
        if sign == "by time":   
            for i in range(0, lenl):
                for j in range(i, lenl):
                    #print(list[i]['_source']['my_time'], list [j]['_source']['my_time'])
                    if(list[i]['_source']['my_time'] < list [j]['_source']['my_time']):
                        list[i], list[j] = list[j], list[i]
        if sign == "by season": 
            for i in range(0, lenl):
                for j in range(i, lenl):
                    #print(list[i]['_source']['season'], list [j]['_source']['season'])
                    if(list[i]['_source']['season'] < list [j]['_source']['season']):
                        list[i], list[j] = list[j], list[i]
        if sign == "by defen": 
            for i in range(0, lenl):
                for j in range(i, lenl):
                    #print(list[i]['_source']['season'], list [j]['_source']['season'])
                    if(list [j]['_source']['name'] == '全队数据'):
                        list[i], list[j] = list[j], list[i]
                    elif(list [j]['_source']['name'] == '对手数据'):
                        list[i], list[j] = list[j], list[i]
                    elif(float(list[i]['_source']['得分']) < float(list [j]['_source']['得分'])):
                        list[i], list[j] = list[j], list[i]
        return list

    def filter(self, list, condition, keywordlist):
        if("all" in keywordlist):
            return list
        if(condition == 'source'):
            if keywordlist == []:
                return list
            j = 0
            while j < len(list):
                try:
                    if condition == 'source':
                        temp = list[j]['_source']['source']
                        list_temp = temp.strip(',').split(' ')
                    for i in keywordlist:
                            if i in list_temp:
                                j = j + 1
                                break
                    else:
                        del list[j]
                except Exception as err:
                    continue
        elif(condition == 'label'):
            j = 0
            while j < len(list):
                if condition == 'label':
                    temp = list[j]['_source']['label']
                    list_temp = temp.strip(',').split(' ')
                for i in keywordlist:
                        if i in list_temp:
                            j = j + 1
                            break
                else:
                    del list[j]
        elif(condition == 'by team'):
            if(keywordlist == []):
                return list
            j = 0
            while j < len(list):
                if condition == 'by team':
                    temp1 = list[j]['_source']['name']
                    temp2 = list[j]['_source']['content']
                    list_temp1 = temp1.strip(',').split(' ')
                    list_temp2 = temp2.strip(',').split(' ')
                for i in keywordlist:
                        if i in list_temp1 or i in list_temp2:
                            j = j + 1
                            break
                else:
                    del list[j]
        elif(condition == 'by player'):
            if(keywordlist == []):
                return list
            j = 0
            
            while j < len(list):
                if condition == 'by player':
                    temp1 = list[j]['_source']['name']
                    temp2 = list[j]['_source']['content']
                    list_temp1 = temp1.strip(',').split(' ')
                    list_temp2 = temp2.strip(',').split(' ')
                for i in keywordlist:
                        if i in list_temp1 or i in list_temp2:
                            j = j + 1
                            break
                else:
                    del list[j]
        elif(condition == 'recent_1day'):
            now = datetime.datetime.now()
            recent_1day = (now - datetime.timedelta(days=2)).strftime("%Y-%m-%d %H:%M:%S")
            j = 0
            while j < len(list):
                try:
                    temp = list[j]['_source']['my_time']
                    if(temp < recent_1day):
                        del list[j]
                    else:
                        j = j + 1
                except Exception as err:
                    continue
        elif(condition == 'recent_7day'):
            now = datetime.datetime.now()
            recent_1day = (now - datetime.timedelta(days=8)).strftime("%Y-%m-%d %H:%M:%S")
            j = 0
            while j < len(list):
                try:
                    temp = list[j]['_source']['my_time']
                    if(temp < recent_1day):
                        del list[j]
                    else:
                        j = j + 1
                except Exception as err:
                    continue
        elif(condition == 'recent_30day'):
            now = datetime.datetime.now()
            recent_1day = (now - datetime.timedelta(days=31)).strftime("%Y-%m-%d %H:%M:%S")
            j = 0
            while j < len(list):
                try:
                    temp = list[j]['_source']['my_time']
                    if(temp < recent_1day):
                        del list[j]
                    else:
                        j = j + 1
                except Exception as err:
                    continue
        return list

    def count_recent(self, list):
        try:
            list1 = []
            list2 = []
            list3 = []
            
            list1.extend(list)
            list2.extend(list)
            list3.extend(list)

            list_recent_1day = self.filter(list1, 'recent_1day', [])
            list_recent_7day = self.filter(list2, 'recent_7day', [])
            list_recent_30day = self.filter(list3, 'recent_30day', [])
            list_recent_all = self.filter(list, 'recent_all', [])
            
            count_recent_1day = len(list_recent_1day)
            count_recent_7day = len(list_recent_7day)
            count_recent_30day = len(list_recent_30day)
            count_recent_all = len(list)

            return {'count_recent_all' : count_recent_all, 
                    'count_recent_1day' : count_recent_1day, 
                    'count_recent_7day' : count_recent_7day, 
                    'count_recent_30day' : count_recent_30day}
        except Exception:
            return {}
    
    def count_source(self, list):
        try:
            list1 = []
            list2 = []
            list3 = []
            list4 = []
            
            list1.extend(list)
            list2.extend(list)
            list3.extend(list)
            list4.extend(list)

            list_source_souhu = self.filter(list1, 'source', ['搜狐体育'])
            list_source_sina = self.filter(list2, 'source', ['新浪体育'])
            list_source_wangyi = self.filter(list3, 'source', ['网易体育'])
            list_source_hupu = self.filter(list4, 'source', ['虎扑体育'])
            
            count_source_souhu = len(list_source_souhu)
            count_source_sina = len(list_source_sina)
            count_source_wangyi = len(list_source_wangyi)
            count_source_hupu = len(list_source_hupu)

            return {'count_source_souhu' : count_source_souhu, 
                    'count_source_sina' : count_source_sina, 
                    'count_source_wangyi' : count_source_wangyi, 
                    'count_source_hupu' : count_source_hupu}
        except Exception:
            return {}
        