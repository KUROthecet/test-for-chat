import os
import asyncio
import psycopg2
from typing import TypedDict, List, Dict
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, START, END
from sentence_transformers import SentenceTransformer

# --- 1. SETUP API, MODEL & DATABASE ---
os.environ["GOOGLE_API_KEY"] = "AIzaSyDSufnNmKVxl-xR_OLhcN2qGV7NcPweYiA"
# Dùng mô hình Flash cho tốc độ nhanh, vì chúng ta sẽ gọi nhiều LLM
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)

print("⏳ Đang tải mô hình Embedding...")
embed_model = SentenceTransformer('all-MiniLM-L6-v2')


def get_db_connection():
    return psycopg2.connect(
        host="outujup0xz.r5wzb3pfqz.tsdb.cloud.timescale.com",
        port=38250,
        dbname="tsdb",
        user="tsdbadmin",
        password="Taodangdiboi1912@@"
    )


# --- 2. ĐỊNH NGHĨA STATE CHO MULTI-AGENT ---
class RouterState(TypedDict):
    query: str
    analyzed_specialties: list
    hypothetical_document: str
    specialty_contexts: Dict[str, str]  # Lưu riêng tài liệu của từng khoa
    specialty_reports: Dict[str, str]  # Lưu riêng báo cáo do từng LLM chuyên khoa viết
    response: str


class SpecialtyDetail(BaseModel):
    name: str = Field(description="Tên chuyên khoa: 'tim_mach', 'ho_hap', 'tieu_hoa', 'than_kinh', 'xuong_khop'.")
    is_core_issue: bool = Field(description="Đánh dấu True nếu là vấn đề cấp cứu hoặc cốt lõi.")


class RouteDecision(BaseModel):
    analyzed_specialties: List[SpecialtyDetail] = Field(description="Danh sách các khoa liên quan.")
    hypothetical_document: str = Field(description="Đoạn văn HyDE tóm tắt triệu chứng.")


# --- 3. CÁC NÚT (NODES) ĐA ĐẶC VỤ ---

def router_node_llm(state: RouterState):
    """LLM phân tuyến và gán nhãn"""
    query = state["query"]
    structured_llm = llm.with_structured_output(RouteDecision)

    prompt = f"Phân tích triệu chứng, chọn chuyên khoa và viết HyDE.\nTriệu chứng: {query}"
    decision = structured_llm.invoke(prompt)

    valid_specs = ["tim_mach", "ho_hap", "tieu_hoa", "than_kinh", "xuong_khop"]
    filtered_specs = [{"name": s.name, "is_core_issue": s.is_core_issue} for s in decision.analyzed_specialties if
                      s.name in valid_specs]

    print(f"🧭 [Phân tuyến]: Chuyển bệnh án tới các khoa -> {[s['name'] for s in filtered_specs]}")
    return {"analyzed_specialties": filtered_specs, "hypothetical_document": decision.hypothetical_document}


async def retrieve_node(state: RouterState):
    """Lấy tài liệu từ Database song song (Async) cho nhiều khoa cùng lúc"""
    hyde_text = state["hypothetical_document"]
    specialties_data = state["analyzed_specialties"]

    print(f"🔍 [Tra cứu DB]: Đang mở kết nối song song tìm kiếm {len(specialties_data)} khoa...")
    query_vec = embed_model.encode(hyde_text).tolist()

    # 1. Hàm công nhân (Worker): Chạy độc lập cho MỖI chuyên khoa
    def fetch_from_db(spec_item):
        spec_name = spec_item["name"]
        chunk_limit = 4 if spec_item["is_core_issue"] else 2

        try:
            # QUAN TRỌNG: Mở kết nối RIÊNG BIỆT cho luồng này để tránh đụng độ
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("""
                SELECT d.title, d.source, c.content 
                FROM document_chunks c JOIN medical_documents d ON c.document_id = d.id
                WHERE d.specialty = %s ORDER BY c.embedding <=> %s::vector LIMIT %s;
            """, (spec_name, query_vec, chunk_limit))

            results = cursor.fetchall()

            # Làm xong thì đóng kết nối của luồng này lại
            cursor.close()
            conn.close()

            if results:
                chunks = [f"📌 Nguồn: {row[0]}\n📝 Nội dung: {row[2]}" for row in results]
                return spec_name, "\n\n".join(chunks)
            else:
                return spec_name, "Không tìm thấy dữ liệu."

        except Exception as e:
            print(f"❌ Lỗi DB ở khoa {spec_name}: {e}")
            return spec_name, "Hệ thống tra cứu đang gặp sự cố."

    # 2. Đóng gói các nhiệm vụ tìm kiếm vào các Luồng (Threads) riêng biệt
    # asyncio.to_thread giúp ép thư viện đồng bộ (psycopg2) chạy được ở chế độ bất đồng bộ
    tasks = [asyncio.to_thread(fetch_from_db, spec) for spec in specialties_data]

    # 3. Phóng tất cả các luồng vào Database CÙNG LÚC và đợi kết quả
    if tasks:
        results = await asyncio.gather(*tasks)
    else:
        results = []

    # 4. Gom dữ liệu lại thành một cuốn từ điển như cũ
    specialty_contexts = {name: context for name, context in results}

    return {"specialty_contexts": specialty_contexts}


async def specialty_experts_node(state: RouterState):
    """Nhiều LLM ĐỒNG THỜI (Async): Các bác sĩ hội chẩn và TỰ NHẬN THỨC vai trò Chính/Phụ"""
    query = state["query"]
    contexts = state["specialty_contexts"]

    # 1. Lấy danh sách phân cấp từ Router để biết ai là Chính, ai là Phụ
    analyzed_specialties = state.get("analyzed_specialties", [])
    core_map = {spec["name"]: spec["is_core_issue"] for spec in analyzed_specialties}

    # 2. Hàm công nhân: Xử lý cho từng khoa
    async def generate_single_report(spec_name, context):
        is_core = core_map.get(spec_name, False)

        if is_core:
            print(f"👨‍⚕️ [Bác sĩ {spec_name.upper()}]: Nhận ca BỆNH CHÍNH -> Đang viết báo cáo chi tiết...")
            role_awareness = "🔴 ĐÂY LÀ VẤN ĐỀ CHÍNH VÀ CẤP BÁCH CỦA BỆNH NHÂN. Hãy phân tích thật sâu, chi tiết phác đồ, và đưa ra cảnh báo khẩn cấp (nếu tài liệu yêu cầu)."
        else:
            print(f"👨‍⚕️ [Bác sĩ {spec_name.upper()}]: Nhận ca BỆNH PHỤ -> Đang viết tóm tắt...")
            role_awareness = "⚪ đây chỉ là triệu chứng phụ đi kèm. Hãy viết báo cáo THẬT NGẮN GỌN (1-2 câu), đủ để bệnh nhân yên tâm, tuyệt đối không viết dài làm lu mờ vấn đề chính."

        # Bơm "Ý thức" này vào Prompt
        prompt = f"""Bạn là Bác sĩ chuyên khoa {spec_name.upper()}. 
        {role_awareness}

        Hãy giải quyết các triệu chứng của bệnh nhân CHỈ DỰA TRÊN TÀI LIỆU CỦA KHOA BẠN. Bỏ qua các triệu chứng không thuộc chuyên khoa của bạn.

        TÀI LIỆU KHOA {spec_name.upper()}:
        {context}

        BỆNH NHÂN KHAI: {query}
        """

        res = await llm.ainvoke(prompt)
        return spec_name, res.content

    tasks = [generate_single_report(name, ctx) for name, ctx in contexts.items()]

    if tasks:
        results = await asyncio.gather(*tasks)
    else:
        results = []

    reports = {spec_name: content for spec_name, content in results}

    return {"specialty_reports": reports}


def chief_doctor_node(state: RouterState):
    """LLM Trưởng khoa: Tổng hợp báo cáo và phân cấp ưu tiên Chính/Phụ"""
    query = state["query"]
    reports = state.get("specialty_reports", {})

    # 1. Lấy danh sách phân cấp Chính/Phụ từ Router truyền xuống
    analyzed_specialties = state.get("analyzed_specialties", [])

    if not reports:
        return {"response": "Xin lỗi, tôi không tìm thấy thông tin phù hợp cho tình trạng của bạn."}

    print(f"🏥 [Bác sĩ Trưởng khoa]: Đang tổng hợp {len(reports)} báo cáo (có phân cấp Chính/Phụ)...")

    # 2. Tạo một cuốn từ điển nhỏ để tra cứu nhanh xem khoa nào là Chính (True), khoa nào là Phụ (False)
    core_issue_map = {spec["name"]: spec["is_core_issue"] for spec in analyzed_specialties}

    # 3. Gom tất cả báo cáo và GẮN NHÃN TRỰC TIẾP vào tiêu đề cho AI dễ đọc
    all_reports_text = ""
    for spec_name, report_content in reports.items():
        # Tra cứu xem khoa này là Chính hay Phụ
        is_core = core_issue_map.get(spec_name, False)

        # Gắn nhãn thị giác
        priority_label = "🔴 VẤN ĐỀ CHÍNH" if is_core else "⚪ VẤN ĐỀ PHỤ"

        all_reports_text += f"\n--- BÁO CÁO TỪ KHOA {spec_name.upper()} ({priority_label}) ---\n{report_content}\n"

    # 4. Nâng cấp Prompt: Dạy Trưởng khoa cách đọc nhãn và phân bổ thời lượng trả lời
    prompt = f"""Bạn là Bác sĩ Trưởng khoa. Nhiệm vụ của bạn là tổng hợp báo cáo từ các bác sĩ chuyên khoa để đưa ra lời khuyên cuối cùng cho bệnh nhân.

    [CÁC BÁO CÁO CHUYÊN KHOA ĐÃ PHÂN CẤP ƯU TIÊN]:
    {all_reports_text}

    [BỆNH NHÂN HỎI]: {query}

    YÊU CẦU TRÌNH BÀY:
    1. QUẢN LÝ ƯU TIÊN: Đọc kỹ các nhãn (🔴 VẤN ĐỀ CHÍNH và ⚪ VẤN ĐỀ PHỤ). Tập trung 80% câu trả lời để tư vấn và giải quyết triệt để cho Vấn đề Chính. Vấn đề Phụ chỉ nhắc đến ngắn gọn ở phần sau.
    2. CẢNH BÁO CẤP CỨU: Nếu bất kỳ khoa nào (đặc biệt là Khoa Chính) cảnh báo tình trạng khẩn cấp (nhồi máu, đột quỵ, khó thở...), ĐẶT CẢNH BÁO ĐÓ LÊN ĐẦU TIÊN và yêu cầu gọi 115 ngay lập tức.
    3. TỔNG HỢP LOGIC: Trình bày lại mạch lạc, dễ hiểu, kết nối các triệu chứng lại với nhau. KHÔNG liệt kê kiểu "Khoa A nói...", "Khoa B nói...". Hãy đóng vai 1 người bác sĩ duy nhất đang nói chuyện.
    4. Giữ lại các trích dẫn nguồn (tên sách/tài liệu) từ các bản báo cáo để tăng độ uy tín.
    5. Thêm câu chốt: "⚠️ Lưu ý: Thông tin chỉ mang tính tham khảo. Vui lòng đến cơ sở y tế để được thăm khám chính xác." ở cuối cùng.
    """

    res = llm.invoke(prompt)
    return {"response": res.content}


# --- 4. XÂY DỰNG LUỒNG GRAPH ---
def route_logic(state: RouterState) -> str:
    if not state["analyzed_specialties"]:
        return "chief_doctor"  # Trực tiếp ra kết luận nếu không có bệnh lý
    return "retrieve_db"


builder = StateGraph(RouterState)  # type: ignore
builder.add_node("router", router_node_llm)  # type: ignore
builder.add_node("retrieve_db", retrieve_node)  # type: ignore
builder.add_node("specialty_experts", specialty_experts_node)  # type: ignore
builder.add_node("chief_doctor", chief_doctor_node)  # type: ignore

builder.add_edge(START, "router")
builder.add_conditional_edges("router", route_logic, {"retrieve_db": "retrieve_db", "chief_doctor": "chief_doctor"})
builder.add_edge("retrieve_db", "specialty_experts")
builder.add_edge("specialty_experts", "chief_doctor")
builder.add_edge("chief_doctor", END)

app = builder.compile()


# --- 5. CHẠY THỬ CHƯƠNG TRÌNH (TỐI ƯU ASYNC) ---
async def main_chat():
    print("\n" + "=" * 80)
    print("🏥 HỆ THỐNG RAG MULTI-AGENT (ASYNC SONG SONG)")
    print("=" * 80)

    while True:
        q = input("\n❓ Bệnh nhân hỏi (gõ 'exit' để thoát): ")
        if q.lower() == 'exit':
            break

        # SỬ DỤNG ainvoke ĐỂ KÍCH HOẠT GRAPH BẤT ĐỒNG BỘ
        result = await app.ainvoke({"query": q})
        print(f"\n🩺 KẾT LUẬN CỦA TRƯỞNG KHOA: \n{result['response']}")


if __name__ == "__main__":
    # Dùng asyncio.run để khởi động vòng lặp sự kiện chính của toàn bộ chương trình
    asyncio.run(main_chat())