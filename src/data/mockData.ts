import { TOCNode, Chunk, PageTextItem } from '../types/document';

export const mockTocNodes: Record<string, TOCNode> = {
  'root-1': {
    id: 'root-1',
    title: 'PHẦN 1: QUY ĐỊNH CHUNG',
    level: 1,
    children: ['node-1-1', 'node-1-2'],
    chunkIds: [],
    expanded: true
  },
  'node-1-1': {
    id: 'node-1-1',
    title: '1.1 Phạm vi điều chỉnh',
    level: 2,
    children: [],
    chunkIds: []
  },
  'node-1-2': {
    id: 'node-1-2',
    title: '1.2 Đối tượng áp dụng',
    level: 2,
    children: [],
    chunkIds: []
  },

  'root-2': {
    id: 'root-2',
    title: 'PHẦN 2: HƯỚNG DẪN CHẨN ĐOÁN VÀ XỬ TRÍ',
    level: 1,
    children: ['node-2-1', 'node-2-2', 'node-2-3'],
    chunkIds: [],
    expanded: true
  },
  'node-2-1': {
    id: 'node-2-1',
    title: '2.1 Tăng huyết áp',
    level: 2,
    children: [],
    chunkIds: ['chunk-1', 'chunk-2']
  },
  'node-2-2': {
    id: 'node-2-2',
    title: '2.2 Đái tháo đường',
    level: 2,
    children: [],
    chunkIds: ['chunk-3', 'chunk-4']
  },
  'node-2-3': {
    id: 'node-2-3',
    title: '2.3 Bệnh phổi tắc nghẽn mạn tính (COPD)',
    level: 2,
    children: [],
    chunkIds: ['chunk-5']
  },

  'root-3': {
    id: 'root-3',
    title: 'PHẦN 3: HƯỚNG DẪN ĐIỀU TRỊ',
    level: 1,
    children: ['node-3-1', 'node-3-2'],
    chunkIds: [],
    expanded: true
  },
  'node-3-1': {
    id: 'node-3-1',
    title: '3.1 Điều trị tăng huyết áp',
    level: 2,
    children: [],
    chunkIds: ['chunk-6', 'chunk-7']
  },
  'node-3-2': {
    id: 'node-3-2',
    title: '3.2 Điều trị đái tháo đường',
    level: 2,
    children: [],
    chunkIds: ['chunk-8']
  },

  'root-4': {
    id: 'root-4',
    title: 'PHẦN 4: PHỤ LỤC',
    level: 1,
    children: ['node-4-1', 'node-4-2'],
    chunkIds: [],
    expanded: false
  },
  'node-4-1': {
    id: 'node-4-1',
    title: '4.1 Biểu mẫu theo dõi',
    level: 2,
    children: [],
    chunkIds: ['chunk-9']
  },
  'node-4-2': {
    id: 'node-4-2',
    title: '4.2 Bảng tra cứu thuốc',
    level: 2,
    children: [],
    chunkIds: ['chunk-10']
  }
};

export const mockTocRootIds = ['root-1', 'root-2', 'root-3', 'root-4'];

export const mockChunks: Chunk[] = [
{
  id: 'chunk-1',
  title: 'Định nghĩa và phân loại tăng huyết áp',
  startChar: 1000,
  endChar: 1500,
  pageIndex: 2,
  relativeCharInPage: 50,
  content:
  'Tăng huyết áp là khi huyết áp tâm thu ≥ 140 mmHg và/hoặc huyết áp tâm trương ≥ 90 mmHg.\n\nPhân loại:\n- HA tối ưu: < 120/80 mmHg\n- HA bình thường: 120-129/80-84 mmHg\n- Tiền tăng huyết áp: 130-139/85-89 mmHg\n- THA độ 1: 140-159/90-99 mmHg\n- THA độ 2: ≥ 160/100 mmHg',
  mappingStatus: 'auto_mapped',
  matchSpans: [
  {
    pageIndex: 2,
    startItemIndex: 0,
    endItemIndex: 10,
    confidence: 0.96,
    bboxes: [{ x: 50, y: 100, w: 400, h: 120 }]
  }]

},
{
  id: 'chunk-2',
  title: 'Quy trình đo huyết áp',
  startChar: 1501,
  endChar: 2000,
  pageIndex: 3,
  relativeCharInPage: 10,
  content:
  '1. Người bệnh nghỉ ngơi yên tĩnh 5-10 phút trước khi đo.\n2. Không dùng chất kích thích (cà phê, hút thuốc) trước đó 2 giờ.\n3. Tư thế ngồi ghế tựa, cánh tay đặt ngang mức tim.\n4. Đo ít nhất 2 lần, cách nhau 1-2 phút.',
  mappingStatus: 'auto_mapped',
  matchSpans: [
  {
    pageIndex: 3,
    startItemIndex: 0,
    endItemIndex: 8,
    confidence: 0.94,
    bboxes: [{ x: 50, y: 150, w: 450, h: 100 }]
  }]

},
{
  id: 'chunk-3',
  title: 'Tiêu chuẩn chẩn đoán đái tháo đường',
  startChar: 2001,
  endChar: 2500,
  pageIndex: 4,
  relativeCharInPage: 0,
  content:
  'Chẩn đoán ĐTĐ dựa vào 1 trong 4 tiêu chuẩn:\n1. Glucose huyết tương lúc đói (FPG) ≥ 7,0 mmol/L (126 mg/dL).\n2. Glucose huyết tương ở thời điểm sau 2 giờ làm nghiệm pháp dung nạp glucose bằng đường uống ≥ 11,1 mmol/L (200 mg/dL).\n3. HbA1c ≥ 6,5%.\n4. Bệnh nhân có triệu chứng kinh điển của tăng glucose huyết và mức glucose huyết tương bất kỳ ≥ 11,1 mmol/L.',
  mappingStatus: 'fuzzy_mapped',
  matchSpans: [
  {
    pageIndex: 4,
    startItemIndex: 5,
    endItemIndex: 15,
    confidence: 0.78,
    bboxes: [{ x: 50, y: 80, w: 480, h: 150 }]
  }]

},
{
  id: 'chunk-4',
  title: 'Biến chứng đái tháo đường',
  startChar: 2501,
  endChar: 3000,
  pageIndex: 5,
  relativeCharInPage: 20,
  content:
  'Biến chứng cấp tính:\n- Hạ glucose huyết\n- Hôn mê nhiễm toan ceton\n- Hôn mê tăng áp lực thẩm thấu\n\nBiến chứng mạn tính:\n- Biến chứng mạch máu lớn: Bệnh mạch vành, đột quỵ, bệnh mạch máu ngoại vi.\n- Biến chứng mạch máu nhỏ: Bệnh võng mạc, bệnh thận, bệnh thần kinh.',
  mappingStatus: 'auto_mapped',
  matchSpans: [
  {
    pageIndex: 5,
    startItemIndex: 0,
    endItemIndex: 12,
    confidence: 0.91,
    bboxes: [{ x: 50, y: 200, w: 400, h: 160 }]
  }]

},
{
  id: 'chunk-5',
  title: 'Chẩn đoán COPD',
  startChar: 3001,
  endChar: 3500,
  pageIndex: 6,
  relativeCharInPage: 0,
  content:
  'Nghĩ đến COPD khi bệnh nhân có:\n- Ho kéo dài\n- Khạc đờm mạn tính\n- Khó thở tiến triển theo thời gian\n- Tiền sử tiếp xúc với các yếu tố nguy cơ (hút thuốc lá, khói bụi).\n\nTiêu chuẩn vàng: Đo chức năng hô hấp có rối loạn thông khí tắc nghẽn không hồi phục hoàn toàn (FEV1/FVC < 70% sau test phục hồi phế quản).',
  mappingStatus: 'needs_manual_review',
  matchSpans: [
  {
    pageIndex: 6,
    startItemIndex: 0,
    endItemIndex: 5,
    confidence: 0.45,
    bboxes: [{ x: 50, y: 100, w: 450, h: 180 }]
  }]

},
{
  id: 'chunk-6',
  title: 'Phác đồ điều trị tăng huyết áp',
  startChar: 3501,
  endChar: 4000,
  pageIndex: 7,
  relativeCharInPage: 0,
  content:
  'Mục tiêu: Đạt HA < 140/90 mmHg. Nếu có ĐTĐ hoặc bệnh thận mạn: < 130/80 mmHg.\n\nBiện pháp không dùng thuốc:\n- Giảm cân\n- Ăn nhạt (< 5g muối/ngày)\n- Tăng cường vận động thể lực\n- Hạn chế rượu bia, bỏ hút thuốc lá.',
  mappingStatus: 'auto_mapped',
  matchSpans: [
  {
    pageIndex: 7,
    startItemIndex: 0,
    endItemIndex: 8,
    confidence: 0.97,
    bboxes: [{ x: 50, y: 50, w: 450, h: 140 }]
  }]

},
{
  id: 'chunk-7',
  title: 'Thuốc điều trị tăng huyết áp',
  startChar: 4001,
  endChar: 4500,
  pageIndex: 7,
  relativeCharInPage: 500,
  content:
  'Các nhóm thuốc chính:\n1. Lợi tiểu (Thiazide)\n2. Chẹn kênh canxi (Amlodipine)\n3. Ức chế men chuyển (Enalapril, Captopril)\n4. Chẹn thụ thể Angiotensin II (Losartan)\n5. Chẹn beta giao cảm (Bisoprolol)',
  mappingStatus: 'user_bound',
  matchSpans: [
  {
    pageIndex: 7,
    startItemIndex: 10,
    endItemIndex: 20,
    confidence: 1.0,
    bboxes: [{ x: 50, y: 220, w: 400, h: 150 }]
  }]

},
{
  id: 'chunk-8',
  title: 'Điều trị đái tháo đường type 2',
  startChar: 4501,
  endChar: 5000,
  pageIndex: 8,
  relativeCharInPage: 0,
  content:
  'Mục tiêu HbA1c < 7%.\n\nLựa chọn thuốc bước 1:\n- Metformin là thuốc lựa chọn đầu tay trừ khi có chống chỉ định.\n- Liều khởi đầu: 500mg x 1-2 lần/ngày, tăng dần liều.\n\nNếu không đạt mục tiêu sau 3 tháng, phối hợp thêm Sulfonylurea (Gliclazide, Glimepiride) hoặc Insulin nền.',
  mappingStatus: 'fuzzy_mapped',
  matchSpans: [
  {
    pageIndex: 8,
    startItemIndex: 0,
    endItemIndex: 10,
    confidence: 0.82,
    bboxes: [{ x: 50, y: 100, w: 480, h: 160 }]
  }]

},
{
  id: 'chunk-9',
  title: 'Biểu mẫu theo dõi bệnh nhân',
  startChar: 5001,
  endChar: 5500,
  pageIndex: 9,
  relativeCharInPage: 0,
  content:
  '[BẢNG BIỂU MẪU THEO DÕI HUYẾT ÁP VÀ ĐƯỜNG HUYẾT TẠI NHÀ]\nNgày | Giờ | Huyết áp tâm thu | Huyết áp tâm trương | Nhịp tim | Đường huyết đói | Ghi chú\n... | ... | ... | ... | ... | ... | ...',
  mappingStatus: 'auto_mapped',
  matchSpans: [
  {
    pageIndex: 9,
    startItemIndex: 0,
    endItemIndex: 5,
    confidence: 0.93,
    bboxes: [{ x: 50, y: 50, w: 500, h: 200 }]
  }]

},
{
  id: 'chunk-10',
  title: 'Bảng tra cứu liều thuốc',
  startChar: 5501,
  endChar: 6000,
  pageIndex: 10,
  relativeCharInPage: 0,
  content:
  'Amlodipine: 5-10mg/ngày\nEnalapril: 5-20mg/ngày\nLosartan: 50-100mg/ngày\nMetformin: 500-2000mg/ngày\nGliclazide MR: 30-120mg/ngày',
  mappingStatus: 'needs_manual_review',
  matchSpans: [
  {
    pageIndex: 10,
    startItemIndex: 0,
    endItemIndex: 5,
    confidence: 0.52,
    bboxes: [{ x: 50, y: 100, w: 300, h: 150 }]
  }]

}];


// Generate mock page text items to simulate PDF rendering
export const mockPages: Record<number, PageTextItem> = {};
for (let i = 1; i <= 10; i++) {
  const chunksOnPage = mockChunks.filter((c) => c.pageIndex === i);
  const items: any[] = [];

  chunksOnPage.forEach((chunk, idx) => {
    // Create a simulated text item for the chunk title
    items.push({
      itemIndex: idx * 2,
      str: chunk.title,
      x: chunk.matchSpans[0]?.bboxes[0]?.x || 50,
      y: chunk.matchSpans[0]?.bboxes[0]?.y || 100,
      width: 400,
      height: 20,
      charStart: chunk.startChar,
      charEnd: chunk.startChar + chunk.title.length
    });

    // Create a simulated text item for the chunk content (truncated for visual)
    items.push({
      itemIndex: idx * 2 + 1,
      str: chunk.content.substring(0, 100) + '...',
      x: chunk.matchSpans[0]?.bboxes[0]?.x || 50,
      y: (chunk.matchSpans[0]?.bboxes[0]?.y || 100) + 30,
      width: 450,
      height: 60,
      charStart: chunk.startChar + chunk.title.length + 1,
      charEnd: chunk.endChar
    });
  });

  mockPages[i] = {
    pageIndex: i,
    items,
    pageText: chunksOnPage.map((c) => c.content).join('\n')
  };
}