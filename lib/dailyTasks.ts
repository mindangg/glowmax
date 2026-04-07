// Daily task definitions for the Hàng ngày tab
// Each task links to an InfoSection id for expandable educational content

export type DailyTask = {
  id: string;
  label: string;
  infoKey: string; // matches InfoSection.id in infoContent.ts
  infoSummary: string; // short context shown in expanded view
};

export type DailyCategory = {
  id: string;
  title: string;
  tasks: DailyTask[];
};

export const DAILY_CATEGORIES: DailyCategory[] = [
  {
    id: 'skincare',
    title: 'Chăm sóc da',
    tasks: [
      {
        id: 'skincare_coldwater',
        label: 'Rửa mặt bằng nước lạnh (buổi sáng)',
        infoKey: 'morningdebloat',
        infoSummary:
          'Nước lạnh kích thích tuần hoàn máu, co mạch và giảm sưng phù buổi sáng. Là bước đầu tiên của morning debloat.',
      },
      {
        id: 'skincare_moisturize',
        label: 'Dưỡng ẩm sau tắm',
        infoKey: 'hoatchat',
        infoSummary:
          'Moisturizer là nền tảng, không phải phụ. Da thiếu nước → cơ thể tăng tiết dầu → tăng nguy cơ tắc nghẽn. Thoa ngay sau tắm khi da còn ẩm để khóa nước.',
      },
      {
        id: 'skincare_sunscreen',
        label: 'Thoa kem chống nắng (SPF 30+)',
        infoKey: 'hoatchat',
        infoSummary:
          'Không sunscreen = mọi hoạt chất khác giảm hiệu quả. UV gây DNA damage, phá collagen, tăng melanin và làm chậm lành thương.',
      },
      {
        id: 'skincare_diet',
        label: 'Tránh đường và sữa hôm nay',
        infoKey: 'hoatchat',
        infoSummary:
          'Đường kích thích IGF-1 và insulin → tăng tiết sebum → tăng mụn. Sữa chứa hormone ảnh hưởng tuyến bã nhờn.',
      },
    ],
  },
  {
    id: 'dinhduong',
    title: 'Dinh dưỡng & Debloat',
    tasks: [
      {
        id: 'nuoc',
        label: 'Uống đủ 2L nước',
        infoKey: 'debloatfood',
        infoSummary:
          'Paradox: uống nhiều nước → ít giữ nước hơn. Khi thiếu nước, cơ thể giữ nước lại để bù → puffy. Uống đủ → giảm ADH → thận đào thải sodium tốt hơn.',
      },
      {
        id: 'sodium',
        label: 'Tránh thức ăn mặn sau 5 giờ chiều',
        infoKey: 'debloatfood',
        infoSummary:
          'Sodium cao buổi tối → cơ thể giữ nước qua đêm → sáng dậy mặt sưng nhiều hơn. Tránh mì gói, fast food, snack mặn, đồ đóng hộp.',
      },
      {
        id: 'carb_stable',
        label: 'Không đồ uống có gas hoặc carb cao đột ngột',
        infoKey: 'carb',
        infoSummary:
          '1g glycogen giữ 2.7–4g nước. Carb cao đột ngột → insulin spike → glycogen tăng → kéo nước vào → puffy. Giữ carb ổn định quan trọng hơn cắt carb hoàn toàn.',
      },
    ],
  },
  {
    id: 'tuthechapluyen',
    title: 'Tư thế & Luyện tập',
    tasks: [
      {
        id: 'posture_check',
        label: 'Kiểm tra và điều chỉnh tư thế trong ngày',
        infoKey: 'posture',
        infoSummary:
          'Forward head posture kéo mô mềm xuống, jawline mờ. Cổ thẳng, đầu cân bằng → jawline rõ hơn ngay lập tức. Vai mở, ngực thẳng → perceived frame tăng.',
      },
      {
        id: 'exercise_light',
        label: 'Vận động nhẹ ít nhất 15 phút',
        infoKey: 'morningdebloat',
        infoSummary:
          'Vận động tăng circulation, kích thích lymphatic drainage → fluid di chuyển ra khỏi vùng mặt. Đây là cách "xả nước cơ học" hiệu quả nhất.',
      },
      {
        id: 'photo_compare',
        label: 'Chụp ảnh side lighting để theo dõi tiến trình',
        infoKey: 'xuong',
        infoSummary:
          'Ánh sáng bên sẽ tạo shadow làm rõ jawline, cheekbone và cấu trúc mặt. Chụp cùng một góc và điều kiện sáng để so sánh chính xác theo thời gian.',
      },
    ],
  },
  {
    id: 'phuchoi',
    title: 'Phục hồi',
    tasks: [
      {
        id: 'sleep_7',
        label: 'Ngủ đủ 7+ tiếng',
        infoKey: 'giaclap',
        infoSummary:
          'Trong deep sleep: GH tiết mạnh nhất, collagen tái tạo, cortisol giảm xuống thấp nhất. Thiếu ngủ → quầng thâm, puffy face, da xỉn, tăng mụn.',
      },
      {
        id: 'no_screen',
        label: 'Không màn hình 30 phút trước khi ngủ',
        infoKey: 'giaclap',
        infoSummary:
          'Blue light từ màn hình ức chế melatonin, làm khó vào giấc và giảm chất lượng deep sleep. Không có deep sleep = ít GH = ít tái tạo da và cơ.',
      },
      {
        id: 'stress_low',
        label: 'Thực hành giảm stress hôm nay',
        infoKey: 'cortisol',
        infoSummary:
          'Cortisol mãn tính tăng sebum (mụn), phá collagen (lão hóa), gây water retention (puffy), ức chế GH và testosterone. Giảm cortisol = skincare tốt nhất không cần sản phẩm.',
      },
    ],
  },
];

// Total task count
export const TOTAL_DAILY_TASKS = DAILY_CATEGORIES.reduce(
  (acc, cat) => acc + cat.tasks.length,
  0
);
