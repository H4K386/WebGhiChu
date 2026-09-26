import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
function PrivateNotes() {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [notes, setNotes] = useState([]);
    const [formData, setFormData] = useState({ id: null, title: '', content: '' });
    const location = useLocation();

    const handleLogin = () => {
        fetch('http://localhost:5000/api/private/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: passwordInput })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setIsUnlocked(true); // Mở khóa
                fetchPrivateNotes(); // Lấy dữ liệu
            } else {
                alert("Sai mật khẩu, vui lòng thử lại!");
                setPasswordInput('');
            }
        });
    };

    const filteredNotes = notes
    .filter(note => {
        const keyword = searchTerm.toLowerCase();
        const matchTitle = (note.title || '').toLowerCase().includes(keyword);
        const matchContent = (note.content || '').toLowerCase().includes(keyword);
        return matchTitle || matchContent;
    })

    const fetchPrivateNotes = () => {
        fetch('http://localhost:5000/api/private/notes')
            .then(res => res.json())
            .then(data => setNotes(data));
    };

    const handleSave = () => {
        fetch('http://localhost:5000/api/private/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: formData.title, content: formData.content })
        }).then(() => {
            fetchPrivateNotes();
            setFormData({ id: null, title: '', content: '' });
        });
    };
      
    const handleDelete = (id) => {
        if(window.confirm('Bạn có chắc muốn xóa ghi chú này?')) {
            fetch(`http://localhost:5000/api/notes/private/${topic}/${id}`, { method: 'DELETE' })
            .then(() => fetchNotes());
        }
    };

    const handleEdit = (note) => setFormData({ id: note.id, title: note.title, content:note.content });

    useEffect(() => {
            if (location.state && location.state.editNote) {
                const { editNote, topic: noteTopic } = location.state;
    
                if (noteTopic) setTopic(noteTopic);
    
                setFormData({
                    id: editNote.id,
                    title: editNote.title,
                    content: editNote.content
                });
            }
        }, [location.state]);

    if (!isUnlocked) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <h2>Khu vực Bảo mật</h2>
                <p>Vui lòng nhập mật khẩu để truy cập</p>
                <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                />
                <button onClick={handleLogin} style={{ marginLeft: '10px' }}>Mở khóa</button>
            </div>
        );
    }
    return (
        <div style={{ padding: '20px', backgroundColor: '#ffebee' }}>
            <h2 style={{ color: 'red' }}>Khu vực Ghi chú Riêng tư </h2>
            <div style={{ border: '1px solid red', padding: '10px', marginBottom: '20px'}}>
                <input
                    placeholder="Tiêu đề bí mật" value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    style={{ display: 'block', width: '100%', marginBottom: '10px' }}
                />
                <textarea
                    placeholder="Nội dung bí mật" value={formData.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
                    style={{ display: 'block', width: '100%', height: '80px', marginBottom: '10px' }}
                />
                <button onClick={handleSave} style={{ backgroundColor: 'red', color: 'white'}}>Lưu bí mật</button>
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '10px' }}>Tìm kiếm: </span>
                {/* Khung tìm kiếm tự đông tìm khi nhập 1 ký tự */}
                <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                
                {notes.map(note => (
                    <div key={note.id} style={{ border: '1px solid red', padding: '15px' }}>
                        <h4>{note.title}</h4>
                        <p>{note.content}</p>
                        <div style={{ marginTop: '10px' }}>
                            <button onClick={() => handleEdit(note)} style={{ marginRight: '10px'}}>Sửa</button>
                            <button onClick={() => handleDelete(note.id)} style={{ color: 'red'}}>Xóa</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default PrivateNotes;