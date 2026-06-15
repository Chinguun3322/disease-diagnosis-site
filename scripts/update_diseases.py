import json
from pathlib import Path

path = Path(__file__).resolve().parent.parent / 'data' / 'diseases.json'

with path.open('r', encoding='utf-8') as f:
    diseases = json.load(f)

advice_map = {
    'Vertigo / Dizziness': 'Сууж эсвэл хэвтэж амар. Илүү муудахгүй бол ус сайн ууж, өндөрт гарахгүй бай.',
    'Tension Headache': 'Булчинг тайвшруулж, бүлээн жин тавьж, нүдний ачааллыг багасган амар.',
    'Tinnitus': 'Стрессийг бууруулж, чихний эргэн тойронд чимээг багасга. Хэрвээ шуугиан их байвал эмчид үзүүл.',
    'Dry Mouth / Dry Tongue': 'Шингэн сайн ууж, давс багатай хоол хэрэглэн, хэт хуурай орчинд удаан хугацаагаар бүү бай.',
    'Blurred Vision': 'Нүд амрааж, гэрлийг зөөлрүүлж, дэлгэц удаан хугацаагаар харахгүй бай.',
    'Neuralgic Toothache': 'Халуун бүлээн жин тавьж, хэт хүчтэй хоолноос зайлсхий. Хэрвээ өвчин тасралтгүй байвал шүдний эмчид ханда.',
    'Fatigue Syndrome': 'Их унтаж, шингэн сайн ууж, хөнгөн дасгал хий. Стрессийг багасгавал дээр.',
    'Chest Tightness / Congestion': 'Амьсгалын замыг цэвэр байлгаж, хэт их хөдөлгөөнөөс зайлсхий. Хэрвээ толгойд өвдөж байвал эмчид ханда.',
    'Heart Palpitations': 'Тайван орчинд амар, кофейн болон давстай хоол хязгаарла. Хэрвээ хүндээр дэлсэж байвал эмчид ханд.',
    'Gastric Bloating': 'Хоол бага багаар идэж, шингэн сайн ууснаар давсгал чулууг багасга. Хэт их өтгөнийг бүү ид.',
    'Chronic Phlegm Disorder': 'Бүлээн шингэн ууж, ханиалгахдаа усыг уух. Хэрвээ удаан үргэлжилбэл эмчид ханд.',
    'Chronic Bile Disorder (Jaundice)': 'Шар өнгө нэмэгдэж байвал хэт өөхтэй хоолноос зайлсхийж, эмчийн зөвлөгөө ава.',
    'Chronic Kidney Disease': 'Давсны хэрэглээг хязгаарлаж, шингэнээ тэнцвэртэй ууж, хавангийн шинж тэмдгийг хяна.',
    'Chronic Lung Disease': 'Агаарт гарах, тоос болон утаа багатай орчинд байх, амьсгалын дасгал хийх.',
    'Chronic Arthritis / Rheumatism': 'Өвдсөн хэсгийг амрааж, бүлээн жин тавьж, хөнгөн хөдөлгөөн хий. Халуун, чийглэг орчноос зайлсхий.',
    'Dry Heaving / Retching': 'Хоол бага багаар идэж, шингэн сайн ууж, хүчтэй хөдөлгөөнөөс зайлсхий.',
    'Stomach Rumbling (Borborygmi)': 'Хоолны дэглэмээ зөв зохион байгуулж, хэт түргэн идэхгүй бай. Шингэн агааргүй хоолноос зайлсхий.',
    'Talkativeness / Loquacity': 'Түр зуурын их яриа, стрессийг багасгаж, амар амгалан орчинд байх.',
    'Wandering Joint Pain (Acute)': 'Өвдсөн хэсгийг амрааж, хэт хүчтэй хөдөлгөөнөөс сэргийл. Хэрвээ өвчин нэмэгдвэл эмчид ханд.',
    'Lower Back Stiffness': 'Товчлууруудыг сунгах, нуруугаа амрааж, удаан хугацаагаар суухгүй байх.',
    'Chills / Shivering': 'Биеийг дулаан байлгаж, бүлээн ундаа уух. Хэт их хүйтэнд бүү удаан бай.',
    'Insomnia': 'Унтлагын дэглэм барьж, дэлгэцийн гэрлийг багасгаж, унтахын өмнө тайван байх.',
    'Anxiety and Panic': 'Амьсгалын дасгал хийж, тайван орчинд амарч, шаардлагатай бол мэргэжлийн тусламж ава.',
    'Chronic Infectious Fever': 'Шингэн сайн ууж, халуунтай үед агааржуулалттай орчинд амар. Эмчид заавал ханда.',
    'Lymphatic System Disorder': 'Хаванг яаралгүй тайвшруулж, шингэн сайн ууж, шаардлагатай бол эмчтэй зөвлөлдө.',
    'Chronic Ulcers / Non-healing Wounds': 'Шархыг цэвэрхэн байлгаж, хэт их хөдөлгөөнөөс зайлсхий. Эмчийн заавраар арчил.',
    'Tumor / Neoplasm': 'Илэрсэн шинж тэмдэг нэмэгдвэл эмчид хандаж, урьдчилан үзлэг хийлгэх.',
    'Recurrent Chronic Illness': 'Давтагдсан өвчин удаан үргэлжилбэл биеэ амрааж, эмчээс зөвлөгөө ава.',
    'Chronic Fatigue Syndrome': 'Их унтаж, бага стресстэй, шингэн сайн ууж, хооллолтоо хэвийн барь.'
}

display_map = {
    'Vertigo / Dizziness': 'Толгой эргэх',
    'Tension Headache': 'Ядарсан толгойн өвчин',
    'Tinnitus': 'Чих шуугих',
    'Dry Mouth / Dry Tongue': 'Хуурай ам / хэл',
    'Blurred Vision': 'Хараа бүдэгших',
    'Neuralgic Toothache': 'Шүд өвдөх',
    'Fatigue Syndrome': 'Ядралтын хамшинж',
    'Chest Tightness / Congestion': 'Цээж шахагдах',
    'Heart Palpitations': 'Зүрх дэлсэх',
    'Gastric Bloating': 'Ходоод хавагнах',
    'Chronic Phlegm Disorder': 'Бүрэлзэх цэртэй өвчин',
    'Chronic Bile Disorder (Jaundice)': 'Шар өнгөтэй шарлалт',
    'Chronic Kidney Disease': 'Бөөрний архаг өвчин',
    'Chronic Lung Disease': 'Уушгины архаг өвчин',
    'Chronic Arthritis / Rheumatism': 'Үений архаг үрэвсэл',
    'Dry Heaving / Retching': 'Хуурай бөөлжих',
    'Stomach Rumbling (Borborygmi)': 'Хэвлийн дүнгэнэх',
    'Talkativeness / Loquacity': 'Их ярих шинж',
    'Wandering Joint Pain (Acute)': 'Явах үеийн үе мөчний өвчин',
    'Lower Back Stiffness': 'Доод нуруу хөших',
    'Chills / Shivering': 'Хүйт шалгах',
    'Insomnia': 'Нойргүйдэл',
    'Anxiety and Panic': 'Санаа зовох, айдас',
    'Chronic Infectious Fever': 'Архаг халуурал',
    'Lymphatic System Disorder': 'Лимфийн тогтолцооны эмгэг',
    'Chronic Ulcers / Non-healing Wounds': 'Шарх эдгэхгүй байх',
    'Tumor / Neoplasm': 'Өсөлт / Мэс заслын асуудал',
    'Recurrent Chronic Illness': 'Давтагдсан архаг өвчин',
    'Chronic Fatigue Syndrome': 'Архаг ядралт'
}

new_entries = [
    {
        'name': 'Acute Pharyngitis',
        'displayName': 'Амны хөндийн үрэвсэл',
        'category': 'Easily Contracted',
        'description': 'Хоолой өвдөж, зайлж байхдаа халуун уу, ханиадтай холбоотой байж болно.',
        'keywords': ['sore throat', 'pharyngitis', 'throat pain', 'hoarseness'],
        'ageRange': 'all',
        'gender': 'all',
        'advice': 'Хоолойн үрэвсэл мэдрэгдвэл бүлээн шингэн ууж, хэт хүйтэн хоолноос зайлсхий. Хэрвээ ханиалгах, халуун их байвал эмчид ханда.'
    },
    {
        'name': 'Sinusitis',
        'displayName': 'Духны хөндийн үрэвсэл',
        'category': 'Easily Contracted',
        'description': 'Духны өвчин, даралт ихсэх, нүд чилэх шинжтэй өвчин.',
        'keywords': ['sinusitis', 'sinus pain', 'facial pressure', 'nasal congestion'],
        'ageRange': 'all',
        'gender': 'all',
        'advice': 'Дух янгинаж байвал бүлээн усаар зайлж, амьсгалын замыг тайвшруул. Эмийн зөвлөгөө аваарай.'
    },
    {
        'name': 'Migraines',
        'displayName': 'Мигрень',
        'category': 'Easily Contracted',
        'description': 'Гүн гүнзгий толгойн өвчин, гэрэлд мэдрэмтгий байдалтай.',
        'keywords': ['migraine', 'headache', 'light sensitivity', 'aura'],
        'ageRange': 'adult',
        'gender': 'all',
        'advice': 'Гэрэл зөөлөн орчинд амарч, кофеин ба элсэн чихэр багатай хоол хэрэглэ. Хэрвээ байнга давтагдвал эмчид үзүүл.'
    }
]

for disease in diseases:
    disease['displayName'] = display_map.get(disease['name'], disease['name'])
    if 'advice' not in disease:
        disease['advice'] = advice_map.get(disease['name'], 'Шинж тэмдэг удаан үргэлжилбэл эмчид хандаж, амарч, шингэн сайн уух нь зүйтэй.')

existing_names = {d['name'] for d in diseases}
for new_disease in new_entries:
    if new_disease['name'] not in existing_names:
        diseases.append(new_disease)

with path.open('w', encoding='utf-8') as f:
    json.dump(diseases, f, ensure_ascii=False, indent=2)

print(f'Updated {{len(diseases)}} diseases in {path}')
