import { Learner, Sex } from '../types';

const csvRaw = `SI No.,First Name,Middle Name,Last Name,Student Account,Class Code,Student Phone,Payment Code,Active,Student Email,Guardian Name,Guardian Email,Guardian Phone,Gender,Reg Number,Guardian Relation,Outstanding Balance,Day Boarding,Suite Code
1,Joy,Katiti,Cynthia,4824716,P4,,1004824716,1,,Hajarah Nakanwagi,,706948165,F,,Mother,-250000,D,
2,Victor,,Mugisha,4598780,P1,,1004598780,1,,Eva nakalembe,,705362439,M,,Mother,-210000,D,
3,Gracious,,Mali,11640772,ELEPHANT,,1011640772,1,,Kimera joy,,,M,,Mother,-80000,D,
4,Lael,Victor,Muwanguzi,9102896,ZEBRA,,1009102896,1,,Francis Victor nkambo,,780997788,M,,Father,0,D,
5,Evelyne,Precious,Mmaali,9134161,P1,,1009134161,1,,Joyce kimera,,703986845,F,,Mother,-80000,D,
6,Takizilati,Lubega,Mumbejja,11180143,P6,,1011180143,1,,Sophia Nabakka Nakato,,748937343,F,,Mother,-215000,D,
7,Divine,,Poni,6959658,P3,,1006959658,1,,Jimmy duku,,788353958,F,,Gurdian,0,D,
8,Maraka,Tamara,Fahima,2419485,P7,,1002419485,1,,stephen maraka,,752246215,F,,Father,0,D,
9,Prossy,Patrah,Nagita,1865586,P7,,1001865586,1,,,,,F,,,0,D,
10,Gerald,,Bumba,3547950,P7,,1003547950,1,,,,,M,,,0,D,
11,Ashim,,Mabonga,3547980,P7,,1003547980,1,,wasagali shifah,,756342797,M,,Mother,-416000,B,
12,Fahim,,Kyeyune,3547953,P7,,1003547953,1,,mm,,704234684,M,,Mother,-280000,D,
13,Rahuman,,Kyobe,3547952,P7,,1003547952,1,,,,,F,,,-285000,D,
14,Alvin,,Atuhire,3547956,P7,,1003547956,1,,,,,M,,,0,D,
15,Ssemakula,,Wilson,2543108,P6,,1002543108,1,,ssenga,,752674473,M,,Gurdian,0,D,
16,Joshua,,Mugabo,3547938,P6,,1003547938,1,,uwase lillian,,759611414,M,,Mother,-67000,B,
17,Patience,Nasaazi,Birungi,6975034,P5,,1006975034,1,,Naluwembe Rose,,757300231,F,,Mother,0,D,
18,Lily,Victor,Kwagala,6963789,P5,,1006963789,1,,francis nkambo,,780997788,F,,Father,-165000,,
19,Victorious,Okidi,Wairimu,3547889,P5,,1003547889,1,,ashaba patience,,779523726,F,,Mother,0,B,
20,Kaana,,Shilla,3547903,P5,,1003547903,1,,uwase lillian,,759611414,F,,Mother,-67000,B,
21,Melisa,,Nagadya,3547899,P5,,1003547899,1,,,,,M,,,0,D,
22,Veronica,,Wanyana,4722926,P4,,1004722926,1,,mubiru theresa,,706575416,F,,Gurdian,0,D,
23,Nakawooya,,Swabrah,6613665,P3,,1006613665,1,,PROSSY AMINA NAMULINDWA,,754843770,F,,Mother,0,D,
24,Dinah,Namwano,Mary,3307679,P3,,1003307679,1,,Miwolobi Martha,,752818987,F,,Gurdian,-140000,D,
25,Ssemalulu,,Rich,3272934,P3,,1003272934,1,,Muliwanyi kineositomu,,703654744,M,,,-190000,D,
26,Nakigozi,Martha,Brovia,6914417,LION,,1006914417,1,,NABASUMBA SYLVIA,,756576393,F,,Mother,0,,
27,Hamnah,Sarah,Nakyeyune,7092280,LION,,1007092280,1,,Kyeyune Nagibu,,700120520,F,,Father,-160000,D,
28,Ganiima,Nakkuni,Ramsha,7162822,LION,,1007162822,1,,nakawooya dianah,,754770660,F,,Mother,-60000,D,
29,Maraka,Carina,Rubby,2419494,P5,,1002419494,1,,stephen maraka,,752246215,F,,Father,0,D,
30,Nisha,,Namugabi,6974891,P5,,1006974891,1,,Nakiti Jane,,755039960,F,,Mother,0,B,
31,Chrizestome,,Mulwanyi,8793531,ZEBRA,,1008793531,1,,Chrizestome mulwanyi,,751510482,M,,Father,-180000,D,
32,Lois,,Mirembe,11647706,LION,,1011647706,1,,Ssenyonjo John,,,F,,Father,-80000,D,
33,Nambuya,Malika,Latifah,8784542,P1,,1008784542,1,,Namiganda Roystine,,,F,,Mother,-100000,B,
34,Janet,Mercy,Babirye,4637127,P4,,1004637127,1,,miria naigaga,,753534870,F,,Mother,-200000,D,
35,Namaye,Joyce,Rose,3257666,P4,,1003257666,1,,mayomba silver,,774564868,F,,Father,-415000,D,
36,Haitham,,Kyeyune,6568232,P1,,1006568232,1,,kyeyune najibu,,700120520,M,,Father,-160000,D,
37,Mutabaazi,,Shifurah,3291547,P7,,1003291547,1,,Kyolaba najimah,,782956628,F,,,-135000,D,
38,Mukisa,Eria,Nathan,3297990,P3,,1003297990,1,,Kineti Alex,,772682179,M,,Father,-60000,D,
39,Atuheire,Beatrice,Harmony,7019895,P3,,1007019895,1,,Nansubuga Resty,,750833086,F,,Mother,-70000,D,
40,Sharifah,,Nanyanzi,3547922,P6,,1003547922,1,,,,,M,,,0,D,
41,Shabirah,Isabella,Nabakiibi,5379075,P7,,1005379075,1,,nanozi winnie,,708531444,F,,Gurdian,-400000,D,
42,Emmanuella,Lubega,Namboozo,4970591,P1,,1004970591,1,,Nakijoba Jamira,,706082006,F,,Mother,-100000,D,
43,Suhairah,,Isah,8057858,LION,,1008057858,1,,Isah mboowa,,759419098,F,,,-180000,D,
44,Nakawunde,,Celine,4024811,P7,,1004024811,1,,namusiitwa karen,,700898394,F,,Mother,-157000,B,
45,Shuquran,,Nansubuga,8799582,ZEBRA,,1008799582,1,,Ibrahim kizito,,757945201,F,,Father,-20000,D,
46,Ivanah,,Namutebi,8799211,ZEBRA,,1008799211,1,,Nabukenya prossy,,755350072,F,,Mother,-20000,D,
47,Victoria,Babirye,Bugwata,7037346,LION,,1007037346,1,,Robert Bugwata,,774092902,M,,Father,0,D,
48,Benjamin,,Omu,7037712,P5,,1007037712,1,,Luubu Moses,,703498605,M,,Father,0,D,
49,Mugerwa,,Samantha,4676770,P4,,1004676770,1,,Judith kemigisha,,742472927,F,,Mother,0,D,
50,Serena,Achadu,Barrika,8697299,P1,,1008697299,1,,Joseph ekwap,,752368089,F,,Father,-160000,D,
51,Edgar,Ekwap,Barrack,8697259,P2,,1008697259,1,,Joseph ekwap,,752368089,M,,Father,-160000,D,
52,Humphrey,Imamut,Bahat,8697339,P6,,1008697339,1,,Joseph ekwap,,752368089,M,,Father,-380000,D,
53,Hormony,,Kawalya,6597691,P1,,1006597691,1,,Henry Bijjumbuko,,706948165,M,,Father,-100000,D,
54,Namutamba,,Faith,3372958,P2,759659001,1003372958,1,,Naiwumbwe shakirah,,705716541,F,,Mother,-310000,D,
55,Kalungi,,Blessing,3939847,P3,,1003939847,1,,NAKALEMBE EVA,,705362439,F,,Mother,-30000,D,
56,Pius,,Muwumba,3547965,P7,,1003547965,1,,,,,M,,,-150000,D,
57,Kansaze,,Gloria,3285813,P6,,1003285813,1,,Lubega Joseph,,751424326,F,,Father,-55000,D,
58,Nakayiza,,Rehema,3308684,P4,,1003308684,1,,Kakulu isma,,750844889,F,,Father,-40000,D,
59,Walter,,Tumukunde,8698601,P3,,1008698601,1,,James tumukunde,,752498424,M,,Father,0,D,
60,Rahmah,Rashimah,Nakaweesa,4724654,P3,,1004724654,1,,nakawooya dianah,,754770660,F,,Mother,-130000,D,
61,Jeredin,Kibumba,Bitege,5019546,P1,,1005019546,1,,Guliko Jeremiah,,759659001,M,,Father,-170000,D,
62,Abdu,,Wamala,8807850,ZEBRA,,1008807850,1,,Isima kakulu,,708397991,M,,Father,-140000,D,
63,Angel,Nanfuka,Nabakiibi,4715192,P5,,1004715192,1,,Tibalindya Gladys,,704855095,F,,Mother,0,B,
64,Namikka,,Joeline,7107172,P6,,1007107172,1,,Namugoya Catherine,,782121125,F,,Mother,-155000,D,
65,Gabriella,Ayerango,Grace,9426740,ZEBRA,,1009426740,1,,Daniel Byekwaso,,752272338,F,,Father,-180000,D,
66,Desire,,Nakazibwe,7093281,P7,,1007093281,1,,Robert Bugwata,,774092902,F,,Gurdian,-150000,D,
67,Nambi,,Esther,4773962,P2,,1004773962,1,,Naddamba Jaqueline,,782025680,F,,Mother,0,D,
68,Kristian,Pendo,Ogola,7134587,LION,,1007134587,1,,Samba Joseph Yona OMolo,,766079367,M,,Father,0,D,
69,Travis,,Mudola,7165853,LION,,1007165853,1,,joseph okello,,773344845,M,,Father,-80000,D,
70,Dyna,,Ninsiima,9792957,LION,,1009792957,1,,Busiingye Donald,,709783839,F,,,0,D,
71,Alkham,,Kajjubi,8448676,P1,,1008448676,1,,Ssendawula Ismail,,745750694,M,,Father,-180000,D,
72,Gether,Okasu,Ochola,5517049,P7,,1005517049,1,,moses Okasu Orieba,,704715330,M,,Father,-560000,D,
73,Hannah,Isah,Mbowa,5532248,P2,,1005532248,1,,MASTURAH KAGOYA,,702851316,F,,Mother,-240000,D,
74,Gift,,Nakiwala,6637171,P1,,1006637171,1,,ROBERT BUGWATA,,774092902,F,,Gurdian,0,D,
75,Ssemakula,Joseph,Asher,6914745,LION,,1006914745,1,,Nakalembe Peace,,782992196,M,,Mother,0,D,
76,Jeremiah,,Mukisa,6637354,P1,,1006637354,1,,ROBERT BUGWATA,,774092902,M,,Gurdian,0,D,
77,Kiyimba,,Joram,5580041,LION,,1005580041,1,,,,,M,,,-230000,D,
78,Kajjimu,,Arthur,3413256,P7,701739420,1003413256,1,,Ssebunnya dickson,,783729420,M,,Father,-1055000,D,
79,Sheilah,,Naiga,7278529,P3,,1007278529,1,,NAKIRIJJA JANET,,753807850,F,,Gurdian,0,B,
80,Douglas,Kato,Matovu,11359139,P5,,1011359139,1,,NAKIRIJJA JANET,,753807850,M,,Gurdian,0,B,
81,Prossy,,Namaganda,7278329,P5,,1007278329,1,,NAKIKRIJJA JANET,,753807850,F,,Gurdian,0,B,
82,Chrispas,,Bajja,8704587,P3,,1008704587,1,,Bajja peter,,702073863,M,,Father,-235000,D,
83,Muwanguzi,,Newton,3468140,P3,,1003468140,1,,Namuwonge olive,,709324224,M,,Mother,-67000,D,
84,Darren,Mukiibi,Mayega,7027195,P1,,1007027195,1,,Mayega deogracious,,781359351,M,,Father,0,D,
85,Jerome,Kato,Mugwanya,7108102,P1,,1007108102,1,,Joel Mugwanya,,703965135,M,,Father,-150000,D,
86,Ronald,,Nabangi,7390308,P3,,1007390308,1,,NABANGI JOHN,,758486339,M,,Father,0,D,
87,Sherina,,Rukundo,11360068,P4,,1011360068,1,,MARY NAMUWONGE,,783911718,M,,Mother,0,B,
88,Melisa,Kwagalakwe,Namaganda,11360698,P3,,1011360698,1,,MARIAM NANZIRI,,752894291,F,,Mother,0,B,
89,Brian,Kizza Prosper,Bumpenje,6973917,P1,,1006973917,1,,Nalukenge Racheal,,700565113,M,,Gurdian,0,D,
90,Jordan,,Omarimungu,6613689,P2,,1006613689,1,,ROBERT BUGWATA,,774092902,M,,Gurdian,0,D,
91,Denis,Nsamba,Wasswa,7278816,P5,,1007278816,1,,NAKIRIJJA JANET,,753807850,M,,Gurdian,0,B,
92,Kim,Keiley,Nalubega,8713245,P2,,1008713245,1,,Juan mark allan,bakajuan02@gmail.com,762912130,F,,Father,-60000,D,
93,Shalom,,Mukisa,7986138,LION,,1007986138,1,,Tumushabe Doreen,,,F,,Mother,0,D,
94,Tosuma,Charles,Jacob,6831716,P4,,1006831716,1,,Aswa Nura,,784748690,M,,Gurdian,0,D,
95,Shanitah,,Nakalyango,8849945,P2,,1008849945,1,,Kalyan go Edrisa,,757338040,F,,Father,0,D,
96,Nathaniel,,Mukisa,7986167,P1,,1007986167,1,,Tumushabe Doreen,,,M,,Mother,0,D,
97,Celline,,Nambalirwa,8474726,P7,,1008474726,1,,kaitesi Fauza,,742017875,F,,Mother,-701000,B,
98,Catherine,Ivy,Nakasujja,7985992,P1,,1007985992,1,,Namutebi Jemima,,753640782,F,,Mother,-110000,D,
99,Victor,Valen,Lwanga,8855117,P7,,1008855117,1,,Jane namukasa,,753604153,M,,Father,-130000,B,
100,Raymond,,Saka,7991074,LION,,1007991074,1,,Shakira Nakagolo,,742679518,M,,Mother,-135000,D,
101,Crystal,Havah,Aturinda,8016084,P1,,1008016084,1,,Josephine bugoosi,,701045567,F,,Mother,0,D,
102,Frank,,Isanka,10334379,P5,,1010334379,1,,Nakimuli hellen,,,M,,Mother,-150000,D,
103,Specioza,,Agongo,5477313,P4,,1005477313,1,,AKELLO JOSEPH,,773344845,F,,Father,0,D,
104,Kelen,,Namuganyi,7256020,LION,,1007256020,1,,Babirye Lukia,,742263825,F,,Mother,-190000,D,
105,Angel,Nanyange,Kiwanuka,8730744,P5,,1008730744,1,,Gerald kiwanuka,,702854700,F,,Father,0,D,
106,Alice,,Buzare,8698626,P6,,1008698626,1,,Tumukunde james,,752498424,M,,Father,-10000,D,
107,Blessing,Nanyonjo,Kiwanuka,8730703,P1,,1008730703,1,,Kiwanuka gerald,,702854700,F,,Father,0,D,
108,Precious,Nanyonga,Kiwanuka,8730723,P4,,1008730723,1,,Gerald kiwanuka,,702854700,F,,Father,-300000,D,
109,Gloria,,Namukone,8878201,P3,,1008878201,1,,Santa abago,,786681775,F,,Mother,-170000,D,
110,Grace,,Namwori,8878539,ZEBRA,,1008878539,1,,Santa abago,,786681775,M,,Mother,0,D,
111,Biyonce,,Namuwaya,8878377,P3,,1008878377,1,,Santa abago,,786681775,F,,Mother,0,D,
112,Emmanuel,,Wesonga,8878643,ZEBRA,,1008878643,1,,Paul bagume,,757466856,M,,Father,-190000,D,
113,Mitchel,,Namuwaya,8878445,P2,,1008878445,1,,Santa abago,,786681775,F,,Mother,0,D,
114,Kaleb,Myles,Kolya,9836293,ZEBRA,,1009836293,1,,Dennis lusesi,,704089209,M,,Father,0,D,
115,Mary,,Nakibuka,8048612,LION,,1008048612,1,,Grace Nabaterega,,709959379,F,,Mother,-230000,D,
116,Aafruuz,Mutambuli,Mansoor,11504057,ELEPHANT,,1011504057,1,,Manisul mutambuli,,752271535,M,,Mother,-150000,D,
117,Tyrone,Mukasa,Mugambwa,10607442,ELEPHANT,,1010607442,1,,Tonny Luggolobi Kityo,,752362486,M,,Father,0,D,
118,Mirembe,,Zuri,10278055,P1,,1010278055,1,,Nasaka Phiona,,789426721,F,,Mother,0,D,
119,Kirabo,,Angel,10278079,P5,,1010278079,1,,Nasaka Phiona,,789426721,F,,Mother,-85000,D,
120,Lewin,Amber,Karungi,8888661,P2,,1008888661,1,,Madoi david,,779554047,M,,Gurdian,-130000,D,
121,Giduno,Linus,Wagama,8888771,P3,,1008888771,1,,David madoi,,779554047,M,,Gurdian,-130000,D,
122,Achsah,Serah,Naava,8894881,P2,,1008894881,1,,Caleb mulambuzi,,776934382,F,,Father,-200000,D,
123,Mukula,Robert,Osany,8902598,P7,,1008902598,1,,Achom,,741155625,M,,Mother,-200000,B,
124,Wanyenze,,Joan,8926602,P6,,1008926602,1,,Francis zesiro,,744582832,F,,Gurdian,-95000,D,
125,Melody,Amuria,Muwanguzi,9622248,P3,,1009622248,1,,Otukei Alex,,,F,,Father,-160000,D,
126,Muhammad,,Kadyesi,8984556,P2,,1008984556,1,,Abdu Naser kadyesi,,,M,,Father,0,D,
127,Biden,Ssenyondo,Kakoozajohn,9022251,ZEBRA,,1009022251,1,,Ssenyondo Kato kakooza,,752189028,M,,Father,-100000,D,
128,Precious,,Nahabwe,9035618,P3,,1009035618,1,,Tumwebaze Collins ishanga,,775711760,F,,Father,-575000,B,
129,Aaron,,Nowamani,9035686,P6,,1009035686,1,,Tumwebaze Collins ishanga,,775711760,M,,Father,-145000,B,
130,Nite,Kawala,Racheal,11683362,P2,,1011683362,1,,Alice Nabirye,,744701714,F,,Mother,0,B,
131,Destiny,Amoding,Muwanguzi,9622267,P4,,1009622267,1,,Grace Nandwa,,787788003,F,,Mother,-185000,D,
132,Leon,,Bataringaya,9866525,P6,,1009866525,1,,Boaz mutabaazi,,,M,,Father,-170000,B,
133,Princess,Ayinebyona,Nakato,9912519,ZEBRA,,1009912519,1,,Nakku roy,,751810741,F,,Mother,-310000,D,
134,Alla,Larisa Wasagali,Phyliberta,6836474,P3,,1006836474,1,,MADOI DAVID,,779554047,F,,Gurdian,0,D,
135,Patricia,,Akiror,10287668,P7,,1010287668,1,,JEPHTHAH DIKAN,,787254157,F,,Father,0,D,
136,Lauren,Malaika,Asio,10287642,ZEBRA,,1010287642,1,,JEPHTHAH DIKAN,,787254157,F,,Father,0,D,
137,Pretty,,Nansubuga,10305592,P5,,1010305592,1,,Charges ssuuna,,774956203,F,,Gurdian,0,B,
138,Akram,Gift,Lwanga,3547943,P5,,1003547943,1,,,,,M,,,-134000,D,
139,Nakajja,Taraah,Tahirah,6894127,P7,,1006894127,1,,babirye mariam,,708307776,F,,Father,-290000,D,
140,Ekisulaebweru,Jjemba,Salim,7044996,LION,,1007044996,1,,milly nabasiige,,779518339,M,,Mother,0,D,
141,Waithera,Praise,Okidi,3175525,P7,,1003175525,1,,ashaba patience,,755314299,F,,Mother,0,D,
142,Itamba,,Fortunate,3547957,P7,,1003547957,1,,najjuma reginah,,754165864,F,,Mother,0,B,
143,Anitah-,Otm,Kobusinge,3547961,P7,,1003547961,1,,,,,M,,,-120000,D,
144,Anorld-,Otm,Tumukunde,3547964,P7,,1003547964,1,,,,,M,,,-120000,D,
145,Sam,,Membe,3547928,P5,,1003547928,1,,,,,M,,,0,D,
146,Regan,,Okir,3547954,P7,,1003547954,1,,,,,M,,,0,D,
147,Phylander,Amalia,Nambafu,7940053,P7,,1007940053,1,,Nagudi lydia sarah,,785515056,F,,Mother,0,D,
148,Christiano,,Kayabula,4004316,P6,,1004004316,1,,ssewanyana patrick,,772924737,M,,Gurdian,0,D,
149,Apollo,,Ssewanyana,1865576,P6,,1001865576,1,,mother,,706948165,M,,Mother,-200000,D,
150,David,,Mugarula,3547935,P6,,1003547935,1,,nakato annet,,753743543,M,,Mother,-67000,B,
151,Kevin,,Kuguma,3547933,P6,,1003547933,1,,kobusigye lillian,,757318075,F,,Mother,-37000,B,
152,Nabutono,,Alphine,5475267,P6,,1005475267,1,,Nakibuuka eszer,,706981286,F,,Mother,0,D,
153,Namaganda,,Vannesa,3951652,P7,,1003951652,1,,nassuna prossy,,774088591,F,,Mother,0,D,
154,Destiny,-,Mukisa,3547927,P6,,1003547927,1,,,,,M,,,0,D,
155,Muhanguzi,,Drake,8448851,P6,,1008448851,1,,Nanyombi Margaret,,758728165,M,,Gurdian,-100000,B,
156,Kisakye,,Jonathan,3939786,P6,,1003939786,1,,NAKALEMBE EVA,,705362439,M,,Mother,0,D,
157,Josiah,,Kiyimba,1865564,P5,,1001865564,1,,kiyimba joseph,,776727575,M,,Father,0,D,
158,Kyeswa,,Ronald,3208775,P5,,1003208775,1,,nabasiige milly,,779518339,M,,Mother,-150000,D,
159,Elizabeth,Mercy,Nakitende,8940427,ZEBRA,,1008940427,1,,Nazziwa harriet,,753901753,F,,Mother,0,D,
160,Nyonyintono,,Raaiz,8795996,P5,,1008795996,1,,Namiganda Roystine,,,M,,Mother,-100000,B,
161,Ddamba,,Calvin,4024843,P5,,1004024843,1,,damba,,700898394,M,,Mother,-166000,B,
162,Hannah,Adriel,Bugwata,2433736,P5,,1002433736,1,,,,,F,,,0,D,
163,Aleysha,Alice,Ssemakula,3547898,P5,,1003547898,1,,ssemakula joseph,smak.joe2014@yahoo.com,757211677,F,,,0,D,
164,Bagyenzi,,Benjamin,4900361,P4,,1004900361,1,,Bagyenzi Bright,,750002200,M,,Father,-50000,D,
165,Abigail,Nassali,Immaculate,5503844,P4,,1005503844,1,,MASITULAH NAKATO,,753640782,F,,Mother,-35000,D,
166,Bineme,Johnson,Jacob,6831724,P3,,1006831724,1,,Aswa Nura,,784748690,M,,Gurdian,0,D,
167,Adrine-,Otm,Tushemeyirwe,3548101,P3,,1003548101,1,,,,,M,,,0,D,
168,Kiyimba,,Jotham,3172778,P2,,1003172778,1,,kiyimba,,776727575,M,,Father,-110000,D,
169,Hillary,,Bajjampola,6597116,P2,,1006597116,1,,Bajjampola Gerald,,,M,,Father,-160000,D,
170,Lwanga,Destiny,Adrian,6613640,P1,,1006613640,1,,ROBERT BUGWATA,,774092902,M,,Gurdian,0,D,
171,William,George,Ojulu,8817815,P1,,1008817815,1,,Hellen akello,,760567792,M,,Mother,0,D,
172,Joseph,Dikan Blessing,Teem,10287696,P1,,1010287696,1,,JEPHTHAH DIKAN,,787254157,M,,Mother,0,D,
173,Fahim,,Mubiru,8799658,LION,,1008799658,1,,Ibrahim kizito,,757945201,F,,Father,-15000,D,
174,Hosanna,Nakiberu,Abigail,8894704,LION,,1008894704,1,,Caleb mulambuzi,,776934382,F,,Father,-160000,D,
175,Farish,,Akaruhanga,10509300,P3,,1010509300,1,,Akugizibwe Joseph,,750970023,M,,Father,-170000,D,
176,Aleem,Afan,Galugali,10521012,ELEPHANT,,1010521012,1,,Bogere Hamidu,,785798607,M,,Father,0,D,
177,Aaron,,Kisakye,11764380,P7,,1011764380,1,,Hellen nakimuli,,744031347,M,,Gurdian,-530000,B,
178,Nikky,,Nansubuga,10668240,ELEPHANT,,1010668240,1,,Wyclef kizito,,705618595,F,,Father,-100000,D,
179,Nestor,,Nalwanga,10668311,P2,,1010668311,1,,Wyclef kizito,,705618595,F,,Father,-175000,D,
180,Nestine,Liz,Namatovu,10668353,P3,,1010668353,1,,Wyclef kizito,,747122601,F,,Father,-175000,D,
181,Hannah,Binthamis,Nabatanzi,10680309,ELEPHANT,,1010680309,1,,Hamis Bunya,,754045712,F,,Father,0,D,
182,Sharon,,Kiyimba,7105160,P7,,1007105160,1,,Kiyimba Contance Nakyanzi,,771664117,M,,Gurdian,-430000,D,
183,Gift,,Nandudu,9121306,P7,,1009121306,1,,Masolo milton,,701726212,F,,Father,-30000,B,
184,Reuben,,Ssekajja,10696952,P1,,1010696952,1,,NASSANGA PROSSY,,705867620,M,,Mother,-60000,D,
185,Jacob,,Drileba,10709771,P7,,1010709771,1,,Aceku phillemon,,772515271,M,,Father,-80000,D,
186,Daniel,,Mukisa,10718877,ELEPHANT,,1010718877,1,,Isaac kinebe,,,M,,Father,0,D,
187,Joshua,Achali,Kisakye,10605242,P2,,1010605242,1,,Kenneth Ruyonga,,,M,,Father,0,D,
188,Faith,Namata,Patricia,10751708,P4,,1010751708,1,,SSemuyaga Paul,,750632579,F,,Father,0,D,
189,Ruth,,Mirab,10779756,ELEPHANT,,1010779756,1,,HELLEN NAKUMULI,,744031647,F,,Mother,-200000,D,
190,Faudel,,Najib,11817153,LION,757211677,1011817153,1,smak.angel.js@gmail.com,Hassan Najib,,752753579,M,,Father,-100000,D,
191,Connoly,,Twesigamukama,8971059,P7,,1008971059,1,,Tumwebaze Collins ishanga,,775711760,M,,Father,-440000,B,
192,Samantha,Zion,Nalubega,10843350,ELEPHANT,,1010843350,1,,Annet Nabatanzi,,750946927,F,,Mother,-120000,D,
193,Alvin,Nimurungi,Sserugo,10843458,ELEPHANT,,1010843458,1,,Dianah turyahebwa,,763079231,M,,Mother,-80000,D,
194,Putin,,Ngoloobe,10843563,P1,,1010843563,1,,Lamula mugala,,742877704,M,,Mother,-120000,D,
195,Jethro,Wasswa,Mugwanya,7107888,P1,,1007107888,1,,Joel Mugwanya,,703965135,M,,Father,-150000,D,
196,Paul,Troy,Sempela,10779912,ELEPHANT,,1010779912,1,,NAMBOOWA GORRET,,740049937,M,,Mother,-200000,D,
197,Kautharah,,Nakirya,10888645,P3,,1010888645,1,,Namatende Rehema,,752466228,F,,Mother,-110000,D,
198,Pretty,Kiwanuka,Nanyonga,10890359,ELEPHANT,,1010890359,1,,kiwanuka Ronald,,702854700,F,,Father,0,D,
199,Peter,,Twabalyaki,10894711,P4,,1010894711,1,,Isabirye Simon,,706144793,M,,Father,-30000,D,
200,Dinah,,Adeke,10903517,ELEPHANT,,1010903517,1,,David Magal,,776812156,F,,,0,D,
201,Shukran,,Namutebi,10909102,ELEPHANT,,1010909102,1,,Ssenyonga John,,746195577,F,,Father,-160000,D,
202,Alvin,,Mutebi,8940785,ZEBRA,,1008940785,1,,Yatuwa florence,,700912948,M,,Mother,0,D,
203,Hairat,,Kasowole,11846781,P5,,1011846781,1,,NANYOMBI MARGARET,,758728165,F,,Gurdian,0,B,
204,Genesis,,Kyeyune,11891049,P4,,1011891049,1,,Kazibwe henry,,772569476,M,,Father,-135000,D,
205,Sarah,,Namutebi,11891382,P1,,1011891382,1,,Babirye nakakawa,,700171279,F,,Mother,-150000,D,
206,Calvin,,Kanamwanji,11891451,LION,,1011891451,1,,Babirye nakakawa,,700171279,M,,Mother,-100000,D,
207,Clithen,,Ssebuufu,11917117,P2,,1011917117,1,,Godfrey kalyango,,,M,,Father,-109000,D,
208,Vivian,,Atayi,11918621,P4,,1011918621,1,,Peter Aroro,,704134433,F,,Father,-75000,D,
209,Ramos,Ntambi,Kabenge,11919112,ZEBRA,,1011919112,1,,Keith ssozi,,,M,,Father,-150000,D,
210,Joyce,,Kuteesa,11919362,P4,,1011919362,1,,Unice Mirembe,,704134433,F,,Mother,-125000,D,
211,Gettu,,Nabwire,11935385,P2,,1011935385,1,,Geofrey Onyango,,755695320,F,,Father,-80000,D,
212,Kelly,Jay,Nalugo,11966463,P2,,1011966463,1,,Henry serugo,,782850655,F,,Father,-310000,D,
213,Gideon,Kaweesa,Mukisa,11969824,LION,,1011969824,1,,Luke kizito,,,M,,Father,-160000,D,
214,Marvin,,Nsubuga,12039780,P6,,1012039780,1,,Robert Nsubuga,,,M,,Father,-185000,D,
215,Delvin,Joshua,Nsubuga,12039842,P2,,1012039842,1,,Robert Nsubuga,,709853854,M,,Father,-160000,D,
216,Melvin,Ezra,Nsubuga,12039890,P6,,1012039890,1,,Robert Nsubuga,,757755924,M,,Father,-185000,D,`;

export function getSeededLearners(): Learner[] {
  const lines = csvRaw.trim().split('\n');
  const learners: Learner[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(',');
    if (cols.length < 5) continue;

    const siNo = cols[0]?.trim() || `${i}`;
    const firstName = cols[1]?.trim() || '';
    const middleName = cols[2]?.trim() || '';
    const lastName = cols[3]?.trim() || '';
    const studentAccount = cols[4]?.trim() || '';
    const classCode = cols[5]?.trim() || '';
    const studentPhone = cols[6]?.trim() || '';
    const paymentCode = cols[7]?.trim() || '';
    const active = cols[8]?.trim() || '1';
    const studentEmail = cols[9]?.trim() || '';
    const guardianName = cols[10]?.trim() || '';
    const guardianEmail = cols[11]?.trim() || '';
    const guardianPhone = cols[12]?.trim() || '';
    const genderRaw = cols[13]?.trim() || 'M';
    const regNumber = cols[14]?.trim() || '';
    const guardianRelation = cols[15]?.trim() || '';
    const outstandingBalance = cols[16]?.trim() || '0';
    const dayBoarding = cols[17]?.trim() || 'D';
    const suiteCode = cols[18]?.trim() || '';

    const sex: Sex = genderRaw === 'F' ? 'Female' : 'Male';

    const nameParts = [firstName, middleName, lastName].filter(Boolean);
    const fullName = nameParts.join(' ');

    const numericPart = (1000 + parseInt(siNo, 10)).toString();
    const admNo = studentAccount ? `OTEC/${studentAccount}` : `OTEC/2026/${numericPart}`;
    const lin = paymentCode ? `LIN-${paymentCode}` : `LIN-2026-${100000 + parseInt(siNo, 10)}`;
    const photo = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`;

    let age = '12';
    if (['ZEBRA', 'LION', 'ELEPHANT'].includes(classCode)) {
      age = '4';
    } else if (classCode === 'P1') age = '6';
    else if (classCode === 'P2') age = '7';
    else if (classCode === 'P3') age = '8';
    else if (classCode === 'P4') age = '9';
    else if (classCode === 'P5') age = '10';
    else if (classCode === 'P6') age = '11';
    else if (classCode === 'P7') age = '12';

    learners.push({
      id: `seeded_${siNo}`,
      name: fullName,
      firstName: firstName || undefined,
      middleName: middleName || undefined,
      lastName: lastName || undefined,
      studentAccount: studentAccount || undefined,
      admNo,
      sex,
      age,
      cls: classCode,
      paycode: paymentCode || undefined,
      studentPhone: studentPhone || undefined,
      active: active || '1',
      studentEmail: studentEmail || undefined,
      guardianName: guardianName || undefined,
      guardianEmail: guardianEmail || undefined,
      guardianPhone: guardianPhone || undefined,
      guardianRelation: guardianRelation || undefined,
      outstandingBalance: outstandingBalance || '0',
      dayBoarding: dayBoarding || 'D',
      suiteCode: suiteCode || undefined,
      lin,
      photo
    });
  }

  return learners;
}
