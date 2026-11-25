/* ==========================================================================
   Cozy Garden — Shared Configuration & Constants (js/config/constants.js)
   3 Full 3D Isometric Dioramas: Sakura Garden, Cozy Room, Corner Cafe
   ========================================================================== */

(function () {
  const CozyGarden = (window.CozyGarden = window.CozyGarden || {});

  CozyGarden.STORAGE_KEYS = {
    TASKS: 'cozy_lofi_top3_tasks_v1',
    DUMP: 'cozy_lofi_brain_dump_v1',
    MIXER: 'cozy_lofi_sound_mixer_v1',
    SCENE: 'cozy_lofi_scene_theme_v2',
    ISLAND: 'cozy_lofi_island_meta_v2',
  };

  CozyGarden.SCENE_ORDER = ['sakura', 'room', 'cafe'];

  CozyGarden.SCENE_CLEAR_LABELS = {
    sakura: 'Gió xuân',
    room: 'Đêm ấm',
    cafe: 'Chiều cà phê',
  };

  CozyGarden.WEATHER_LABELS = ['Quang đãng', 'Mưa nhẹ', 'Mưa nặng hạt'];

  CozyGarden.OUTFITS_3D = [
    { main: 0xf2a530, accent: 0xffe08a },
    { main: 0x7ea684, accent: 0xf5e8d0 },
    { main: 0xebb0a8, accent: 0xf7efe8 },
    { main: 0xbdaee0, accent: 0x73daca },
  ];

  CozyGarden.AVATAR_OPTIONS = {
    shirts: [
      { id: 'shirt', label: '👔 Sơ mi cà vạt', color: 0xf7f8fc, accent: 0x3b6068 },
      { id: 'vest', label: '🧥 Áo Vest', color: 0x2e364d, accent: 0xd9a85b },
      { id: 'tshirt', label: '👕 Áo Thun', color: 0xf4b6c2, accent: 0xffffff },
      { id: 'sweater', label: '🧶 Áo Len', color: 0xe6a85c, accent: 0xfff0d6 },
    ],
    pants: [
      { id: 'slacks', label: '👖 Quần Tây', color: 0x2d3142, tight: 0x2d3142 },
      { id: 'shorts', label: '🩳 Quần Short', color: 0x4a5d52, tight: 0xfff1e8 },
      { id: 'skirt', label: '👗 Váy Xếp Ly', color: 0x3a3748, tight: 0x2a2a30 },
      { id: 'jeans', label: '👖 Quần Jean', color: 0x385885, tight: 0x385885 },
    ],
    hairs: [
      { label: '🌿 Xanh bạc hà', color: 0x6ba680, highlight: 0x9fd4b0, tip: 0x4d8260 },
      { label: '💙 Xanh đêm', color: 0x4b6aa8, highlight: 0x7c9ce0, tip: 0x314878 },
      { label: '🤎 Nâu hạt dẻ', color: 0x7a4e36, highlight: 0xad785a, tip: 0x52311f },
      { label: '💛 Vàng mật', color: 0xe0b25c, highlight: 0xf7d894, tip: 0xb58536 },
    ],
    hats: [
      { id: 0, label: '👓 Kính anime' },
      { id: 1, label: '🎧 Tai nghe' },
      { id: 2, label: '🧶 Mũ len' },
      { id: 3, label: '🧢 Lưỡi trai' },
    ],
  };

  CozyGarden.DEFAULT_AVATAR = {
    gender: 'female', // 'female' | 'male'
    shirt: 0,
    pants: 2, // Pleated skirt default for female
    hair: 0,
    hat: 0,
  };

  CozyGarden.PET_LABELS = {
    cat: 'Mèo đồng hành',
    corgi: 'Cún Corgi đồng hành',
    fox: 'Cáo nhỏ đồng hành',
    duck: 'Vịt con đồng hành',
  };

  CozyGarden.DIORAMA_THEMES = {
    sakura: {
      clearLabel: 'Gió xuân',
      backdrop: 0xb08991,
      ambientSky: 0xffe4ec,
      ambientGround: 0x75525c,
      ambientInt: 0.96,
      sunColor: 0xffe4c4,
      sunInt: 1.32,
      sunPos: [-7.2, 11.5, 6.2],
      particleColor: 0xffc7dc,
      particleType: 'petal',
    },
    room: {
      clearLabel: 'Đêm ấm',
      backdrop: 0x352c40,
      ambientSky: 0xd4c2f0,
      ambientGround: 0x2e2436,
      ambientInt: 0.82,
      sunColor: 0xffd1a3,
      sunInt: 1.05,
      sunPos: [-6.5, 10.5, 5.5],
      particleColor: 0xffe6a8,
      particleType: 'sparkle',
    },
    cafe: {
      clearLabel: 'Chiều cà phê',
      backdrop: 0x876758,
      ambientSky: 0xffe4c7,
      ambientGround: 0x543c32,
      ambientInt: 0.92,
      sunColor: 0xffd8a3,
      sunInt: 1.28,
      sunPos: [-7.0, 11.0, 6.0],
      particleColor: 0xffe8ba,
      particleType: 'sparkle',
    },
  };

  // Tailored 12-level progression unlocks for EACH diorama!
  CozyGarden.SCENE_UNLOCK_NAMES = {
    sakura: [
      '🌼 Khóm hoa dại',
      '🍄 Nấm phát sáng',
      '🪵 Xích đu anh đào',
      '🔥 Lửa trại bờ cỏ',
      '🐦 Chim đậu biển gỗ',
      '✨ Dây đèn lấp lánh',
      '🐟 Cá koi nhảy mặt hồ',
      '🐾 Bạn thú mini',
      '🗼 Hải đăng chiếu sáng',
      '🏡 Giàn gỗ hoa anh đào',
      '🏮 Đèn lồng bay quanh vườn',
      '🎈 Khinh khí cầu bay',
    ],
    room: [
      '🪴 Chậu cây góc phòng',
      '✨ Dây đèn fairy lights',
      '🧸 Gấu bông trên giường',
      '🖼️ Tranh treo tường',
      '📚 Giá sách đầy màu',
      '🎵 Máy đĩa than Vinyl',
      '🐠 Bể cá mini phát sáng',
      '🐾 Bạn thú mini trên thảm',
      '🌿 Giàn cây leo treo tường',
      '🌙 Rèm đèn sao cửa sổ',
      '🌌 Đèn chiếu tinh vân',
      '🔮 Quả cầu pha lê bay',
    ],
    cafe: [
      '🪴 Chậu Monstera góc quán',
      '📋 Bảng menu phấn',
      '🫖 Kệ bình Pour-over',
      '🥐 Khay bánh Croissant',
      '💡 Dây đèn Edison ấm',
      '📻 Loa gỗ nhạc Lofi',
      '🌿 Bồn cây thảo mộc',
      '🐾 Bạn thú mini góc quán',
      '⚙️ Máy rang cà phê đồng',
      '🏮 Đèn lồng treo hiên',
      '✨ Đèn đom đóm quanh quán',
      '☕ Biển hiệu Lofi Cafe sáng',
    ],
  };

  CozyGarden.COOP_SCENES = {
    coop_library: {
      id: 'coop_library',
      name: 'Thư viện chung',
      icon: '📚',
      desc: 'Bàn gỗ dài 4 chỗ, đèn banker xanh & kệ sách yên tĩnh',
      backdrop: 0x3b2c2a,
      ambientSky: 0xffe4c4,
      ambientGround: 0x3b2824,
      ambientInt: 0.85,
      sunColor: 0xffd59e,
      sunInt: 1.15,
      sunPos: [-6.5, 11, 5.5],
      particleColor: 0xffe6a8,
      particleType: 'sparkle',
    },
    coop_cafe: {
      id: 'coop_cafe',
      name: 'Quán cà phê chung',
      icon: '☕',
      desc: 'Quầy cà phê ấm cúng với bàn chung 4 người & đèn Edison',
      backdrop: 0x826253,
      ambientSky: 0xffe4c7,
      ambientGround: 0x543c32,
      ambientInt: 0.92,
      sunColor: 0xffd8a3,
      sunInt: 1.25,
      sunPos: [-7.0, 11, 6.0],
      particleColor: 0xffe8ba,
      particleType: 'sparkle',
    },
    coop_beach: {
      id: 'coop_beach',
      name: 'Chill Bãi biển',
      icon: '🏖️',
      desc: 'Sàn gỗ ven biển, rặng dừa, sóng xanh & 4 ghế chill ngắm biển',
      backdrop: 0x6f9fb8,
      ambientSky: 0xdcf4ff,
      ambientGround: 0x9c8265,
      ambientInt: 1.0,
      sunColor: 0xffe8b5,
      sunInt: 1.4,
      sunPos: [-7.5, 12, 6.5],
      particleColor: 0xfff5cc,
      particleType: 'sparkle',
    },
  };

  CozyGarden.COOP_REACTIONS = [
    { emoji: '👏', text: 'Tuyệt vời!' },
    { emoji: '🔥', text: 'Đang cháy hết mình!' },
    { emoji: '☕', text: 'Nhâm nhi chút nào' },
    { emoji: '💧', text: 'Nhớ uống nước nha!' },
    { emoji: '✨', text: 'Cố lên nhé!' },
  ];

  CozyGarden.BOTTLE_MESSAGES = [
    'Uống một ngụm nước mát nhé — não bộ của bạn sẽ biết ơn lắm đó!',
    'Thử thả lỏng hai vai xuống và mở nhẹ khớp hàm ra một chút nào.',
    'Không cần hoàn hảo ngay lập tức — chỉ cần làm xong bước nhỏ tiếp theo thôi.',
    'Hít sâu 4 giây, giữ 4 giây, thở ra thật chậm 4 giây. Bạn đang làm rất tốt!',
    'Nếu một ý tưởng khác chợt lóe lên, cứ thả vào Brain Dump rồi quay lại sau nhé.',
    'Bắt đầu được 5 phút đã là chiến thắng lớn nhất trước sự trì hoãn rồi!',
    'Đừng quên chớp mắt và nhìn ra xa khoảng 10 giây để mắt đỡ mỏi nhé.',
    'Mỗi việc nhỏ bạn hoàn thành hôm nay đều giúp không gian này rực rỡ hơn một chút ✨',
    'Làm dở một chút vẫn tốt hơn gấp trăm lần so với không bắt đầu. Cứ viết nháp đi!',
    'Lưng bạn có đang hơi gù không? Duỗi thẳng nhẹ một cái rồi ngồi thoải mái lại nhé.',
    'Khi đầu óc quá tải, chỉ cần chọn ĐÚNG 1 việc nhỏ mất dưới 2 phút để làm trước.',
    'Không sao cả nếu hôm nay bạn làm chậm hơn hôm qua — nhịp điệu riêng của bạn là đủ rồi.',
    'Tạm đặt điện thoại úp xuống hoặc xa tầm với một cánh tay — không gian này sẽ giữ nhịp giúp bạn.',
    'Bạn không hề lười; não bộ ADHD chỉ cần một bước khởi động thật nhỏ và thật êm thôi.',
    'Đứng dậy vươn hai tay lên trần nhà 5 giây nào — máu lưu thông sẽ giúp bạn tỉnh táo hơn hẳn!',
    'Đừng cố làm xong cả ngọn núi hôm nay, chỉ cần đặt viên gạch tiếp theo thật gọn gàng.',
    'Nếu thấy bồn chồn, thử tăng nhẹ tiếng mưa hoặc nhạc Lofi lên một nấc xem sao nhé.',
    'Bạn có nhớ lần gần nhất mình ăn nhẹ hoặc nghỉ mắt không? Nhớ chăm bản thân nha.',
    'Mất tập trung một chút không có nghĩa là hỏng cả ngày — chỉ cần nhẹ nhàng quay lại là được.',
    'Thử chia việc đang làm thành 1 câu thật ngắn: "Mở file và viết đúng 3 dòng đầu tiên".',
    'Bật Zen Mode (phím Z) nếu bạn thấy quá nhiều chữ trên màn hình làm rối mắt nhé.',
    'Hãy tự khen mình một câu vì hôm nay bạn đã mở góc làm việc này lên và cố gắng.',
    'Thả lỏng các ngón tay, xoay nhẹ cổ tay vài vòng trước khi tiếp tục gõ phím nhé.',
    'Đôi khi nghỉ đủ 5 phút cùng nhân vật lại giúp bạn xong việc nhanh gấp đôi.',
    'Nếu một việc khiến bạn ngán quá, thử bấm "5p Bắt đầu" và tự nhủ: hết 5 phút nghỉ cũng được!',
    'Nhớ rằng tiến bộ nhỏ mỗi ngày cộng dồn lại sẽ biến góc nhỏ này thành cả một kỳ quan.',
    'Thở ra một hơi thật dài... Mọi thứ không cần phải giải quyết hết trong một giờ này đâu.',
    'Chú thú cưng đang lon ton chơi quanh bạn — bạn không hề cô đơn trong phiên làm việc này 🐾',
  ];
})();
