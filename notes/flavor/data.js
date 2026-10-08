// 図鑑のフレーバーテキストの候補（2026-10-08 下書き）。
// 道具: Lv1 は実装済みの文言（変えない）。Lv2〜12 は画像を見て「素材・重さ」を書いた案。
// 宝石: 実在の宝石の小ネタ。産地・土地の名前は書かない（ゲームの舞台とぶれるため）。
// 候補の採用は feedback.json の choices に、文言の手直しは comments に入る（index.html を参照）。
window.FLAVOR_DATA = {
  tools: {
    mattock: { label: 'Mattock（マトック）', note: '片側が平刃のつるはし', levels: [
      { lv: 1, fixed: true, ja: 'コツコツコツ', en: 'Tap, tap, tap.' },
      { lv: 2, ja: '鉄のマトック。頭は鉄、柄は木。', en: 'Iron Mattock. Iron head, wooden haft.' },
      { lv: 3, ja: '鋼のマトック。頭も柄も鋼。', en: 'Steel Mattock. Steel head and haft.' },
      { lv: 4, ja: '溝柄のマトック。柄に滑り止めの溝。', en: 'Grooved Mattock. Anti-slip grooves on the haft.' },
      { lv: 5, ja: '曲柄のマトック。曲がった柄と軽い頭。', en: 'Bent Mattock. Curved haft, light head.' },
      { lv: 6, ja: '紫合金のマトック。柄は軽い紫の合金。', en: 'Violet Alloy Mattock. Light violet-alloy haft.' },
      { lv: 7, ja: '赤合金のマトック。柄の先に手首の輪。', en: 'Red Alloy Mattock. Wrist loop at the end of the haft.' },
      { lv: 8, ja: '黒鋼のマトック。黒い鋼で重い。', en: 'Black Steel Mattock. Black steel, heavy.' },
      { lv: 9, ja: '広刃のマトック。刃が広く、頭が重い。', en: 'Broad Mattock. Wide blade, head-heavy.' },
      { lv: 10, ja: '赤線のマトック。柄と刃に赤い筋。', en: 'Red-Line Mattock. Red lines along the haft and blade.' },
      { lv: 11, ja: '緑合金のマトック。錆びない緑の合金。', en: 'Green Alloy Mattock. Rust-free green alloy.' },
      { lv: 12, ja: '宝石のマトック。頭に緑の宝石。', en: 'Gem Mattock. A green gem set in the head.' },
    ]},
    pickaxe: { label: 'Pickaxe（ピッケル）', note: '両側が尖ったつるはし', levels: [
      { lv: 1, fixed: true, ja: 'カッカッカッ', en: 'Clink, clink, clink.' },
      { lv: 2, ja: '鉄のピッケル。頭は鉄、柄は木。', en: 'Iron Pickaxe. Iron head, wooden haft.' },
      { lv: 3, ja: '鋼のピッケル。頭も柄も鋼。', en: 'Steel Pickaxe. Steel head and haft.' },
      { lv: 4, ja: '帯締めのピッケル。首を金具で締めてある。', en: 'Banded Pickaxe. Neck bound with metal bands.' },
      { lv: 5, ja: '宝石付きのピッケル。頭に小さな宝石。', en: 'Jeweled Pickaxe. A small gem set in the head.' },
      { lv: 6, ja: '片刃のピッケル。片側だけの頭、柄に宝石2つ。', en: 'Single-Edge Pickaxe. One-sided head, two gems on the haft.' },
      { lv: 7, ja: '標識のピッケル。頭は道路標識。', en: 'Signpost Pickaxe. The head is a road sign.' },
      { lv: 8, ja: '結晶のピッケル。頭は緑の結晶。', en: 'Crystal Pickaxe. Green crystal head.' },
      { lv: 9, ja: '氷のピッケル。頭は青い氷の結晶。', en: 'Ice Pickaxe. Head of blue ice crystal.' },
      { lv: 10, ja: '青鋼のピッケル。青い頭、布巻きの柄。', en: 'Blue Steel Pickaxe. Blue head, wrapped haft.' },
      { lv: 11, ja: '紫合金のピッケル。紫の頭に金の石。', en: 'Violet Alloy Pickaxe. A gold stone in a violet head.' },
      { lv: 12, ja: '黒鋼のピッケル。黒い頭に金の目。', en: 'Black Steel Pickaxe. A gold eye in a black head.' },
    ]},
    sledgehammer: { label: 'Sledgehammer（ハンマー）', note: '大槌', levels: [
      { lv: 1, fixed: true, ja: 'ゴンゴンゴン', en: 'Thud, thud, thud.' },
      { lv: 2, ja: '鉄のハンマー。頭は鉄、柄は木。', en: 'Iron Sledgehammer. Iron head, wooden haft.' },
      { lv: 3, ja: '鋼のハンマー。頭も柄も鋼。', en: 'Steel Sledgehammer. Steel head and haft.' },
      { lv: 4, ja: '布巻きのハンマー。握りに布を巻いた。', en: 'Wrapped Sledgehammer. Cloth-wrapped grip.' },
      { lv: 5, ja: '焼入れのハンマー。焼き入れした黒い頭。', en: 'Hardened Sledgehammer. Hardened black head.' },
      { lv: 6, ja: '宝石付きのハンマー。頭に黄色い石。', en: 'Jeweled Sledgehammer. A yellow stone set in the head.' },
      { lv: 7, ja: '穴あきのハンマー。頭に穴があり、軽い。', en: 'Hollow Sledgehammer. A hole through the head; lighter.' },
      { lv: 8, ja: '片尖りのハンマー。片面は平ら、片面は尖り。', en: 'Pick Sledgehammer. One flat face, one pointed.' },
      { lv: 9, ja: '三尖のハンマー。上と横に尖り。', en: 'Spiked Sledgehammer. Spikes on top and side.' },
      { lv: 10, ja: '両頭のハンマー。両面が打面。', en: 'Double-Head Sledgehammer. Two striking faces.' },
      { lv: 11, ja: '冠のハンマー。頭に飾りの冠。', en: 'Crowned Sledgehammer. A crown ornament on the head.' },
      { lv: 12, ja: '紫宝石のハンマー。黒い金属に紫の石3つ。', en: 'Violet Gem Sledgehammer. Three purple stones in black metal.' },
    ]},
  },
  biomes: [
    { key: '1-1', name: 'Umecha（1-1）' },
    { key: '1-2', name: 'Himejine（1-2）' },
    { key: '1-3', name: 'Tanuki（1-3）' },
    { key: '2-1', name: 'Bepp（2-1）' },
    { key: '2-2', name: 'Nukt（2-2）' },
    { key: '3-1', name: 'WetLand（3-1）' },
  ],
  // candidates: 1 文ずつ。最初の 1 つが推奨。
  gems: [
    // ---- 1-1 Umecha ----
    { biome: '1-1', id: 'quartz', name: 'Quartz', color: 'F5F5F5', candidates: [
      '地殻でいちばんありふれた宝石。砂浜の砂の多くはこの石のかけら。',
      '押すと電気を生む。時計の中で時を刻んでいるのもこの石。',
      '名前は古い言葉で「硬い」。爪でも鉄でも傷がつかない。' ]},
    { biome: '1-1', id: 'amethyst', name: 'Amethyst', color: '9966CC', candidates: [
      '名前は古い言葉で「酔わない」。酒に酔わないお守りだった。',
      '紫は、わずかな鉄に長い年月の放射線が当たってできた色。',
      '熱すると黄色に変わる。市場の黄水晶の多くはこの石の変わり身。' ]},
    { biome: '1-1', id: 'morganite', name: 'Morganite', color: 'F4A7B9', candidates: [
      'エメラルドやアクアマリンと同じ家族。桃色はマンガンの仕業。',
      '大きな結晶に育ちやすい。大粒でも値が落ちにくい珍しい宝石。',
      'ある宝石収集家の名前をもらった。桃色のベリル。' ]},
    { biome: '1-1', id: 'amazonite', name: 'Amazonite', color: '66CCAA', candidates: [
      '緑青色の長石。白い細い筋が走っていることが多い。',
      '色のもとは、ごく微量の鉛と水。',
      '古くは護符として彫られた。月長石と同じ家族。' ]},
    { biome: '1-1', id: 'padparadschasapphire', name: 'Padparadscha Sapphire', color: 'FF7F50', candidates: [
      '名前は古い言葉で「蓮の花」。桃色と橙色のちょうど間。',
      'サファイアの中でいちばん珍しい色のひとつ。鉄とクロムの絶妙な配分。',
      '桃色に寄っても橙色に寄っても、この名前は名乗れない。' ]},
    { biome: '1-1', id: 'paraibatourmaline', name: 'Paraiba Tourmaline', color: '2ED9C3', candidates: [
      'ネオンのような青緑は銅の色。1980年代に見つかった新しい宝石。',
      '暗い部屋でも光って見えるほど明るい。小粒でもとても高価。',
      'トルマリンは熱すると電気を帯びる。昔は灰を吸い寄せる石と呼ばれた。' ]},
    { biome: '1-1', id: 'moonstone', name: 'Moonstone', color: 'EDEAE0', candidates: [
      '傾けると青白い光が中で揺れる。薄い層が光を散らしている。',
      '昔は月の光が固まったものと信じられた。6月の誕生石。',
      '二種類の長石が、髪の毛より薄く重なってできている。' ]},
    { biome: '1-1', id: 'rubelite', name: 'Rubelite', color: 'C83060', candidates: [
      '赤いトルマリン。どんな光の下でも赤く見える石だけがこう名乗れる。',
      '赤はマンガンの色。ルビーより軽く、少し柔らかい。',
      '熱すると電気を帯びる。磨いた後、ほこりを吸い寄せる。' ]},
    { biome: '1-1', id: 'aquamarine', name: 'Aquamarine', color: '7FFFD4', candidates: [
      '名前は「海の水」。船乗りのお守りだった。',
      'エメラルドと同じ家族。青は鉄の色。',
      '傷がつきにくく、透明な大粒が採れやすい。3月の誕生石。' ]},
    { biome: '1-1', id: 'catseyequartz', name: "Cat's Eye Quartz", color: 'D4AF37', candidates: [
      '細い針が無数に並んで、一本の光の筋を作る。石を回すと筋も動く。',
      '猫の目の光は、半球に磨いて初めて現れる。',
      '針の正体は繊維状の別の鉱物。石英がそれを抱き込んで育った。' ]},
    { biome: '1-1', id: 'tsavorite', name: 'Tsavorite', color: '00A550', candidates: [
      '緑のガーネット。1960年代に見つかった、比較的新しい宝石。',
      '緑はバナジウムとクロム。加熱などの処理をほぼ必要としない。',
      'エメラルドより傷に強く、内包物が少ない。' ]},
    { biome: '1-1', id: 'rosequartz', name: 'Rose Quartz', color: 'F7CAC9', candidates: [
      '淡い桃色の石英。色の原因は今も議論が続いている。',
      '大きな結晶はまれ。ほとんどは面のない塊で見つかる。',
      '「愛の石」と呼ばれてきた。磨くと柔らかく光る。' ]},
    { biome: '1-1', id: 'demantoid', name: 'Demantoid', color: '7FFF00', candidates: [
      '名前は「ダイヤモンドのような」。虹色の輝きはダイヤを超える。',
      '緑のガーネット。馬の尻尾のような内包物が入ると、むしろ値が上がる。',
      '宝石にしては柔らかい。指輪よりペンダント向き。' ]},
    // ---- 1-2 Himejine ----
    { biome: '1-2', id: 'bluequartz', name: 'Blue Quartz', color: '5B8DB8', candidates: [
      '微細な粒が青い光だけを散らす。空が青いのと同じ仕組み。',
      '石英に青い針状の鉱物が入り込んだもの。大きな結晶はまれ。' ]},
    { biome: '1-2', id: 'crystalopal', name: 'Crystal Opal', color: 'D0E8F0', candidates: [
      '透明な地の奥で色が泳ぐ。オパールは水を含んでいる。',
      '遊色の正体は、そろって並んだ小さな球。球の大きさで色が決まる。',
      '乾きすぎるとひびが入る。たまに水をあげるといい。' ]},
    { biome: '1-2', id: 'phantomquartz', name: 'Phantom Quartz', color: 'D8D8D8', candidates: [
      '結晶の中に、昔の自分の姿が影として残っている。',
      '一度成長が止まり、また始まった記録。石の成長日記。',
      '影の層の数だけ、休んで、また育った。' ]},
    { biome: '1-2', id: 'jasper', name: 'Jasper', color: 'C1440E', candidates: [
      '名前は古い言葉で「まだらの石」。赤は鉄の色。',
      '不透明な石英の集まり。模様が風景に見えるものもある。',
      '古くは印章や矢じりに。磨くと鈍く光る。' ]},
    { biome: '1-2', id: 'hessonite', name: 'Hessonite', color: 'C87020', candidates: [
      '名前は古い言葉で「劣る」。他のガーネットより少し柔らかいから。',
      '中をのぞくと、蜂蜜を溶かしたような渦が見える。',
      '橙色のガーネット。シナモンの石とも呼ばれる。' ]},
    { biome: '1-2', id: 'mandaringarnet', name: 'Mandarin Garnet', color: 'FF6600', candidates: [
      '名前のとおり、みかんの色。マンガンが作る橙色。',
      '1990年代に見つかった、鮮やかなガーネット。',
      '内包物が少なく、小粒でもよく光る。' ]},
    { biome: '1-2', id: 'aventurinequartz', name: 'Aventurine Quartz', color: '4CAF50', candidates: [
      '中できらめくのは、雲母の薄い鱗。',
      '名前は「偶然」。似たきらめきのガラスが、偶然できたのが先だった。',
      '緑は雲母の色。石英そのものは無色。' ]},
    { biome: '1-2', id: 'redspinel', name: 'Red Spinel', color: 'E0115F', candidates: [
      '長いあいだルビーと間違われてきた。ある王冠の有名な「ルビー」も、実はこの石。',
      '赤はクロム。結晶は八面体で、磨かなくても角が立っている。',
      '光が一方向にしか曲がらないので、色が隅々まで均一に見える。' ]},
    { biome: '1-2', id: 'rubyspinel', name: 'Ruby Spinel', color: 'C8001A', candidates: [
      'ルビーにいちばん近い赤のスピネル。ルビーより軽い。',
      '硬さは8。ルビーには一歩及ばないが、傷はまずつかない。',
      '昔の宝石商は、ルビーとこの石を区別していなかった。' ]},
    { biome: '1-2', id: 'calcite', name: 'Calcite', color: 'F8F0D2', candidates: [
      '透明な結晶を文字の上に置くと、文字が二重に見える。',
      '石灰岩や大理石のもと。酸をかけると泡を出す。',
      '硬さは3。爪より少し硬い程度で、宝石の中ではとても柔らかい。' ]},
    { biome: '1-2', id: 'trapicheemerald', name: 'Trapiche Emerald', color: '2E8B57', candidates: [
      '六本の黒い筋が、車輪のように放射している。',
      '名前は砂糖きびを絞る歯車の形から。',
      '結晶が育つとき、面と面の境目に不純物がたまってできた模様。' ]},
    { biome: '1-2', id: 'apatite', name: 'Apatite', color: '00CFFF', candidates: [
      '名前は古い言葉で「だます」。いろいろな宝石に似すぎていた。',
      '歯や骨の主成分と同じ鉱物。',
      '硬さは5。硬さを測る物差しの、ちょうど真ん中の石。' ]},
    { biome: '1-2', id: 'pyrope', name: 'Pyrope', color: '6B0000', candidates: [
      '名前は「火の目」。深い赤のガーネット。',
      '内包物がほとんど無く、小粒でも澄んでいる。',
      '赤はクロムと鉄。暗い場所では黒に見える。' ]},
    // ---- 1-3 Tanuki ----
    { biome: '1-3', id: 'dumortieritequartz', name: 'Dumortierite Quartz', color: '3B5998', candidates: [
      '藍色の針が石英に閉じ込められている。',
      '熱にとても強い。磁器の材料にもなった鉱物。',
      '青というより藍。見る角度で濃さが変わる。' ]},
    { biome: '1-3', id: 'colorchangesapphire', name: 'Color Change Sapphire', color: '6A5ACD', candidates: [
      '日の光では青、灯りの下では紫に変わる。',
      '色が変わるのは、わずかなバナジウムのせい。',
      'アレキサンドライトと同じ仕組み。光の中身が違うと、返す色も違う。' ]},
    { biome: '1-3', id: 'starruby', name: 'Star Ruby', color: 'D75688', candidates: [
      '六条の星が光る。針状の鉱物が三方向に並んでいる。',
      '星は半球に磨いて初めて現れる。透明なルビーより濁っているのに、人気はこちら。',
      '光を動かすと、星も石の上を滑る。' ]},
    { biome: '1-3', id: 'purplesapphire', name: 'Purple Sapphire', color: 'AF59FF', candidates: [
      '紫はクロムと鉄の合作。昔はアメジストと混同された。',
      '赤以外のコランダムは、みんなサファイアと呼ばれる。',
      '夕方の光でいちばん紫に見える。' ]},
    { biome: '1-3', id: 'cuprousoxidecuprite', name: 'Cuprite', color: '9B1B30', candidates: [
      '銅が錆びてできた、深い赤の結晶。',
      '柔らかくて磨きにくい。宝石になれるものはごくわずか。',
      '名前は銅を指す古い言葉から。' ]},
    { biome: '1-3', id: 'orangesapphire', name: 'Orange Sapphire', color: 'FF8C00', candidates: [
      '夕焼けの色。鉄とクロムが作る。',
      '橙色のサファイアは、青より珍しい。',
      '桃色が混じると別の名前になる。純粋な橙色だけがこの名前。' ]},
    { biome: '1-3', id: 'pinktourmaline', name: 'Pink Tourmaline', color: 'FF69B4', candidates: [
      '桃色はマンガン。10月の誕生石。',
      '一本の結晶の両端で、色が違うことがある。',
      'こすると静電気を帯びて、ほこりを吸い寄せる。' ]},
    { biome: '1-3', id: 'indicolite', name: 'Indicolite', color: '1A5A8A', candidates: [
      '名前は「藍」。青いトルマリン。',
      'トルマリンの中でも、青はとくにまれ。',
      '青は鉄の色。見る方向で濃さが変わる。' ]},
    { biome: '1-3', id: 'carnelian', name: 'Carnelian', color: 'B94040', candidates: [
      '古代から印章に使われた。熱い蝋がくっつかない。',
      '赤橙は鉄の色。半透明で、光にかざすと燃えているよう。',
      '名前は「肉」とも「さくらんぼ」ともいわれる。' ]},
    { biome: '1-3', id: 'smokyquartz', name: 'Smoky Quartz', color: '7B5E57', candidates: [
      '煙の色は、地中で長い年月をかけて浴びた放射線が作った。',
      '熱すると色が抜けて、ただの水晶に戻る。',
      '昔はサングラスのレンズに削られた。' ]},
    { biome: '1-3', id: 'yellowsapphire', name: 'Yellow Sapphire', color: 'FFD700', candidates: [
      '黄色は鉄。サファイアは青だけではない。',
      '無色の石を熱して黄色にしたものも多い。',
      '日の光の下でいちばん映える。' ]},
    { biome: '1-3', id: 'heliodor', name: 'Heliodor', color: 'FFEA00', candidates: [
      '名前は「太陽の贈り物」。黄金色のベリル。',
      'アクアマリンの黄色い兄弟。色は鉄の量で決まる。',
      '光にかざすと、中まで黄色く透ける。' ]},
    { biome: '1-3', id: 'andradite', name: 'Andradite', color: '8B7536', candidates: [
      'ガーネットの一族。デマントイドはこの中の緑。',
      '鉄とカルシウムでできている。黄から黒まで色の幅が広い。',
      'ダイヤに迫る虹の輝きを持つ、数少ない石。' ]},
    // ---- 2-1 Bepp ----
    { biome: '2-1', id: 'adularia', name: 'Adularia', color: 'F0EEE8', candidates: [
      '透明な長石。ムーンストーンの正体のひとつ。',
      '「青白い揺れる光」を表す言葉は、この石の名前から生まれた。',
      '高い山の岩の割れ目で、ゆっくり育つ。' ]},
    { biome: '2-1', id: 'spessartine', name: 'Spessartine', color: 'E8601A', candidates: [
      '橙色のガーネット。マンガンが作る。',
      'みかん色のガーネットの、正式な名前。',
      '透明で、内包物が少ない。' ]},
    { biome: '2-1', id: 'flashopal', name: 'Flash Opal', color: 'C8D8E8', candidates: [
      '傾けた一瞬だけ、面いっぱいに色が走る。',
      '遊色は、そろって並んだ小さな球が光を割って作る。',
      '動かしてこそ本領。じっと見ていても分からない。' ]},
    { biome: '2-1', id: 'fluorescentdiamond', name: 'Fluorescent Diamond', color: 'C8A0E8', candidates: [
      '紫外線を当てると青く光るダイヤ。',
      '光るのは窒素のせい。ダイヤのおよそ三割に、この性質がある。',
      '日の光の下では、ほんのわずかに白っぽく見える。' ]},
    { biome: '2-1', id: 'greenberyl', name: 'Green Beryl', color: '78C878', candidates: [
      '緑のベリルなのに、エメラルドとは呼んでもらえない。',
      '緑のもとがクロムではなく鉄だと、エメラルドの線引きから外れる。',
      '線引きの外にいるだけで、石そのものは同じ家族。' ]},
    { biome: '2-1', id: 'catseyespinel', name: "Cat's Eye Spinel", color: 'D4AF37', candidates: [
      '猫の目が光るスピネルは、とてもまれ。',
      '針状の内包物が一方向にそろって、光の筋を作る。',
      '半球に磨いて、初めて目が開く。' ]},
    { biome: '2-1', id: 'carbonado', name: 'Carbonado', color: '2A2A2A', candidates: [
      '黒いダイヤの集まり。小さな結晶が無数にくっついている。',
      '宇宙から来たという説がある。',
      'ダイヤの中でいちばん硬いとも。だから磨くのが難しい。' ]},
    { biome: '2-1', id: 'asteriatedquartz', name: 'Asteriated Quartz', color: 'E8E8E8', candidates: [
      '石英なのに星が光る。まれな組み合わせ。',
      '六条の光は、針状の内包物が三方向に並んだしるし。',
      '光を動かすと、星も動く。' ]},
    { biome: '2-1', id: 'browndiamond', name: 'Brown Diamond', color: '8B5E3C', candidates: [
      'ダイヤの色でいちばん多いのは、茶色。',
      '茶色は不純物ではなく、結晶の歪みが作る。',
      '「シャンパン」「コニャック」と、濃さで呼び分けられる。' ]},
    { biome: '2-1', id: 'strawberryquartz', name: 'Strawberry Quartz', color: 'E8735A', candidates: [
      '赤い針が点々と見える。苺の種のよう。',
      '針の正体は鉄の鉱物。石英がそれを抱いて育った。',
      '光にかざすと、中の針がきらりと並ぶ。' ]},
    { biome: '2-1', id: 'bluespinel', name: 'Blue Spinel', color: '4169E1', candidates: [
      'いちばん鮮やかな青は、コバルトが作る。',
      '鉄の青はくすむ。澄んだ青はまれ。',
      '八面体の結晶。磨かなくても形が整っている。' ]},
    { biome: '2-1', id: 'reddiamond', name: 'Red Diamond', color: '9B111E', candidates: [
      'ダイヤの中でいちばん珍しい色。知られている石は数十個。',
      '赤は不純物ではなく、結晶の歪みが作る。',
      '小粒でも、ひとつひとつに名前が付くほど。' ]},
    { biome: '2-1', id: 'prasiolite', name: 'Prasiolite', color: '8DB600', candidates: [
      '名前は「ネギ」の緑。',
      '天然のものはまれ。多くはアメジストを熱して作られる。',
      '緑の石英は、自然界にはほとんど無い。' ]},
    // ---- 2-2 Nukt ----
    { biome: '2-2', id: 'elbaite', name: 'Elbaite', color: '5A9A5A', candidates: [
      'トルマリンの中で、いちばん宝石になる種類。',
      '一本の結晶の中に、いくつもの色を持つことがある。',
      '赤も緑も青も、みんなこの石の仲間。' ]},
    { biome: '2-2', id: 'lodolite', name: 'Lodolite', color: 'A8C5A0', candidates: [
      '中に庭園が見える。閉じ込められた鉱物が、苔や雲のよう。',
      '「庭の水晶」とも呼ばれる。',
      '同じ景色はふたつと無い。' ]},
    { biome: '2-2', id: 'pinkspinel', name: 'Pink Spinel', color: 'FF9EAF', candidates: [
      '桃色のスピネル。わずかなクロムが色をつけた。',
      '八面体の結晶。角がきれいにそろう。',
      '色が隅々まで均一に見える。光が一方向にしか曲がらないから。' ]},
    { biome: '2-2', id: 'whiteopal', name: 'White Opal', color: 'F8F4F0', candidates: [
      '乳白色の地に、色がふわりと浮かぶ。',
      'オパールは水を含んでいる。乾きすぎは禁物。',
      '並んだ小さな球が、光を虹に割っている。' ]},
    { biome: '2-2', id: 'hematite', name: 'Hematite', color: '5C5C5C', candidates: [
      '名前は「血」。削ると粉が赤い。',
      '磨くと鏡のように光る。見た目より重い。',
      '鉄のもと。赤い土の赤も、だいたいこの石。' ]},
    { biome: '2-2', id: 'fireopal', name: 'Fire Opal', color: 'FF5A00', candidates: [
      '橙から赤の地色。遊色が無くても宝石。',
      '火山の岩の隙間で育つ。',
      '透けるものは、灯りをともした小さな炉のよう。' ]},
    { biome: '2-2', id: 'herkimerquartz', name: 'Herkimer Quartz', color: 'E8F4F8', candidates: [
      '両端が尖った、磨かなくても宝石になる水晶。',
      '「ダイヤ」の愛称で呼ばれるが、中身は石英。',
      '岩の小さな空洞で、どこにも触れずに育った。' ]},
    { biome: '2-2', id: 'catseyesapphire', name: "Cat's Eye Sapphire", color: '1A4A8A', candidates: [
      '猫の目が光るサファイアは、きわめてまれ。',
      '針状の内包物が一方向にそろうと、光の筋が生まれる。',
      '星にならず、一本の筋になった。' ]},
    { biome: '2-2', id: 'greensapphire', name: 'Green Sapphire', color: '3CB371', candidates: [
      '緑は鉄の色。',
      '青と黄の薄い層が重なって、緑に見えているものもある。',
      '緑のサファイアは、長いあいだ別の石と間違われた。' ]},
    { biome: '2-2', id: 'rhodolite', name: 'Rhodolite', color: 'B03060', candidates: [
      '名前は「薔薇」。薔薇色のガーネット。',
      '二種類のガーネットの、ちょうど中間の石。',
      '紫がかった赤は、灯りの下でいちばん深くなる。' ]},
    { biome: '2-2', id: 'catseyetourmaline', name: "Cat's Eye Tourmaline", color: 'D4AF37', candidates: [
      '細い管が無数に並んで、光の筋を作る。',
      '猫の目は、緑や桃色のトルマリンに出やすい。',
      '筋の正体は針ではなく、空っぽの管。' ]},
    { biome: '2-2', id: 'rutilatedquartz', name: 'Rutilated Quartz', color: 'C8A951', candidates: [
      '金色の針が閉じ込められている。「女神の髪」とも。',
      '針の正体はチタンの鉱物。石英より先に育った。',
      '針が多いほど、人気が高い。' ]},
    { biome: '2-2', id: 'redberyl', name: 'Red Beryl', color: 'C71585', candidates: [
      'ベリルの中でいちばんまれ。ダイヤよりまれと言われる。',
      '赤はマンガン。結晶はとても小さい。',
      'エメラルドの、赤い遠い親戚。' ]},
    // ---- 3-1 WetLand ----
    { biome: '3-1', id: 'titanite', name: 'Titanite', color: 'C6A83E', candidates: [
      'チタンを含む。虹の輝きはダイヤより強い。',
      '柔らかいので、指輪にはしにくい。',
      '結晶がくさびの形をしている。' ]},
    { biome: '3-1', id: 'larimar', name: 'Larimar', color: '76C7D8', candidates: [
      '海の面のような、白と青の模様。',
      '火山の岩の空洞で育つ、青いペクトライト。',
      '1970年代に広まった、新しい宝石。' ]},
    { biome: '3-1', id: 'iolite', name: 'Iolite', color: '596AA8', candidates: [
      '名前は「菫色」。見る方向で青にも灰色にも変わる。',
      '昔の船乗りが、曇りの日に太陽の位置を探すのに使ったという。',
      '三方向で三つの色を見せる。' ]},
    { biome: '3-1', id: 'charoite', name: 'Charoite', color: '8659A4', candidates: [
      '紫の渦巻き模様。繊維が絡み合ってできている。',
      '1970年代に記載された、新しい鉱物。',
      '同じ模様はふたつと無い。' ]},
    { biome: '3-1', id: 'kunzite', name: 'Kunzite', color: 'D7A4C8', candidates: [
      '日の光で色があせる。「夕方の石」と呼ばれる。',
      '桃色はマンガン。暗い所にしまっておきたい宝石。',
      'ある宝石学者の名前をもらった。' ]},
    { biome: '3-1', id: 'tugtupite', name: 'Tugtupite', color: 'D85C7F', candidates: [
      '日に当てると色が濃くなり、暗い所で薄くなる。',
      '紫外線で赤く光る。',
      '名前は古い言葉で「トナカイの血」。' ]},
    { biome: '3-1', id: 'clinohumite', name: 'Clinohumite', color: 'D9822B', candidates: [
      '橙から黄の、宝石になるものはまれな鉱物。',
      '蜜のような色。小粒でよく光る。',
      'ある鉱物学者の名前をもらった。' ]},
    { biome: '3-1', id: 'alexandrite', name: 'Alexandrite', color: '4F8074', candidates: [
      '昼は緑、灯りの下では赤。「昼はエメラルド、夜はルビー」。',
      '色を変えるのはクロム。光の中身が違うと、返す色も違う。',
      '6月の誕生石。' ]},
    { biome: '3-1', id: 'hauyne', name: 'Hauyne', color: '237BC4', candidates: [
      '鮮やかな青。火山の岩の中で育つ。',
      '柔らかくてまれ。宝石にできる結晶は小さい。',
      'ある鉱物学者の名前をもらった。' ]},
    { biome: '3-1', id: 'benitoite', name: 'Benitoite', color: '254FA3', candidates: [
      '青い石なのに、紫外線を当てると青白く強く光る。',
      '三角形を基本にした、めったに無い結晶の形。',
      '虹の輝きはダイヤに迫る。' ]},
    { biome: '3-1', id: 'eudialyte', name: 'Eudialyte', color: 'A13F62', candidates: [
      '名前は「よく溶ける」。酸にあっけなく溶ける。',
      '赤から桃色。ごく微量の放射性元素を含む。',
      '宝石になるものはまれ。' ]},
    { biome: '3-1', id: 'pezzottaite', name: 'Pezzottaite', color: 'E43D8F', candidates: [
      '2003年に認められた、新しい宝石。',
      '「ラズベリル」とも呼ばれる、木苺色。',
      'ある鉱物学者の名前をもらった。' ]},
    { biome: '3-1', id: 'taaffeite', name: 'Taaffeite', color: '8D4BC1', candidates: [
      '磨かれた宝石から初めて見つかった鉱物。1945年のこと。',
      'それまでずっとスピネルと間違われていた。',
      'ある宝石学者の名前をもらった。' ]},
  ],
};
