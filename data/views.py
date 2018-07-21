from django.http import HttpResponse
from elasticsearch import Elasticsearch
import es_client

from elasticsearch import helpers
from search.elasticsearch import ElasticSearchClass
import xlrd

# Create your views here.

TEAM_DIC = {'ATL':'老鹰','BKN':'篮网','BOS':'凯尔特人','CHI':'公牛','CHA':'黄蜂','CLE':'骑士','MIA':'热火',
                    
 'DET':'活塞','NYK':'尼克斯','ORL':'魔术','IND':'步行者','PHI':'76人','WAS':'奇才','MIL':'雄鹿',
                    
 'TOR':'猛龙','GSW':'勇士','DEN':'掘金','DAL':'独行侠','LAC':'快船','MIN':'森林狼','HOU':'火箭',
                    
 'LAL':'湖人','OKC':'雷霆','MEM':'灰熊','PHO':'太阳','POR':'开拓者','NOH':'鹈鹕','SAC':'国王',
 
 'UTA':'爵士','SAS':'马刺'}

NEWS = {'新浪体育' : ['sina1', 'sina5', 'sina6', 'sina12', 'sina14', 'sina15', 'sina25'],
        '搜狐体育' : ['sohu'],
        '网易体育' : ['netease'],
        '虎扑体育' : ['hupu']
}

DATA_SIZE = 22000
TEAM_SIZE = 30

try:
    from django.utils import simplejson as json
except ImportError:
    import json

def replaceAll(old, new, str):
    while str.find(old) > -1:
        str = str.replace(old, new)
    return str

    '''
    es.index("news", {"name": "14日夏季联赛综述：伯顿压哨抛投绝杀魔术", "label" :  "魔术 魔术王", "my_time" : "2018-07-14", "source": "baidu", "link" : "http://nbachina.qq.com/a/20180714/013195.htm", "content" : "尼克斯102-83轻取鹈鹕，丹尼尔-奥切夫22分8篮板，泰瑞斯-沃克16分5篮板6助攻5抢断，丹伊恩-多特森15分6篮板5助攻，米切尔-罗宾逊14分12篮板5封盖；鹈鹕方面，加尔伦-格林23分，DJ-霍格16分，查森-兰德尔11分3篮板。"})
    es.index("news", {"name": "曝若安东尼恢复自由身 火箭将最有希望得到他", "label" :  "魔术王", "time" : "2018-07-13", "source": "yahoo", "link" : "http://nbachina.qq.com/a/20180714/003886.htm", "content" : "北京时间7月14日，据雅虎记者沙姆斯-查拉尼亚报道，消息人士透露，一旦尼克斯前锋卡梅隆-安东尼成为自由球员，那么休斯顿火箭将会是青睐甜瓜的所有球队中的领跑者。"})
    es.index("player", {"name": "詹姆斯", "content" : "Lebron James", "中文名字" : "勒布朗·詹姆斯", "英文名字" : "Lebron James", "身高" : "2.03m", "体重" : "113kg", "出生日期" : "1984-12-30", "出生地点" : "俄亥俄州阿克伦城", "位置" : "前锋/后卫"})
    es.index("team", {"name": "湖人", "content" : "Lakers", "中文名字" : "湖人队", "英文名字" : "Lakers", "所属地区" : "西部", "成立时间" : "1948", "主球馆" : "斯台普斯中心球馆", "拥有者" : "珍妮-巴斯(Jeanie Buss)", "赛区" : "太平洋区", "主教练" : "卢克-沃顿(Luke Walton)"})
    es.index("data", {"name": "", "team" : "湖人", "content" : "湖人 詹姆斯 2018-2019", "season" : "2018-2019", "player" : "詹姆斯", "出场次数" : "82", "首发次数" : "82", "场均上场时间" : "46.5", "投篮命中率" : "60.0", "场均投篮出手次数" : "25.0", "场均投篮命中次数" : "15.0", "三分球命中率" : "36.5", "场均三分出手次数" : "9.0", "场均三分命中次数" : "3.3", "罚球命中率" : "90.0", "场均罚球出手次数" : "10.0", "场均罚球命中次数" : "9.0", "场均篮板" : "15.0", "前场篮板" : "7.0", "后场篮板" : "8.0", "场均助攻" : "10.2", "场均抢断" : "2.0", "场均盖帽" : "1.2", "场均失误" : "6.2", "场均犯规" : "4.3", "场均得分" : "36.4"})
    es.index("data", {"name": "", "team" : "骑士", "content" : "骑士 詹姆斯 2017-2018", "season" : "2017-2018", "player" : "詹姆斯", "出场次数" : "82", "首发次数" : "82", "场均上场时间" : "46.5", "投篮命中率" : "60.0", "场均投篮出手次数" : "25.0", "场均投篮命中次数" : "15.0", "三分球命中率" : "36.5", "场均三分出手次数" : "9.0", "场均三分命中次数" : "3.3", "罚球命中率" : "90.0", "场均罚球出手次数" : "10.0", "场均罚球命中次数" : "9.0", "场均篮板" : "15.0", "前场篮板" : "7.0", "后场篮板" : "8.0", "场均助攻" : "10.2", "场均抢断" : "2.0", "场均盖帽" : "1.2", "场均失误" : "6.2", "场均犯规" : "4.3", "场均得分" : "36.4"})
    '''

def read_news(f, source):
    es = ElasticSearchClass()

    data = json.load(f)
    
    try:
        for i in data:
            content = i['content']
            content = content.replace('\n','<br>')
            content = content.replace('\u3000', "")
            content = replaceAll('<br><br>', '<br>',  content)
            
            try:
                if content.index('<br>') == 0:
                    content = content[4:-1]
            except Exception:
                print("None extra <br>")
            es.index("news", {"name" : i['title'], "label" : i['label'], 
            "my_time": i['time'], "source" : source, "link" : i['url'], "content" : content})
        
    except Exception:
        print('File add error')

def read_team(table):
    es = ElasticSearchClass()
    
    title = table.row_values(0)
    
    line = 1
    try:
        while len(table.row_values(line)) > 0 :
            body = {}
            p = table.row_values(line)
            es.index("team", {"name": p[1], "content" : p[2], "中文名字" : p[1], "英文名字" : p[2], "所属地区" : p[3], "成立时间" : p[4], "主球馆" : p[5], "拥有者" : p[6], "赛区" : p[7], "主教练" : p[8], "image_link" : p[9]})
            line = line + 1
    except Exception:
        print("read team over")

def read_player(table):
    es = ElasticSearchClass()
    
    title = table.row_values(0)
    line = 1
    try:
        while len(table.row_values(line)) > 0 :
            body = {}
            p = table.row_values(line)
            es.index("player", {"name": p[1], "content" : p[7], "位置" : p[2], "身高" : p[3], "体重" : p[4], "出生年月" : p[5], "出生城市" : p[6], "中文名" : p[7], "image_link" : p[8]})
            line = line + 1
    except Exception:
        print("read player over")

def read_data(table):
    es = ElasticSearchClass()
    
    title = table.row_values(0)
    print(title)
    line = 1
    try:
        while len(table.row_values(line)) > 0 :
            body = {}
            p = table.row_values(line)
            es.index("data", {"name": p[1], "content" : p[7], "位置" : p[2], "身高" : p[3], "体重" : p[4], "出生年月" : p[5], "出生城市" : p[6], "中文名" : p[7], "image_link" : p[8]})
            line = line + 1
    except Exception:
        print("read data over")

def index(request):
    es = ElasticSearchClass()
    '''
    print(len(es.search_all("news")))
    es.delete_all()

    for key in NEWS:
        for file_name in NEWS[key]:
            try:
                file_name = file_name + ".json"
                print(file_name)
                f = open( file_name, encoding='utf-8') 
                read_news(f, key)
            except Exception:
                print('File not found')

    try:
        data = xlrd.open_workbook('team_info.xlsx')
        table = data.sheet_by_name('team_info')
    except Exception:
        print('File not found')
    
    read_team(table)

    try:
        data = xlrd.open_workbook('nba_player_info.xlsx')
        table = data.sheet_by_name('player_info')
    except Exception:
        print('File not found')

    read_player(table)

    #es.delete_all()

    for key,value in TEAM_DIC.items():
        data = xlrd.open_workbook('nba_team_reg_data(%s).xlsx' % key)
        for i in range(1946,2018):
            try:
                table = data.sheet_by_name('regularseason_data ' + str(i))
            except Exception:
                continue
            title = table.row_values(0)
            line = 1
            try:
                while len(table.row_values(line)) > 0 :
                #while line <= 1:
                    body = {}
                    p = table.row_values(line)
                    if(p[1] != '总计'):
                        es.index("data", {
                            "name": p[1], 
                            "content" : p[1], 
                            "team" : value,
                            "season" : str(i),
                            "球员" : p[1], 
                            "出场" : p[2], 
                            "首发" : p[3], 
                            "时间" : p[4], 
                            "投篮" : p[5], 
                            "投篮命中" : p[6], 
                            "投篮出手" : p[7],
                            "三分" : p[8],
                            "三分命中" : p[9],
                            "三分出手" : p[10],
                            "罚球" : p[11],
                            "罚球命中" : p[12],
                            "罚球出手" : p[13],
                            "篮板" : p[14],
                            "前场篮板" : p[15],
                            "后场篮板" : p[16],
                            "助攻" : p[17],
                            "抢断" : p[18],
                            "盖帽" : p[19],
                            "失误" : p[20],
                            "犯规" : p[21],
                            "得分" : p[22]
                            }
                        )
                    line = line + 1
                    print(key, i, line - 1, p[1])
            except Exception:
                print("read data over")
    '''
    #print(es.search_data("詹姆斯"))
    #print(table.row_values(0))
    return HttpResponse(es.count_all())
