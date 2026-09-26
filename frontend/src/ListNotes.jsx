import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
function ListNotes(){

    const [allNotes, setAllNotes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');
    const ITEMS_PER_PAGE = 9;
    const [currentPage, setCurrentPage] = useState(1);
    const [viewNote, setViewNote] = useState(null);
    const navigate = useNavigate();
    
    //Gọi API để lấy tất cả các ghi chú
    useEffect(() => {
        fetch('http://localhost:5000/api/notes-all')
        .then(res => res.json())
        .then(data => setAllNotes(data))
        .catch(err => console.error("Lỗi kết nối API:", err));
    }, []);

    // Logic lọc theo từ khóa (tiêu đề/nội dung) và chủ đề
    const filteredNotes = allNotes
    .filter(note => {
        // Lọc chủ đề: Nếu chọn 'all' thì giữ hết, ngược lại kiểm tra đúng tên chủ đề
        const matchTopic = selectedTopic === 'all' || note.topic === selectedTopic;
        // Lọc từ khóa: Tìm trong tiêu đề
        const keyword = searchTerm.toLowerCase();
        const matchSearch = (note.title || '').toLowerCase().includes(keyword);
        return matchTopic && matchSearch;
    })

    .sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    //Tự động quay về trang 1 khi thay đổi từ khóa tìm kiếm, chủ đề hoặc sắp xếp
    useEffect(() => {
    setCurrentPage(1);
    }, [searchTerm, selectedTopic, sortOrder]);

    // Cắt dữ liệu hiển thị cho trang hiện tại
    const totalPages = Math.ceil(filteredNotes.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentNotes = filteredNotes.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return(
        <div style={{ padding: '20px' }}>
            <h2>Danh sách tất cả ghi chú</h2>

            <div>
                <span style={{ marginLeft: '10px' }}>Chủ đề: </span>
                <select style = {{ marginRight: '20px' }} value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
                    <option value="all">Tất cả</option>
                    <option value="hoc-tap">Học tập</option>
                    <option value="cong-viec">Công việc</option>
                    <option value="ca-nhan">Cá nhân</option>
                </select>

                <span style={{ marginLeft: '10px' }}>Thời gian: </span>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                </select>

                <span style={{ marginLeft: '10px' }}>Tìm kiếm: </span>
                {/* Khung tìm kiếm tự đông tìm khi nhập 1 ký tự */}
                <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />   
            </div>

            <br />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                {currentNotes.length === 0 && <p>Chưa có ghi chú nào.</p>}

                {currentNotes.map(note => (
                    <div key={note.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', height: '100px' }}>
                        <h4 style={{ margin: '0 0 10px 0' }}>{note.title}</h4>
                        <div style={{ marginTop: 'auto', paddingTop: '10px'}}>
                            <button onClick={() => setViewNote(note)} style={{ padding: '5px 12px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none' }}>
                                Xem
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div style ={{ marginTop: 'auto' }}>
                {totalPages > 1 && (
                <div style={{ marginTop: '20px', display: 'flex', gap: '5px' }}>
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
                        Trước
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button 
                            key={i + 1} 
                            onClick={() => setCurrentPage(i + 1)}
                            style={{ fontWeight: currentPage === i + 1 ? 'bold' : 'normal' }}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>
                        Sau
                    </button>
                </div>
            )}
            </div>

            {viewNote && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        padding: '20px',
                        borderRadius: '8px',
                        width: '90%',
                        maxWidth: '500px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                    }}>
                        <span style={{ fontSize: '12px', backgroundColor: '#007bff', color: '#fff', padding: '3px 8px', borderRadius: '4px' }}>
                            {viewNote.topic}
                        </span>
                        <h3 style={{ marginTop: '10px', marginBottom: '5px' }}>{viewNote.title}</h3>
                        
                        <hr style={{ margin: '15px 0' }} />

                        {/* Nội dung ghi chú (Read-only) */}
                        <div style={{ 
                            whiteSpace: 'pre-wrap', 
                            lineHeight: '1.5', 
                            color: '#333',
                            minHeight: '80px',
                            maxHeight: '250px',
                            overflowY: 'auto',
                            padding: '10px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '5px'
                        }}>
                            {viewNote.content || "(Không có nội dung)"}
                        </div>

                        {/* Nút bấm ở chân Modal */}
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button
                                onClick={() => {
                                    const noteToEdit = viewNote;
                                    setViewNote(null);
                                    navigate('/notes', { state: { editNote: noteToEdit, topic: noteToEdit.topic } });
                                }}
                                style={{
                                    backgroundColor: '#ffc107',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                Sửa
                            </button>

                            <button
                                onClick={() => setViewNote(null)}
                                style={{
                                    backgroundColor: '#6c757d',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}    
        </div>
    );
};
export default ListNotes;