import { useState, useRef, useEffect } from "react";
 
// ===================== ICONS =====================
const BedIcon = () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12V7a1 1 0 011-1h6v6M3 12h18M3 12v5m18-5V7a1 1 0 00-1-1h-6v6m6 0v5" /></svg>;
const BathIcon = () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16M4 12a2 2 0 01-2-2V6a2 2 0 012-2h3m13 8v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3" /></svg>;
const WifiIcon = () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>;
const BellIcon = () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const UserIcon = () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const SearchIconWhite = () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const SearchIconGray = () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#aaa" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const FbIcon = () => <svg width="18" height="18" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
const GoogleIcon = () => <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>;
const AppleIcon = () => <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>;
const SendIcon = () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const MicIcon = () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const XIcon = () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const PhoneIcon = () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const CameraIcon = () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const EditIcon = () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const HomeIcon = () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const CheckIcon = () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
const TrashIcon = () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const StarIcon = ({filled}) => <svg width="16" height="16" fill={filled?"#f59e0b":"none"} viewBox="0 0 24 24" stroke="#f59e0b" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
 
// ===================== DATA =====================
const ALL_LISTINGS = [
 { id: 1, bedrooms: 1, baths: 1, price: 3500000, available: "28/11/2021", img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80", phone: "0901234567", address: "25 Nguyễn Hùng, Cầu Giấy" },
 { id: 2, bedrooms: 1, baths: 1, price: 4200000, available: "28/11/2021", img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80", phone: "0912345678", address: "12 Trần Duy Hưng, Cầu Giấy" },
 { id: 3, bedrooms: 2, baths: 2, price: 7500000, available: "28/11/2021", img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80", phone: "0923456789", address: "8 Hoàng Minh Giám, Cầu Giấy" },
 { id: 4, bedrooms: 1, baths: 1, price: 2800000, available: "28/11/2021", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80", phone: "0934567890", address: "56 Xuân Thủy, Cầu Giấy" },
 { id: 5, bedrooms: 2, baths: 2, price: 9000000, available: "28/11/2021", img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&q=80", phone: "0945678901", address: "3 Dịch Vọng Hậu, Cầu Giấy" },
 { id: 6, bedrooms: 1, baths: 1, price: 5500000, available: "28/11/2021", img: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80", phone: "0956789012", address: "90 Phạm Văn Đồng, Bắc Từ Liêm" },
 { id: 7, bedrooms: 3, baths: 2, price: 12000000, available: "28/11/2021", img: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&q=80", phone: "0967890123", address: "15 Mỹ Đình, Nam Từ Liêm" },
 { id: 8, bedrooms: 2, baths: 1, price: 6800000, available: "28/11/2021", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80", phone: "0978901234", address: "22 Lê Văn Lương, Đống Đa" },
];
 
const PRICE_RANGES = [
 { label: "Dưới 3 triệu", min: 0, max: 3000000 },
 { label: "3 – 7 triệu", min: 3000000, max: 7000000 },
 { label: "Trên 7 triệu", min: 7000000, max: Infinity },
];
 
const INIT_CONTACTS = [
 { id: 1, name: "Nguyễn Thùy Hiền", time: "12:51", msg: "Phòng còn trống không ạ?", unread: 0, pinned: true, phone: "0901234567" },
 { id: 2, name: "Trần Văn Nam", time: "11:54", msg: "Cho tôi xem phòng được không?", unread: 2, pinned: true, phone: "0912345678" },
 { id: 3, name: "Lê Thị Mai", time: "11:22", msg: "Cảm ơn bạn nhé!", unread: 0, pinned: false, phone: "0923456789" },
 { id: 4, name: "Phạm Đức Anh", time: "10:05", msg: "Giá điện nước tính thế nào?", unread: 1, pinned: false, phone: "0934567890" },
];
 
const INIT_MESSAGES = {
 1: [
   { id: 1, from: "them", text: "Chào bạn, phòng còn trống không ạ?" },
   { id: 2, from: "me", text: "Dạ còn ạ! Phòng 25m², đầy đủ nội thất." },
   { id: 3, from: "them", text: "Giá bao nhiêu vậy?" },
   { id: 4, from: "me", text: "3.500.000 ₫/tháng, đã bao gồm WiFi." },
   { id: 5, from: "them", text: "Cho tôi đặt lịch xem phòng được không?" },
 ],
 2: [
   { id: 1, from: "them", text: "Tôi muốn xem phòng, sáng mai được không?" },
   { id: 2, from: "me", text: "Được ạ, 9h sáng nhé!" },
 ],
 3: [
   { id: 1, from: "them", text: "Cảm ơn bạn đã cho xem phòng!" },
   { id: 2, from: "me", text: "Không có gì, có gì liên hệ mình nhé 😊" },
 ],
 4: [
   { id: 1, from: "them", text: "Điện tính theo giá nhà nước không?" },
   { id: 2, from: "me", text: "Dạ, 3.500đ/kWh theo giá nhà nước." },
   { id: 3, from: "them", text: "Nước thì sao ạ?" },
   { id: 4, from: "me", text: "Nước 15.000đ/m³ ạ." },
 ],
};
 
const elecRooms = [
 { room: "P.101", prev: 1240, curr: 1410, type: "Bình thường", unitPrice: 3500 },
 { room: "P.102", prev: 980, curr: 1150, type: "Bình thường", unitPrice: 3500 },
 { room: "P.103", prev: 760, curr: 930, type: "Bình thường", unitPrice: 3500 },
];
const waterRooms = [
 { room: "P.101", prev: 320, curr: 490, unitPrice: 15000 },
 { room: "P.102", prev: 210, curr: 352, unitPrice: 15000 },
 { room: "P.103", prev: 150, curr: 270, unitPrice: 15000 },
];
 
const INVOICES = [
 { id: "HD001", tenant: "Nguyễn Thùy Hiền", room: "P.101", amount: 3500000, due: "05/06/2026", status: "paid" },
 { id: "HD002", tenant: "Trần Văn Nam", room: "P.102", amount: 4200000, due: "05/06/2026", status: "unpaid" },
 { id: "HD003", tenant: "Lê Thị Mai", room: "P.103", amount: 7500000, due: "05/06/2026", status: "paid" },
 { id: "HD004", tenant: "Phạm Đức Anh", room: "P.201", amount: 2800000, due: "05/06/2026", status: "overdue" },
 { id: "HD005", tenant: "Vũ Thu Hà", room: "P.202", amount: 5500000, due: "05/06/2026", status: "unpaid" },
];
 
const revenueData = [60, 45, 70, 55, 65, 90, 80];
const costData = [40, 35, 50, 40, 50, 70, 60];
const months = ["T1", "T2", "T3", "T4", "T5", "T6", "T7"];
 
const fmt = n => Number(n).toLocaleString("vi-VN") + " ₫";
 
// ===================== AUTH MODAL =====================
function AuthModal({ mode, onClose, onSwitch, onAuth }) {
 return (
   <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center" }}>
     <div onClick={e=>e.stopPropagation()} style={{ width:360,borderRadius:28,background:"linear-gradient(145deg,#e8322a 0%,#ff6b6b 45%,#ffb3b0 100%)",boxShadow:"0 30px 80px rgba(220,50,42,0.4)",padding:"44px 34px 38px",position:"relative" }}>
       <button onClick={onClose} style={{ position:"absolute",top:14,right:18,background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.85)",fontSize:20 }}>✕</button>
       <h2 style={{ margin:"0 0 26px",fontSize:21,fontWeight:700,color:"#1a1a1a" }}>{mode==="login"?"Đăng Nhập":"Đăng Ký"}</h2>
       <div style={{ display:"flex",flexDirection:"column",gap:11 }}>
         {[
           { Icon:FbIcon, label:mode==="login"?"Đăng nhập với Facebook":"Đăng ký với Facebook", bg:"#1877F2", color:"white" },
           { Icon:GoogleIcon, label:mode==="login"?"Đăng nhập với Google":"Đăng ký với Google", bg:"white", color:"#333", shadow:"0 2px 8px rgba(0,0,0,0.1)" },
           { Icon:AppleIcon, label:mode==="login"?"Đăng nhập với Apple":"Đăng ký với Apple", bg:"#000", color:"white" },
         ].map(({Icon,label,bg,color,shadow})=>(
           <button key={label} onClick={onAuth} style={{ display:"flex",alignItems:"center",gap:12,background:bg,border:"none",borderRadius:12,padding:"13px 18px",cursor:"pointer",width:"100%",color,fontWeight:600,fontSize:14,boxShadow:shadow||"none" }}>
             <Icon/> {label}
           </button>
         ))}
       </div>
       <p style={{ textAlign:"center",marginTop:22,color:"rgba(255,255,255,0.9)",fontSize:13 }}>
         {mode==="login"?"Chưa có tài khoản? ":"Đã có tài khoản? "}
         <span onClick={onSwitch} style={{ color:"white",fontWeight:700,cursor:"pointer",textDecoration:"underline" }}>
           {mode==="login"?"Đăng ký":"Đăng nhập"}
         </span>
       </p>
     </div>
   </div>
 );
}
 
// ===================== CONTACT POPUP =====================
function ContactPopup({ listing, onClose, onChat }) {
 return (
   <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:160,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center" }}>
     <div onClick={e=>e.stopPropagation()} style={{ background:"white",borderRadius:18,padding:28,width:320,boxShadow:"0 20px 60px rgba(0,0,0,0.18)" }}>
       <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
         <h3 style={{ margin:0,fontSize:16,fontWeight:700 }}>Thông tin liên hệ</h3>
         <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"#666" }}><XIcon/></button>
       </div>
       <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:20 }}>
         <div style={{ width:44,height:44,borderRadius:"50%",background:"#f5e5e5",display:"flex",alignItems:"center",justifyContent:"center",color:"#dc322a" }}><UserIcon/></div>
         <div><p style={{ margin:0,fontWeight:700 }}>Nguyễn Thùy Hiền</p><p style={{ margin:0,fontSize:12,color:"#888" }}>Chủ nhà</p></div>
       </div>
       <div style={{ background:"#fff5f5",border:"1.5px solid #fcc",borderRadius:12,padding:"14px 18px",marginBottom:16,display:"flex",alignItems:"center",gap:10 }}>
         <PhoneIcon/><span style={{ fontWeight:700,fontSize:17,color:"#dc322a",letterSpacing:1 }}>{listing.phone}</span>
       </div>
       <button onClick={()=>{ onClose(); onChat(listing); }} style={{ width:"100%",background:"#dc322a",color:"white",border:"none",borderRadius:12,padding:"12px",fontWeight:700,fontSize:14,cursor:"pointer" }}>
         💬 Nhắn tin ngay
       </button>
     </div>
   </div>
 );
}
 
// ===================== DETAIL MODAL =====================
function DetailModal({ listing, onClose, onChat }) {
 const [showPhone, setShowPhone] = useState(false);
 return (
   <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:150,background:"rgba(0,0,0,0.45)",backdropFilter:"blur(3px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
     <div onClick={e=>e.stopPropagation()} style={{ width:"100%",maxWidth:620,maxHeight:"88vh",overflowY:"auto",background:"white",borderRadius:20,boxShadow:"0 20px 60px rgba(0,0,0,0.2)",padding:28 }}>
       <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16 }}>
         <p style={{ margin:0,fontWeight:700,fontSize:15,color:"#222",maxWidth:"88%" }}>{listing.address}</p>
         <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"#666",padding:4 }}><XIcon/></button>
       </div>
       <div style={{ display:"flex",gap:10,marginBottom:20 }}>
         <img src={listing.img} alt="" style={{ width:220,height:165,objectFit:"cover",borderRadius:12 }}/>
         <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,flex:1 }}>
           {[0,1,2,3].map(i=><img key={i} src={listing.img} alt="" style={{ width:"100%",height:77,objectFit:"cover",borderRadius:8 }}/>)}
         </div>
       </div>
       <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:16,padding:"12px 16px",background:"#fafafa",borderRadius:12 }}>
         <div style={{ width:40,height:40,borderRadius:"50%",background:"#f5e5e5",display:"flex",alignItems:"center",justifyContent:"center",color:"#dc322a" }}><UserIcon/></div>
         <div style={{ flex:1 }}>
           <p style={{ margin:0,fontWeight:700,color:"#333" }}>Nguyễn Thùy Hiền</p>
           {showPhone&&<p style={{ margin:"2px 0 0",fontSize:14,color:"#dc322a",fontWeight:700 }}>{listing.phone}</p>}
         </div>
         <button onClick={()=>setShowPhone(v=>!v)} style={{ background:"#dc322a",color:"white",border:"none",borderRadius:8,padding:"8px 14px",fontWeight:600,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
           <PhoneIcon/>{showPhone?listing.phone:"Xem SĐT"}
         </button>
         <button onClick={()=>{onClose();onChat(listing);}} style={{ background:"#dc322a",color:"white",border:"none",borderRadius:8,padding:"8px 14px",fontWeight:600,fontSize:13,cursor:"pointer" }}>Chat</button>
       </div>
       <p style={{ color:"#555",fontSize:14,lineHeight:1.8,marginBottom:20 }}>Phòng sáng, thoáng mát, cách trường 5 phút đi bộ. Đầy đủ nội thất: giường, bàn học, tủ quần áo. WiFi tốc độ cao. Phù hợp sinh viên và người đi làm.</p>
       {[
         {label:"Giá thuê",value:fmt(listing.price)+"/tháng"},
         {label:"Diện tích",value:"25 m²"},
         {label:"Số người tối đa",value:`${listing.bedrooms+1} người`},
         {label:"Giá nước",value:"15.000 ₫/m³"},
         {label:"Giá điện",value:"3.500 ₫/kWh"},
       ].map(({label,value})=>(
         <div key={label} style={{ marginBottom:12 }}>
           <label style={{ fontSize:12,fontWeight:600,color:"#888",display:"block",marginBottom:4 }}>{label}</label>
           <div style={{ border:"1.5px solid #fcc",borderRadius:8,padding:"10px 14px",fontSize:14,color:"#333",background:"#fff9f9" }}>{value}</div>
         </div>
       ))}
       <div style={{ marginBottom:12 }}>
         <label style={{ fontSize:12,fontWeight:600,color:"#888",display:"block",marginBottom:4 }}>Loại điện</label>
         <div style={{ border:"1.5px solid #fcc",borderRadius:8,padding:"10px 14px",fontSize:14,color:"#555",background:"#fff9f9" }}>Điện sinh hoạt – 3.500 ₫/kWh</div>
       </div>
       <div style={{ display:"flex",gap:10,marginTop:8 }}>
         <span style={{ background:"#e8f5e9",color:"#388e3c",borderRadius:6,padding:"4px 10px",fontSize:12,fontWeight:600 }}>✓ Thang máy</span>
         <span style={{ background:"#e8f5e9",color:"#388e3c",borderRadius:6,padding:"4px 10px",fontSize:12,fontWeight:600 }}>✓ Bãi xe</span>
         <span style={{ background:"#e8f5e9",color:"#388e3c",borderRadius:6,padding:"4px 10px",fontSize:12,fontWeight:600 }}>✓ WiFi</span>
         <span style={{ background:"#e8f5e9",color:"#388e3c",borderRadius:6,padding:"4px 10px",fontSize:12,fontWeight:600 }}>✓ An ninh</span>
       </div>
     </div>
   </div>
 );
}
 
// ===================== HOME TAB =====================
function HomeTab({ onChatWithListing }) {
 const [search,setSearch] = useState("");
 const [priceFrom,setPriceFrom] = useState("");
 const [priceTo,setPriceTo] = useState("");
 const [checkedRanges,setCheckedRanges] = useState([]);
 const [bedroomFilter,setBedroomFilter] = useState(0);
 const [sortBy,setSortBy] = useState("default");
 const [detail,setDetail] = useState(null);
 const [contact,setContact] = useState(null);
 const [page,setPage] = useState(1);
 const PER_PAGE = 5;
 
 const toggleRange = idx => setCheckedRanges(p=>p.includes(idx)?p.filter(i=>i!==idx):[...p,idx]);
 
 let filtered = ALL_LISTINGS.filter(l=>{
   const q = search.toLowerCase();
   if(q && !l.address.toLowerCase().includes(q) && !String(l.price).includes(q) && !String(l.bedrooms).includes(q)) return false;
   const from = priceFrom?parseInt(priceFrom.replace(/\D/g,"")):0;
   const to = priceTo?parseInt(priceTo.replace(/\D/g,"")):Infinity;
   if(l.price<from||l.price>to) return false;
   if(checkedRanges.length>0){
     const ok = checkedRanges.some(i=>l.price>=PRICE_RANGES[i].min&&l.price<PRICE_RANGES[i].max);
     if(!ok) return false;
   }
   if(bedroomFilter>0&&l.bedrooms!==bedroomFilter) return false;
   return true;
 });
 
 if(sortBy==="asc") filtered=[...filtered].sort((a,b)=>a.price-b.price);
 else if(sortBy==="desc") filtered=[...filtered].sort((a,b)=>b.price-a.price);
 
 const totalPages = Math.ceil(filtered.length/PER_PAGE);
 const paged = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);
 
 const clearFilter = () => { setCheckedRanges([]); setPriceFrom(""); setPriceTo(""); setBedroomFilter(0); setSearch(""); setPage(1); };
 
 return (
   <div style={{ maxWidth:980,margin:"0 auto",padding:"28px 24px" }}>
     {/* Search */}
     <div style={{ display:"flex",gap:10,marginBottom:24,maxWidth:680,margin:"0 auto 24px" }}>
       <div style={{ flex:1,display:"flex",alignItems:"center",background:"white",borderRadius:30,padding:"0 20px",boxShadow:"0 2px 12px rgba(0,0,0,0.07)",border:"1.5px solid #eee" }}>
         <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Tìm kiếm địa chỉ, số phòng ngủ..."
           style={{ flex:1,border:"none",outline:"none",fontSize:15,padding:"12px 0",background:"transparent" }}/>
       </div>
       <button style={{ background:"#dc322a",border:"none",borderRadius:"50%",width:48,height:48,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,boxShadow:"0 4px 14px rgba(220,50,42,0.3)" }}>
         <SearchIconWhite/>
       </button>
     </div>
 
     <div style={{ display:"flex",gap:22,alignItems:"flex-start" }}>
       {/* Sidebar */}
       <div style={{ width:196,flexShrink:0,background:"white",borderRadius:16,padding:"18px 16px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",border:"1px solid #f0f0f0",position:"sticky",top:80 }}>
         <p style={{ margin:"0 0 10px",fontWeight:700,fontSize:13,color:"#333" }}>Lọc theo giá (₫)</p>
         <div style={{ display:"flex",gap:6,marginBottom:14 }}>
           <div style={{ flex:1 }}>
             <div style={{ fontSize:10,color:"#aaa",marginBottom:3 }}>Từ</div>
             <input value={priceFrom} onChange={e=>{setPriceFrom(e.target.value);setPage(1);}} placeholder="0"
               style={{ width:"100%",border:"1.5px solid #e5e5e5",borderRadius:8,padding:"6px 7px",fontSize:12,boxSizing:"border-box",outline:"none" }}/>
           </div>
           <div style={{ flex:1 }}>
             <div style={{ fontSize:10,color:"#aaa",marginBottom:3 }}>Đến</div>
             <input value={priceTo} onChange={e=>{setPriceTo(e.target.value);setPage(1);}} placeholder="∞"
               style={{ width:"100%",border:"1.5px solid #e5e5e5",borderRadius:8,padding:"6px 7px",fontSize:12,boxSizing:"border-box",outline:"none" }}/>
           </div>
         </div>
         <div style={{ borderTop:"1px solid #f5f5f5",marginBottom:14,paddingTop:14 }}>
           <p style={{ margin:"0 0 8px",fontWeight:700,fontSize:13,color:"#333" }}>Khoảng giá</p>
           {PRICE_RANGES.map((r,i)=>(
             <label key={i} style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8,cursor:"pointer",fontSize:13,color:checkedRanges.includes(i)?"#dc322a":"#555",fontWeight:checkedRanges.includes(i)?700:400 }}>
               <input type="checkbox" checked={checkedRanges.includes(i)} onChange={()=>{toggleRange(i);setPage(1);}} style={{ accentColor:"#dc322a",width:14,height:14 }}/>{r.label}
             </label>
           ))}
         </div>
         <div style={{ borderTop:"1px solid #f5f5f5",paddingTop:14,marginBottom:14 }}>
           <p style={{ margin:"0 0 8px",fontWeight:700,fontSize:13,color:"#333" }}>Số phòng ngủ</p>
           <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
             {[0,1,2,3].map(n=>(
               <button key={n} onClick={()=>{setBedroomFilter(n);setPage(1);}} style={{ background:bedroomFilter===n?"#dc322a":"#f5f5f5",color:bedroomFilter===n?"white":"#555",border:"none",borderRadius:8,padding:"5px 10px",fontSize:12,cursor:"pointer",fontWeight:600 }}>
                 {n===0?"Tất cả":`${n} PN`}
               </button>
             ))}
           </div>
         </div>
         <div style={{ borderTop:"1px solid #f5f5f5",paddingTop:14 }}>
           <p style={{ margin:"0 0 8px",fontWeight:700,fontSize:13,color:"#333" }}>Sắp xếp giá</p>
           <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ width:"100%",border:"1.5px solid #e5e5e5",borderRadius:8,padding:"7px 8px",fontSize:12,outline:"none",color:"#555" }}>
             <option value="default">Mặc định</option>
             <option value="asc">Giá tăng dần</option>
             <option value="desc">Giá giảm dần</option>
           </select>
         </div>
         {(checkedRanges.length>0||priceFrom||priceTo||bedroomFilter>0||search)&&(
           <button onClick={clearFilter} style={{ width:"100%",marginTop:14,background:"none",border:"1.5px solid #dc322a",borderRadius:8,padding:"7px",color:"#dc322a",fontWeight:700,fontSize:12,cursor:"pointer" }}>
             ✕ Xóa bộ lọc
           </button>
         )}
       </div>
 
       {/* Listings */}
       <div style={{ flex:1,display:"flex",flexDirection:"column",gap:14 }}>
         <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
           <p style={{ margin:0,fontSize:13,color:"#888" }}>Tìm thấy <strong style={{ color:"#dc322a" }}>{filtered.length}</strong> phòng</p>
         </div>
         {paged.length===0&&(
           <div style={{ textAlign:"center",padding:"60px 20px",color:"#bbb",background:"white",borderRadius:16 }}>
             <div style={{ fontSize:40,marginBottom:10 }}>🔍</div>
             <p>Không tìm thấy phòng phù hợp</p>
             <button onClick={clearFilter} style={{ background:"#dc322a",color:"white",border:"none",borderRadius:10,padding:"8px 20px",fontWeight:700,cursor:"pointer",fontSize:13 }}>Xóa bộ lọc</button>
           </div>
         )}
         {paged.map(l=>(
           <div key={l.id} style={{ display:"flex",borderRadius:16,background:"#fff",boxShadow:"0 2px 14px rgba(0,0,0,0.06)",overflow:"hidden",border:"1px solid #f0f0f0",transition:"box-shadow 0.2s" }}
             onMouseEnter={e=>e.currentTarget.style.boxShadow="0 6px 28px rgba(220,50,42,0.12)"}
             onMouseLeave={e=>e.currentTarget.style.boxShadow="0 2px 14px rgba(0,0,0,0.06)"}>
             <img src={l.img} alt="room" style={{ width:195,minHeight:155,objectFit:"cover",flexShrink:0 }}/>
             <div style={{ padding:"16px 18px",flex:1,minWidth:0 }}>
               <p style={{ margin:"0 0 4px",fontWeight:700,fontSize:15,color:"#1a1a1a" }}>Phòng trọ cao cấp – {l.address}</p>
               <div style={{ display:"flex",gap:14,color:"#666",fontSize:13,marginBottom:6,flexWrap:"wrap" }}>
                 <span style={{ display:"flex",alignItems:"center",gap:4 }}><BedIcon/>{l.bedrooms} phòng ngủ</span>
                 <span style={{ display:"flex",alignItems:"center",gap:4 }}><BathIcon/>{l.baths} WC</span>
                 <span style={{ display:"flex",alignItems:"center",gap:4 }}><WifiIcon/>WiFi</span>
               </div>
               <p style={{ margin:"0 0 10px",fontSize:12,color:"#aaa" }}>View thành phố | Tầng 3 | Thang máy | Bãi xe</p>
               <div style={{ display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>
                 <span style={{ background:"#dc322a",color:"white",borderRadius:6,padding:"3px 10px",fontSize:12,fontWeight:600 }}>Còn trống từ {l.available}</span>
                 <span style={{ fontSize:15,fontWeight:800,color:"#dc322a" }}>{fmt(l.price)}<span style={{ fontSize:12,fontWeight:400,color:"#888" }}>/tháng</span></span>
               </div>
             </div>
             <div style={{ display:"flex",flexDirection:"column",gap:8,justifyContent:"center",padding:"16px 14px 16px 0",flexShrink:0 }}>
               <RedBtn onClick={()=>setContact(l)}>Liên hệ</RedBtn>
               <RedBtn onClick={()=>setDetail(l)}>Chi tiết</RedBtn>
             </div>
           </div>
         ))}
         {/* Pagination */}
         {totalPages>1&&(
           <div style={{ display:"flex",justifyContent:"center",gap:8,marginTop:8 }}>
             <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ background:page===1?"#f0f0f0":"#dc322a",color:page===1?"#aaa":"white",border:"none",borderRadius:8,padding:"8px 16px",fontWeight:700,cursor:page===1?"default":"pointer",fontSize:13 }}>← Trước</button>
             {Array.from({length:totalPages},(_,i)=>i+1).map(n=>(
               <button key={n} onClick={()=>setPage(n)} style={{ background:n===page?"#dc322a":"white",color:n===page?"white":"#555",border:"1.5px solid #e5e5e5",borderRadius:8,padding:"8px 14px",fontWeight:700,cursor:"pointer",fontSize:13 }}>{n}</button>
             ))}
             <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{ background:page===totalPages?"#f0f0f0":"#dc322a",color:page===totalPages?"#aaa":"white",border:"none",borderRadius:8,padding:"8px 16px",fontWeight:700,cursor:page===totalPages?"default":"pointer",fontSize:13 }}>Sau →</button>
           </div>
         )}
       </div>
     </div>
     {contact&&<ContactPopup listing={contact} onClose={()=>setContact(null)} onChat={onChatWithListing}/>}
     {detail&&<DetailModal listing={detail} onClose={()=>setDetail(null)} onChat={onChatWithListing}/>}
   </div>
 );
}
 
// ===================== POST TAB =====================
function PostTab() {
 const [form,setForm] = useState({ title:"",address:"",district:"",price:"",area:"",bedrooms:"1",baths:"1",floor:"",maxPeople:"",elecPrice:"3500",waterPrice:"15000",elecType:"Bình thường",desc:"",amenities:[] });
 const [imgs,setImgs] = useState([]);
 const [submitted,setSubmitted] = useState(false);
 const amenityList=["WiFi","Điều hòa","Máy giặt","Bãi xe máy","Bãi ô tô","Thang máy","An ninh 24/7","Bếp chung","Ban công","Gác lửng"];
 const toggleAmenity=a=>setForm(f=>({ ...f,amenities:f.amenities.includes(a)?f.amenities.filter(x=>x!==a):[...f.amenities,a] }));
 const F=(label,key,type="text",placeholder="")=>(
   <div style={{ marginBottom:16 }}>
     <label style={{ fontSize:12,fontWeight:700,color:"#555",display:"block",marginBottom:5 }}>{label}</label>
     {type==="textarea"
       ?<textarea value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={placeholder} rows={4}
         style={{ width:"100%",border:"1.5px solid #e5e5e5",borderRadius:10,padding:"10px 14px",fontSize:14,outline:"none",boxSizing:"border-box",resize:"vertical",fontFamily:"inherit" }}/>
       :<input type={type} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={placeholder}
         style={{ width:"100%",border:"1.5px solid #e5e5e5",borderRadius:10,padding:"10px 14px",fontSize:14,outline:"none",boxSizing:"border-box" }}/>
     }
   </div>
 );
 if(submitted) return (
   <div style={{ maxWidth:600,margin:"80px auto",textAlign:"center",padding:"0 24px" }}>
     <div style={{ width:80,height:80,borderRadius:"50%",background:"#e8f5e9",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:36 }}>✓</div>
     <h2 style={{ fontWeight:800,color:"#388e3c",marginBottom:10 }}>Đăng tin thành công!</h2>
     <p style={{ color:"#666",marginBottom:24 }}>Tin đăng của bạn đang được xét duyệt và sẽ hiển thị trong vòng 24 giờ.</p>
     <button onClick={()=>setSubmitted(false)} style={{ background:"#dc322a",color:"white",border:"none",borderRadius:12,padding:"12px 32px",fontWeight:700,fontSize:15,cursor:"pointer" }}>Đăng tin mới</button>
   </div>
 );
 return (
   <div style={{ maxWidth:760,margin:"0 auto",padding:"28px 24px" }}>
     <h2 style={{ fontWeight:800,fontSize:22,color:"#1a1a1a",marginBottom:6 }}>Đăng tin cho thuê</h2>
     <p style={{ color:"#888",fontSize:14,marginBottom:28 }}>Điền đầy đủ thông tin để tìm người thuê nhanh hơn</p>
 
     <div style={{ background:"white",borderRadius:18,padding:"24px 28px",boxShadow:"0 2px 16px rgba(0,0,0,0.07)",marginBottom:20 }}>
       <h3 style={{ margin:"0 0 18px",fontSize:15,fontWeight:700,color:"#dc322a" }}>📍 Thông tin địa chỉ</h3>
       {F("Tiêu đề tin đăng *","title","text","VD: Phòng trọ cao cấp gần ĐH Bách Khoa")}
       <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
         <div>{F("Địa chỉ chi tiết *","address","text","Số nhà, tên đường")}</div>
         <div>
           <label style={{ fontSize:12,fontWeight:700,color:"#555",display:"block",marginBottom:5 }}>Quận/Huyện *</label>
           <select value={form.district} onChange={e=>setForm(f=>({...f,district:e.target.value}))} style={{ width:"100%",border:"1.5px solid #e5e5e5",borderRadius:10,padding:"10px 14px",fontSize:14,outline:"none",color:"#333" }}>
             <option value="">Chọn quận</option>
             {["Cầu Giấy","Đống Đa","Ba Đình","Hoàn Kiếm","Hai Bà Trưng","Hoàng Mai","Nam Từ Liêm","Bắc Từ Liêm","Thanh Xuân","Hà Đông"].map(d=><option key={d}>{d}</option>)}
           </select>
         </div>
       </div>
     </div>
 
     <div style={{ background:"white",borderRadius:18,padding:"24px 28px",boxShadow:"0 2px 16px rgba(0,0,0,0.07)",marginBottom:20 }}>
       <h3 style={{ margin:"0 0 18px",fontSize:15,fontWeight:700,color:"#dc322a" }}>🏠 Thông tin phòng</h3>
       <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
         <div>{F("Giá thuê (₫/tháng) *","price","text","VD: 3500000")}</div>
         <div>{F("Diện tích (m²) *","area","text","VD: 25")}</div>
         <div>
           <label style={{ fontSize:12,fontWeight:700,color:"#555",display:"block",marginBottom:5 }}>Số phòng ngủ</label>
           <select value={form.bedrooms} onChange={e=>setForm(f=>({...f,bedrooms:e.target.value}))} style={{ width:"100%",border:"1.5px solid #e5e5e5",borderRadius:10,padding:"10px 14px",fontSize:14,outline:"none" }}>
             {[1,2,3,4].map(n=><option key={n} value={n}>{n} phòng ngủ</option>)}
           </select>
         </div>
         <div>
           <label style={{ fontSize:12,fontWeight:700,color:"#555",display:"block",marginBottom:5 }}>Số WC</label>
           <select value={form.baths} onChange={e=>setForm(f=>({...f,baths:e.target.value}))} style={{ width:"100%",border:"1.5px solid #e5e5e5",borderRadius:10,padding:"10px 14px",fontSize:14,outline:"none" }}>
             {[1,2,3].map(n=><option key={n} value={n}>{n} WC</option>)}
           </select>
         </div>
         <div>{F("Tầng","floor","text","VD: 3")}</div>
         <div>{F("Số người tối đa","maxPeople","text","VD: 2")}</div>
       </div>
     </div>
 
     <div style={{ background:"white",borderRadius:18,padding:"24px 28px",boxShadow:"0 2px 16px rgba(0,0,0,0.07)",marginBottom:20 }}>
       <h3 style={{ margin:"0 0 18px",fontSize:15,fontWeight:700,color:"#dc322a" }}>⚡ Giá điện & nước</h3>
       <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14 }}>
         <div>{F("Giá điện (₫/kWh)","elecPrice","text","3500")}</div>
         <div>{F("Giá nước (₫/m³)","waterPrice","text","15000")}</div>
         <div>
           <label style={{ fontSize:12,fontWeight:700,color:"#555",display:"block",marginBottom:5 }}>Loại điện</label>
           <select value={form.elecType} onChange={e=>setForm(f=>({...f,elecType:e.target.value}))} style={{ width:"100%",border:"1.5px solid #e5e5e5",borderRadius:10,padding:"10px 14px",fontSize:14,outline:"none" }}>
             <option>Bình thường</option><option>Giờ thấp điểm</option><option>Giờ cao điểm</option>
           </select>
         </div>
       </div>
     </div>
 
     <div style={{ background:"white",borderRadius:18,padding:"24px 28px",boxShadow:"0 2px 16px rgba(0,0,0,0.07)",marginBottom:20 }}>
       <h3 style={{ margin:"0 0 16px",fontSize:15,fontWeight:700,color:"#dc322a" }}>✨ Tiện ích</h3>
       <div style={{ display:"flex",flexWrap:"wrap",gap:10 }}>
         {amenityList.map(a=>{
           const on=form.amenities.includes(a);
           return <button key={a} onClick={()=>toggleAmenity(a)} style={{ background:on?"#dc322a":"#f5f5f5",color:on?"white":"#555",border:"none",borderRadius:20,padding:"7px 14px",fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.15s" }}>{on?"✓ ":""}{a}</button>;
         })}
       </div>
     </div>
 
     <div style={{ background:"white",borderRadius:18,padding:"24px 28px",boxShadow:"0 2px 16px rgba(0,0,0,0.07)",marginBottom:20 }}>
       <h3 style={{ margin:"0 0 16px",fontSize:15,fontWeight:700,color:"#dc322a" }}>📷 Hình ảnh</h3>
       <div style={{ border:"2px dashed #fcc",borderRadius:14,padding:"32px 20px",textAlign:"center",cursor:"pointer",background:"#fff9f9" }} onClick={()=>document.getElementById("img-upload").click()}>
         <div style={{ fontSize:32,marginBottom:8 }}>📷</div>
         <p style={{ margin:0,color:"#888",fontSize:14 }}>Nhấn để tải ảnh lên <span style={{ color:"#dc322a",fontWeight:700 }}>(tối đa 6 ảnh)</span></p>
         <input id="img-upload" type="file" multiple accept="image/*" style={{ display:"none" }} onChange={e=>{
           const files=Array.from(e.target.files).slice(0,6);
           const urls=files.map(f=>URL.createObjectURL(f));
           setImgs(urls);
         }}/>
       </div>
       {imgs.length>0&&<div style={{ display:"flex",gap:8,flexWrap:"wrap",marginTop:12 }}>
         {imgs.map((url,i)=><img key={i} src={url} alt="" style={{ width:80,height:80,objectFit:"cover",borderRadius:8,border:"2px solid #fcc" }}/>)}
       </div>}
     </div>
 
     <div style={{ background:"white",borderRadius:18,padding:"24px 28px",boxShadow:"0 2px 16px rgba(0,0,0,0.07)",marginBottom:24 }}>
       <h3 style={{ margin:"0 0 14px",fontSize:15,fontWeight:700,color:"#dc322a" }}>📝 Mô tả thêm</h3>
       {F("Mô tả chi tiết","desc","textarea","Mô tả thêm về phòng, khu vực xung quanh, lưu ý cho người thuê...")}
     </div>
 
     <button onClick={()=>setSubmitted(true)} style={{ width:"100%",background:"#dc322a",color:"white",border:"none",borderRadius:14,padding:"16px",fontWeight:800,fontSize:16,cursor:"pointer",boxShadow:"0 4px 18px rgba(220,50,42,0.35)" }}>
       🚀 Đăng tin ngay
     </button>
   </div>
 );
}
 
// ===================== MANAGE TAB (TENANT VIEW) =====================
const MONTHLY_DATA = {
 "T3/2026": {
   elecPrev:1050, elecCurr:1190, elecUnit:3500,
   waterPrev:260, waterCurr:381, waterUnit:15000,
   roomPaid:true, dueDate:"05/03/2026",
   extras:[
     {id:1,desc:"Phí vệ sinh chung cư",amount:50000},
     {id:2,desc:"Phí gửi xe máy",amount:100000},
   ],
   services:[
     {name:"Internet cáp quang",amount:150000},
     {name:"Rác thải",amount:20000},
   ],
 },
 "T4/2026": {
   elecPrev:1190, elecCurr:1360, elecUnit:3500,
   waterPrev:381, waterCurr:510, waterUnit:15000,
   roomPaid:true, dueDate:"05/04/2026",
   extras:[
     {id:1,desc:"Phí vệ sinh chung cư",amount:50000},
     {id:2,desc:"Phí gửi xe máy",amount:100000},
     {id:3,desc:"Thay bóng đèn phòng",amount:80000},
   ],
   services:[
     {name:"Internet cáp quang",amount:150000},
     {name:"Rác thải",amount:20000},
   ],
 },
 "T5/2026": {
   elecPrev:1360, elecCurr:1540, elecUnit:3500,
   waterPrev:510, waterCurr:648, waterUnit:15000,
   roomPaid:true, dueDate:"05/05/2026",
   extras:[
     {id:1,desc:"Phí vệ sinh chung cư",amount:50000},
     {id:2,desc:"Phí gửi xe máy",amount:100000},
   ],
   services:[
     {name:"Internet cáp quang",amount:150000},
     {name:"Rác thải",amount:20000},
   ],
 },
 "T6/2026": {
   elecPrev:1540, elecCurr:1710, elecUnit:3500,
   waterPrev:648, waterCurr:797, waterUnit:15000,
   roomPaid:false, dueDate:"05/06/2026",
   extras:[
     {id:1,desc:"Phí vệ sinh chung cư",amount:50000},
     {id:2,desc:"Phí gửi xe máy",amount:100000},
     {id:3,desc:"Sửa vòi nước bị rỉ",amount:150000},
   ],
   services:[
     {name:"Internet cáp quang",amount:150000},
     {name:"Rác thải",amount:20000},
   ],
 },
};
 
function ManageTab() {
 const months = ["T3/2026","T4/2026","T5/2026","T6/2026"];
 const [activeMonth, setActiveMonth] = useState("T6/2026");
 const d = MONTHLY_DATA[activeMonth];
 
 const roomPrice = 3500000;
 const elecUsage = d.elecCurr - d.elecPrev;
 const elecCost = elecUsage * d.elecUnit;
 const waterUsage = d.waterCurr - d.waterPrev;
 const waterCost = waterUsage * d.waterUnit;
 const serviceTotal = d.services.reduce((s,x)=>s+x.amount,0);
 const extraTotal = d.extras.reduce((s,x)=>s+x.amount,0);
 const grandTotal = roomPrice + elecCost + waterCost + serviceTotal + extraTotal;
 
 // Contract info
 const contractStart = "01/01/2026";
 const contractEnd = "31/12/2026";
 const today = new Date();
 const endDate = new Date(2026,11,31);
 const diffMs = endDate - today;
 const diffDays = Math.max(0, Math.ceil(diffMs/(1000*60*60*24)));
 const diffMonths = Math.floor(diffDays/30);
 
 const Card = ({icon,label,value,sub,color="#1a3a5c",bg="white",border="1.5px solid #e8edf5"}) => (
   <div style={{background:bg,border,borderRadius:16,padding:"18px 20px",boxShadow:"0 2px 10px rgba(0,0,0,0.04)"}}>
     <div style={{fontSize:22,marginBottom:6}}>{icon}</div>
     <p style={{margin:"0 0 2px",fontSize:11,color:"#999",fontWeight:600,textTransform:"uppercase",letterSpacing:0.5}}>{label}</p>
     <p style={{margin:"0 0 2px",fontSize:20,fontWeight:800,color}}>{value}</p>
     {sub&&<p style={{margin:0,fontSize:11,color:"#aaa"}}>{sub}</p>}
   </div>
 );
 
 const Section = ({title,children}) => (
   <div style={{background:"white",borderRadius:16,padding:"20px 24px",boxShadow:"0 2px 12px rgba(0,0,0,0.05)",border:"1px solid #f0f0f0",marginBottom:16}}>
     <p style={{margin:"0 0 16px",fontWeight:800,fontSize:15,color:"#1a1a1a",display:"flex",alignItems:"center",gap:8}}>{title}</p>
     {children}
   </div>
 );
 
 const Row = ({label,value,bold,color}) => (
   <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #f8f8f8"}}>
     <span style={{fontSize:14,color:"#555"}}>{label}</span>
     <span style={{fontSize:14,fontWeight:bold?700:500,color:color||"#333"}}>{value}</span>
   </div>
 );
 
 return (
   <div style={{maxWidth:900,margin:"0 auto",padding:"28px 24px"}}>
     <h2 style={{fontWeight:800,fontSize:22,color:"#1a1a1a",marginBottom:6}}>Quản lý phòng trọ</h2>
     <p style={{color:"#888",fontSize:14,marginBottom:22}}>Phòng P.101 – 25 Nguyễn Hùng, Cầu Giấy, Hà Nội</p>
 
     {/* Month selector */}
     <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
       {months.map(m=>(
         <button key={m} onClick={()=>setActiveMonth(m)} style={{
           background:activeMonth===m?"#dc322a":"white",
           color:activeMonth===m?"white":"#555",
           border:`1.5px solid ${activeMonth===m?"#dc322a":"#e5e5e5"}`,
           borderRadius:10,padding:"8px 20px",fontWeight:700,fontSize:13,cursor:"pointer",
           transition:"all 0.15s",boxShadow:activeMonth===m?"0 4px 12px rgba(220,50,42,0.25)":"none"
         }}>{m}</button>
       ))}
     </div>
 
     {/* Contract + payment status banner */}
     <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
       <Card icon="🏠" label="Giá phòng" value={fmt(roomPrice)+"/tháng"} sub="Phòng P.101 – 25m²"/>
       <Card
         icon={d.roomPaid?"✅":"⚠️"}
         label="Tiền phòng tháng này"
         value={d.roomPaid?"Đã nộp":"Chưa nộp"}
         sub={`Hạn nộp: ${d.dueDate}`}
         color={d.roomPaid?"#388e3c":"#dc322a"}
         bg={d.roomPaid?"#f0fdf4":"#fff5f5"}
         border={`1.5px solid ${d.roomPaid?"#bbf7d0":"#fecaca"}`}
       />
       <Card
         icon="📅"
         label="Hợp đồng thuê"
         value={`Còn ${diffMonths} tháng`}
         sub={`${contractStart} → ${contractEnd} (${diffDays} ngày)`}
         color={diffMonths<=2?"#e65100":"#1a3a5c"}
       />
     </div>
 
     <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
       {/* Electricity */}
       <Section title="⚡ Chỉ số điện">
         <div style={{display:"flex",gap:10,marginBottom:14}}>
           <div style={{flex:1,background:"#f5f9ff",borderRadius:10,padding:"12px 16px",border:"1.5px solid #dbeafe"}}>
             <p style={{margin:"0 0 2px",fontSize:11,color:"#6b87a8",fontWeight:600}}>CHỈ SỐ CŨ</p>
             <p style={{margin:0,fontSize:20,fontWeight:800,color:"#1a3a5c"}}>{d.elecPrev} <span style={{fontSize:12,fontWeight:400,color:"#aaa"}}>kWh</span></p>
           </div>
           <div style={{display:"flex",alignItems:"center",color:"#aaa",fontSize:20}}>→</div>
           <div style={{flex:1,background:"#f5f9ff",borderRadius:10,padding:"12px 16px",border:"1.5px solid #dbeafe"}}>
             <p style={{margin:"0 0 2px",fontSize:11,color:"#6b87a8",fontWeight:600}}>CHỈ SỐ MỚI</p>
             <p style={{margin:0,fontSize:20,fontWeight:800,color:"#1a3a5c"}}>{d.elecCurr} <span style={{fontSize:12,fontWeight:400,color:"#aaa"}}>kWh</span></p>
           </div>
         </div>
         <Row label="Tiêu thụ" value={`${elecUsage} kWh`}/>
         <Row label="Đơn giá" value={`${d.elecUnit.toLocaleString("vi-VN")} ₫/kWh`}/>
         <Row label="Thành tiền" value={fmt(elecCost)} bold color="#dc322a"/>
       </Section>
 
       {/* Water */}
       <Section title="💧 Chỉ số nước">
         <div style={{display:"flex",gap:10,marginBottom:14}}>
           <div style={{flex:1,background:"#f0f9ff",borderRadius:10,padding:"12px 16px",border:"1.5px solid #bae6fd"}}>
             <p style={{margin:"0 0 2px",fontSize:11,color:"#0369a1",fontWeight:600}}>CHỈ SỐ CŨ</p>
             <p style={{margin:0,fontSize:20,fontWeight:800,color:"#0c4a6e"}}>{d.waterPrev} <span style={{fontSize:12,fontWeight:400,color:"#aaa"}}>m³</span></p>
           </div>
           <div style={{display:"flex",alignItems:"center",color:"#aaa",fontSize:20}}>→</div>
           <div style={{flex:1,background:"#f0f9ff",borderRadius:10,padding:"12px 16px",border:"1.5px solid #bae6fd"}}>
             <p style={{margin:"0 0 2px",fontSize:11,color:"#0369a1",fontWeight:600}}>CHỈ SỐ MỚI</p>
             <p style={{margin:0,fontSize:20,fontWeight:800,color:"#0c4a6e"}}>{d.waterCurr} <span style={{fontSize:12,fontWeight:400,color:"#aaa"}}>m³</span></p>
           </div>
         </div>
         <Row label="Tiêu thụ" value={`${waterUsage} m³`}/>
         <Row label="Đơn giá" value={`${d.waterUnit.toLocaleString("vi-VN")} ₫/m³`}/>
         <Row label="Thành tiền" value={fmt(waterCost)} bold color="#0369a1"/>
       </Section>
     </div>
 
     <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
       {/* Services */}
       <Section title="🛎️ Dịch vụ hàng tháng">
         {d.services.map((s,i)=>(
           <Row key={i} label={s.name} value={fmt(s.amount)}/>
         ))}
         <Row label="Tổng dịch vụ" value={fmt(serviceTotal)} bold color="#6b21a8"/>
       </Section>
 
       {/* Extra charges */}
       <Section title="📋 Khoản phát sinh">
         {d.extras.length===0
           ? <p style={{color:"#bbb",fontSize:13,textAlign:"center",padding:"12px 0"}}>Không có khoản phát sinh</p>
           : d.extras.map((e,i)=>(
             <div key={e.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid #f8f8f8"}}>
               <span style={{fontSize:13,color:"#555"}}>{e.desc}</span>
               <span style={{fontSize:13,fontWeight:600,color:"#e65100"}}>{fmt(e.amount)}</span>
             </div>
           ))
         }
         {d.extras.length>0&&<Row label="Tổng phát sinh" value={fmt(extraTotal)} bold color="#e65100"/>}
       </Section>
     </div>
 
     {/* Total bill summary */}
     <div style={{background:"linear-gradient(135deg,#dc322a 0%,#ff6b6b 100%)",borderRadius:18,padding:"24px 28px",boxShadow:"0 6px 24px rgba(220,50,42,0.25)"}}>
       <p style={{margin:"0 0 16px",fontWeight:800,fontSize:16,color:"white"}}>💳 Tổng hóa đơn tháng {activeMonth}</p>
       <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginBottom:20}}>
         {[
           {label:"Tiền phòng",value:fmt(roomPrice)},
           {label:"Tiền điện",value:fmt(elecCost)},
           {label:"Tiền nước",value:fmt(waterCost)},
           {label:"Dịch vụ + Phát sinh",value:fmt(serviceTotal+extraTotal)},
         ].map(({label,value})=>(
           <div key={label} style={{background:"rgba(255,255,255,0.15)",borderRadius:12,padding:"12px 14px"}}>
             <p style={{margin:"0 0 4px",fontSize:11,color:"rgba(255,255,255,0.75)",fontWeight:600}}>{label}</p>
             <p style={{margin:0,fontSize:14,fontWeight:700,color:"white"}}>{value}</p>
           </div>
         ))}
       </div>
       <div style={{borderTop:"1px solid rgba(255,255,255,0.25)",paddingTop:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
         <div>
           <p style={{margin:"0 0 2px",fontSize:13,color:"rgba(255,255,255,0.8)"}}>Tổng cần nộp</p>
           <p style={{margin:0,fontSize:28,fontWeight:900,color:"white"}}>{fmt(grandTotal)}</p>
         </div>
         <div style={{textAlign:"right"}}>
           <span style={{
             background:d.roomPaid?"rgba(255,255,255,0.2)":"white",
             color:d.roomPaid?"white":"#dc322a",
             borderRadius:10,padding:"10px 22px",fontWeight:800,fontSize:14,
             border:d.roomPaid?"1.5px solid rgba(255,255,255,0.4)":"none"
           }}>
             {d.roomPaid?"✓ Đã thanh toán":"⚠ Chưa thanh toán"}
           </span>
         </div>
       </div>
     </div>
   </div>
 );
}
 
// ===================== CHAT TAB =====================
function ChatTab({ initContact }) {
 const [contacts,setContacts]=useState(INIT_CONTACTS);
 const [messages,setMessages]=useState(INIT_MESSAGES);
 const [active,setActive]=useState(()=>initContact?INIT_CONTACTS.find(c=>c.phone===initContact.phone)||INIT_CONTACTS[0]:INIT_CONTACTS[0]);
 const [input,setInput]=useState("");
 const [emoji,setEmoji]=useState(false);
 const bottomRef=useRef(null);
 const emojis=["😊","😂","❤️","👍","🙏","😍","🥰","😢","😎","🤔","👋","🎉"];
 
 useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages,active]);
 
 const selectContact=c=>{setActive(c);setContacts(p=>p.map(x=>x.id===c.id?{...x,unread:0}:x));};
 const send=()=>{
   if(!input.trim())return;
   const msg={id:Date.now(),from:"me",text:input};
   setMessages(p=>({...p,[active.id]:[...(p[active.id]||[]),msg]}));
   setContacts(p=>p.map(c=>c.id===active.id?{...c,msg:input,time:"Vừa xong"}:c));
   setInput(""); setEmoji(false);
 };
 
 const pinned=contacts.filter(c=>c.pinned);
 const today=contacts.filter(c=>!c.pinned);
 const activeMessages=messages[active?.id]||[];
 
 return (
   <div style={{ display:"flex",height:"calc(100vh - 62px)",overflow:"hidden",background:"#f5f5f7" }}>
     {/* Contacts */}
     <div style={{ width:272,background:"white",borderRight:"1px solid #f0f0f0",display:"flex",flexDirection:"column",flexShrink:0 }}>
       <div style={{ padding:"14px 14px 8px",borderBottom:"1px solid #f5f5f5" }}>
         <p style={{ margin:"0 0 10px",fontWeight:800,fontSize:16,color:"#1a1a1a" }}>Tin nhắn</p>
         <div style={{ display:"flex",alignItems:"center",background:"#f5f5f7",borderRadius:20,padding:"8px 14px",gap:8 }}>
           <SearchIconGray/>
           <input placeholder="Tìm kiếm..." style={{ border:"none",background:"transparent",outline:"none",fontSize:13,width:"100%",color:"#333" }}/>
         </div>
       </div>
       <div style={{ flex:1,overflowY:"auto" }}>
         {pinned.length>0&&<>
           <div style={{ padding:"10px 16px 4px",fontSize:10,fontWeight:700,color:"#ccc",letterSpacing:1 }}>ĐÃ GHIM</div>
           {pinned.map(c=><ContactRow key={c.id} c={c} active={active?.id===c.id} onClick={()=>selectContact(c)}/>)}
         </>}
         <div style={{ padding:"10px 16px 4px",fontSize:10,fontWeight:700,color:"#ccc",letterSpacing:1 }}>HÔM NAY</div>
         {today.map(c=><ContactRow key={c.id} c={c} active={active?.id===c.id} onClick={()=>selectContact(c)}/>)}
       </div>
     </div>
 
     {/* Chat window */}
     <div style={{ flex:1,display:"flex",flexDirection:"column",minWidth:0 }}>
       <div style={{ padding:"12px 20px",borderBottom:"1px solid #f0f0f0",background:"white",display:"flex",alignItems:"center",gap:12,flexShrink:0 }}>
         <div style={{ width:40,height:40,borderRadius:"50%",background:"#f5e5e5",display:"flex",alignItems:"center",justifyContent:"center",color:"#dc322a" }}><UserIcon/></div>
         <div style={{ flex:1 }}>
           <p style={{ margin:0,fontWeight:700,fontSize:15 }}>{active?.name}</p>
           <p style={{ margin:0,fontSize:11,color:"#aaa" }}>{active?.phone} • Đang hoạt động</p>
         </div>
         <button style={{ background:"none",border:"1px solid #e5e5e5",borderRadius:8,padding:"6px 14px",color:"#555",fontSize:12,fontWeight:600,cursor:"pointer" }}>📞 Gọi</button>
       </div>
 
       <div style={{ flex:1,overflowY:"auto",padding:"20px 24px",display:"flex",flexDirection:"column",gap:10,background:"#f9f9fb" }}>
         <div style={{ textAlign:"center",fontSize:11,color:"#ccc",marginBottom:4 }}>Hôm nay • {new Date().toLocaleDateString("vi-VN")}</div>
         {activeMessages.map((m,i)=>{
           const prevSame=i>0&&activeMessages[i-1].from===m.from;
           return(
             <div key={m.id} style={{ display:"flex",justifyContent:m.from==="me"?"flex-end":"flex-start",alignItems:"flex-end",gap:8,marginTop:prevSame?2:8 }}>
               {m.from==="them"&&!prevSame&&<div style={{ width:32,height:32,borderRadius:"50%",background:"#f5e5e5",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#dc322a" }}><UserIcon/></div>}
               {m.from==="them"&&prevSame&&<div style={{ width:32,flexShrink:0 }}/>}
               <div style={{ maxWidth:"60%",padding:"10px 14px",borderRadius:m.from==="me"?"18px 4px 18px 18px":"4px 18px 18px 18px",background:m.from==="me"?"#dc322a":"white",color:m.from==="me"?"white":"#333",fontSize:14,lineHeight:1.5,boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
                 {m.text}
               </div>
             </div>
           );
         })}
         <div ref={bottomRef}/>
       </div>
 
       {/* Emoji picker */}
       {emoji&&<div style={{ padding:"10px 20px",background:"white",borderTop:"1px solid #f0f0f0",display:"flex",gap:8,flexWrap:"wrap" }}>
         {emojis.map(e=><button key={e} onClick={()=>setInput(i=>i+e)} style={{ background:"none",border:"none",fontSize:22,cursor:"pointer",padding:"2px 4px" }}>{e}</button>)}
       </div>}
 
       <div style={{ padding:"12px 20px",background:"white",borderTop:"1px solid #f0f0f0",display:"flex",gap:10,alignItems:"center",flexShrink:0 }}>
         <button onClick={()=>setEmoji(v=>!v)} style={{ background:"none",border:"none",cursor:"pointer",fontSize:20,color:emoji?"#dc322a":"#bbb",padding:0 }}>😊</button>
         <button style={{ background:"none",border:"none",cursor:"pointer",color:"#bbb",fontSize:20,padding:0 }}>📎</button>
         <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
           placeholder="Nhập tin nhắn..." style={{ flex:1,border:"1.5px solid #eee",borderRadius:22,padding:"10px 18px",fontSize:14,outline:"none",background:"#fafafa" }}/>
         <button onClick={send} style={{ background:"#dc322a",border:"none",borderRadius:"50%",width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0 }}><SendIcon/></button>
         <button style={{ background:"none",border:"none",cursor:"pointer",color:"#bbb" }}><MicIcon/></button>
       </div>
     </div>
 
     {/* Right panel */}
     <div style={{ width:180,background:"white",borderLeft:"1px solid #f0f0f0",padding:"20px 14px",flexShrink:0 }}>
       {[{k:"Dashboard",icon:"🏠"},{k:"Tin nhắn",icon:"💬"},{k:"Video Call",icon:"📹"},{k:"Danh bạ",icon:"📋"},{k:"Ghi chú",icon:"📝"},{k:"Cài đặt",icon:"⚙️"}].map(({k,icon})=>(
         <div key={k} style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 12px",borderRadius:10,marginBottom:4,cursor:"pointer",background:k==="Tin nhắn"?"#fff0f0":"transparent",color:k==="Tin nhắn"?"#dc322a":"#666",fontWeight:k==="Tin nhắn"?700:500,fontSize:13 }}>
           <span>{icon}</span>{k}
         </div>
       ))}
     </div>
   </div>
 );
}
 
function ContactRow({c,active,onClick}) {
 return(
   <div onClick={onClick} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer",background:active?"#fff0f0":"transparent",borderRadius:10,margin:"2px 8px",transition:"background 0.15s" }}>
     <div style={{ position:"relative",flexShrink:0 }}>
       <div style={{ width:38,height:38,borderRadius:"50%",background:active?"#ffd5d5":"#f0f0f0",display:"flex",alignItems:"center",justifyContent:"center",color:active?"#dc322a":"#888" }}><UserIcon/></div>
       {c.unread>0&&<span style={{ position:"absolute",top:-2,right:-2,background:"#dc322a",color:"white",borderRadius:"50%",width:16,height:16,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700 }}>{c.unread}</span>}
     </div>
     <div style={{ flex:1,minWidth:0 }}>
       <div style={{ display:"flex",justifyContent:"space-between",alignItems:"baseline" }}>
         <span style={{ fontWeight:600,fontSize:13,color:"#222" }}>{c.name}</span>
         <span style={{ fontSize:10,color:"#ccc",flexShrink:0,marginLeft:4 }}>{c.time}</span>
       </div>
       <p style={{ margin:0,fontSize:11,color:"#aaa",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{c.msg}</p>
     </div>
   </div>
 );
}
 
// ===================== PROFILE TAB =====================
function ProfileTab({ isLoggedIn, onLoginClick }) {
 const [editing,setEditing]=useState(false);
 const [profile,setProfile]=useState({ name:"Nguyễn Văn A",email:"nguyenvana@gmail.com",phone:"0901234567",dob:"01/01/1995",gender:"Nam",address:"Hà Nội",bio:"Chủ trọ tại Cầu Giấy, Hà Nội. Có 5 phòng cho thuê." });
 const [saved,setSaved]=useState(false);
 
 if(!isLoggedIn) return(
   <div style={{ maxWidth:500,margin:"80px auto",textAlign:"center",padding:"0 24px" }}>
     <div style={{ fontSize:60,marginBottom:20 }}>👤</div>
     <h2 style={{ fontWeight:800,color:"#1a1a1a",marginBottom:10 }}>Đăng nhập để xem hồ sơ</h2>
     <p style={{ color:"#888",marginBottom:24 }}>Bạn cần đăng nhập để truy cập trang cá nhân.</p>
     <button onClick={onLoginClick} style={{ background:"#dc322a",color:"white",border:"none",borderRadius:14,padding:"14px 40px",fontWeight:800,fontSize:16,cursor:"pointer" }}>Đăng nhập ngay</button>
   </div>
 );
 
 const save=()=>{ setSaved(true); setEditing(false); setTimeout(()=>setSaved(false),3000); };
 const F2=(label,key)=>(
   <div style={{ marginBottom:16 }}>
     <label style={{ fontSize:12,fontWeight:700,color:"#888",display:"block",marginBottom:5 }}>{label}</label>
     {editing
       ?<input value={profile[key]} onChange={e=>setProfile(p=>({...p,[key]:e.target.value}))} style={{ width:"100%",border:"1.5px solid #dc322a",borderRadius:10,padding:"10px 14px",fontSize:14,outline:"none",boxSizing:"border-box" }}/>
       :<div style={{ border:"1.5px solid #f0f0f0",borderRadius:10,padding:"10px 14px",fontSize:14,color:"#333",background:"#fafafa" }}>{profile[key]}</div>
     }
   </div>
 );
 
 return(
   <div style={{ maxWidth:800,margin:"0 auto",padding:"28px 24px" }}>
     {saved&&<div style={{ background:"#e8f5e9",border:"1.5px solid #a5d6a7",borderRadius:12,padding:"12px 20px",marginBottom:20,color:"#388e3c",fontWeight:700,display:"flex",alignItems:"center",gap:8 }}><CheckIcon/> Đã lưu thông tin thành công!</div>}
 
     <div style={{ display:"grid",gridTemplateColumns:"1fr 2fr",gap:24 }}>
       {/* Left: avatar & stats */}
       <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
         <div style={{ background:"white",borderRadius:18,padding:24,boxShadow:"0 2px 14px rgba(0,0,0,0.06)",textAlign:"center" }}>
           <div style={{ position:"relative",display:"inline-block",marginBottom:16 }}>
             <div style={{ width:90,height:90,borderRadius:"50%",background:"linear-gradient(135deg,#dc322a,#ff6b6b)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto",boxShadow:"0 4px 16px rgba(220,50,42,0.3)" }}>
               <span style={{ fontSize:36,color:"white",fontWeight:700 }}>{profile.name[0]}</span>
             </div>
             {editing&&<button style={{ position:"absolute",bottom:0,right:0,background:"#dc322a",border:"2px solid white",borderRadius:"50%",width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"white" }}><CameraIcon/></button>}
           </div>
           <p style={{ margin:"0 0 4px",fontWeight:800,fontSize:17,color:"#1a1a1a" }}>{profile.name}</p>
           <p style={{ margin:"0 0 16px",fontSize:13,color:"#888" }}>Chủ nhà</p>
           <div style={{ display:"flex",gap:4 }}>
             {[1,2,3,4,5].map(i=><StarIcon key={i} filled={i<=4}/>)}
             <span style={{ fontSize:12,color:"#888",marginLeft:4 }}>4.0</span>
           </div>
         </div>
 
         <div style={{ background:"white",borderRadius:18,padding:20,boxShadow:"0 2px 14px rgba(0,0,0,0.06)" }}>
           <p style={{ margin:"0 0 14px",fontWeight:700,fontSize:14,color:"#333" }}>Thống kê</p>
           {[{label:"Phòng đang cho thuê",value:"5"},{label:"Tổng khách thuê",value:"12"},{label:"Đánh giá",value:"4.0/5.0"},{label:"Tham gia",value:"01/2024"}].map(({label,value})=>(
             <div key={label} style={{ display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f5f5f5" }}>
               <span style={{ fontSize:12,color:"#888" }}>{label}</span>
               <span style={{ fontSize:13,fontWeight:700,color:"#dc322a" }}>{value}</span>
             </div>
           ))}
         </div>
 
         <div style={{ background:"white",borderRadius:18,padding:20,boxShadow:"0 2px 14px rgba(0,0,0,0.06)" }}>
           <p style={{ margin:"0 0 12px",fontWeight:700,fontSize:14,color:"#333" }}>Tin đã đăng</p>
           {ALL_LISTINGS.slice(0,3).map(l=>(
             <div key={l.id} style={{ display:"flex",gap:10,marginBottom:10,padding:"8px",background:"#fafafa",borderRadius:10 }}>
               <img src={l.img} style={{ width:44,height:44,borderRadius:8,objectFit:"cover",flexShrink:0 }}/>
               <div style={{ minWidth:0 }}>
                 <p style={{ margin:0,fontSize:12,fontWeight:700,color:"#333",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{l.address}</p>
                 <p style={{ margin:0,fontSize:11,color:"#dc322a",fontWeight:700 }}>{fmt(l.price)}/tháng</p>
               </div>
             </div>
           ))}
         </div>
       </div>
 
       {/* Right: profile form */}
       <div style={{ background:"white",borderRadius:18,padding:"24px 28px",boxShadow:"0 2px 14px rgba(0,0,0,0.06)" }}>
         <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22 }}>
           <h2 style={{ margin:0,fontWeight:800,fontSize:18 }}>Thông tin cá nhân</h2>
           {!editing
             ?<button onClick={()=>setEditing(true)} style={{ display:"flex",alignItems:"center",gap:6,background:"none",border:"1.5px solid #dc322a",borderRadius:10,padding:"8px 16px",color:"#dc322a",fontWeight:700,fontSize:13,cursor:"pointer" }}><EditIcon/>Chỉnh sửa</button>
             :<div style={{ display:"flex",gap:8 }}>
               <button onClick={()=>setEditing(false)} style={{ background:"none",border:"1.5px solid #ccc",borderRadius:10,padding:"8px 16px",color:"#666",fontWeight:700,fontSize:13,cursor:"pointer" }}>Hủy</button>
               <button onClick={save} style={{ background:"#dc322a",border:"none",borderRadius:10,padding:"8px 18px",color:"white",fontWeight:700,fontSize:13,cursor:"pointer" }}>💾 Lưu</button>
             </div>
           }
         </div>
         <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 18px" }}>
           <div>{F2("Họ và tên","name")}</div>
           <div>{F2("Email","email")}</div>
           <div>{F2("Số điện thoại","phone")}</div>
           <div>{F2("Ngày sinh","dob")}</div>
           <div>
             <label style={{ fontSize:12,fontWeight:700,color:"#888",display:"block",marginBottom:5 }}>Giới tính</label>
             {editing
               ?<select value={profile.gender} onChange={e=>setProfile(p=>({...p,gender:e.target.value}))} style={{ width:"100%",border:"1.5px solid #dc322a",borderRadius:10,padding:"10px 14px",fontSize:14,outline:"none",marginBottom:16 }}>
                 {["Nam","Nữ","Khác"].map(g=><option key={g}>{g}</option>)}
               </select>
               :<div style={{ border:"1.5px solid #f0f0f0",borderRadius:10,padding:"10px 14px",fontSize:14,color:"#333",background:"#fafafa",marginBottom:16 }}>{profile.gender}</div>
             }
           </div>
           <div>{F2("Địa chỉ","address")}</div>
         </div>
         <div>
           <label style={{ fontSize:12,fontWeight:700,color:"#888",display:"block",marginBottom:5 }}>Giới thiệu</label>
           {editing
             ?<textarea value={profile.bio} onChange={e=>setProfile(p=>({...p,bio:e.target.value}))} rows={3} style={{ width:"100%",border:"1.5px solid #dc322a",borderRadius:10,padding:"10px 14px",fontSize:14,outline:"none",boxSizing:"border-box",resize:"vertical",fontFamily:"inherit" }}/>
             :<div style={{ border:"1.5px solid #f0f0f0",borderRadius:10,padding:"10px 14px",fontSize:14,color:"#333",background:"#fafafa",minHeight:60 }}>{profile.bio}</div>
           }
         </div>
 
         {/* Security */}
         <div style={{ marginTop:24,paddingTop:24,borderTop:"1px solid #f0f0f0" }}>
           <p style={{ margin:"0 0 14px",fontWeight:700,fontSize:15 }}>Bảo mật & Đăng nhập</p>
           <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
             {["Đổi mật khẩu","Xác thực 2 bước","Liên kết tài khoản Google","Liên kết Facebook"].map(item=>(
               <div key={item} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:"#fafafa",borderRadius:10,border:"1px solid #f0f0f0" }}>
                 <span style={{ fontSize:14,color:"#333" }}>{item}</span>
                 <button style={{ background:"none",border:"1px solid #e5e5e5",borderRadius:8,padding:"5px 14px",color:"#555",fontSize:12,fontWeight:600,cursor:"pointer" }}>Cài đặt</button>
               </div>
             ))}
           </div>
         </div>
       </div>
     </div>
   </div>
 );
}
 
// ===================== HELPERS =====================
function RedBtn({children,onClick}) {
 const [hov,setHov]=useState(false);
 return(<button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{ background:hov?"#b82820":"#dc322a",color:"white",border:"none",borderRadius:10,padding:"9px 18px",fontWeight:700,fontSize:13,cursor:"pointer",transition:"background 0.15s",whiteSpace:"nowrap" }}>{children}</button>);
}
 
// ===================== NAVBAR =====================
function Navbar({tab,setTab,isLoggedIn,onLoginClick,onLogout}) {
 const navLinks=["Home","Post","Manage","Chat","Profile"];
 return(
   <nav style={{ background:"#dc322a",display:"flex",alignItems:"center",padding:"0 32px",height:62,position:"sticky",top:0,zIndex:50,boxShadow:"0 2px 12px rgba(180,30,22,0.2)" }}>
     <span style={{ fontWeight:900,fontSize:22,color:"white",letterSpacing:-0.5,marginRight:32,cursor:"pointer" }} onClick={()=>setTab("Home")}>
       RENT<span style={{ color:"#ffdc00" }}>+</span>
     </span>
     <div style={{ display:"flex",gap:4,flex:1,alignItems:"center" }}>
       {navLinks.map(link=>(
         <button key={link} onClick={()=>setTab(link)} style={{ background:"none",border:link===tab?"2px solid white":"2px solid transparent",borderRadius:20,color:"white",fontWeight:link===tab?700:500,fontSize:14,padding:"5px 14px",cursor:"pointer",transition:"border 0.15s" }}>{link}</button>
       ))}
     </div>
     {isLoggedIn?(
       <div style={{ display:"flex",alignItems:"center",gap:10 }}>
         <span style={{ color:"white",fontWeight:600,fontSize:14 }}>Xin chào, Văn A!</span>
         <div style={{ width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"white" }}><UserIcon/></div>
         <div style={{ width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"white",position:"relative" }}>
           <BellIcon/>
           <span style={{ position:"absolute",top:6,right:6,width:8,height:8,background:"#ffdc00",borderRadius:"50%" }}/>
         </div>
         <button onClick={onLogout} style={{ background:"rgba(255,255,255,0.15)",border:"1.5px solid rgba(255,255,255,0.5)",borderRadius:20,color:"white",fontWeight:600,fontSize:12,padding:"6px 14px",cursor:"pointer" }}>Đăng xuất</button>
       </div>
     ):(
       <button onClick={onLoginClick} style={{ background:"white",border:"2px solid white",borderRadius:20,color:"#dc322a",fontWeight:800,fontSize:13,padding:"7px 20px",cursor:"pointer",letterSpacing:0.5 }}>LOG IN</button>
     )}
   </nav>
 );
}
 
// ===================== FOOTER =====================
function Footer() {
 return(
   <footer style={{ borderTop:"1px solid #e5e5e5",background:"white",padding:"36px 60px 28px" }}>
     <div style={{ display:"flex",gap:40,maxWidth:900,margin:"0 auto" }}>
       <div style={{ flex:1 }}>
         <p style={{ fontWeight:800,fontSize:20,color:"#dc322a",margin:"0 0 6px" }}>RENT<span style={{ color:"#ffdc00" }}>+</span></p>
         <p style={{ margin:"0 0 14px",fontSize:12,color:"#aaa" }}>Nền tảng cho thuê phòng trọ uy tín</p>
         <div style={{ display:"flex",gap:10 }}>
           {["f","in","▶","ig"].map(s=><div key={s} style={{ width:30,height:30,borderRadius:"50%",background:"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:11,color:"#555",fontWeight:700 }}>{s}</div>)}
         </div>
       </div>
       {[{title:"Dịch vụ",items:["Đăng tin","Tìm phòng","Quản lý phòng","Hóa đơn"]},{title:"Hỗ trợ",items:["Câu hỏi thường gặp","Liên hệ","Hướng dẫn","Phản hồi"]},{title:"Pháp lý",items:["Điều khoản","Riêng tư","Cookie","Bảo mật"]}].map(({title,items})=>(
         <div key={title} style={{ flex:1 }}>
           <p style={{ fontWeight:700,fontSize:13,color:"#1a1a1a",marginBottom:10 }}>{title}</p>
           {items.map(p=><p key={p} style={{ color:"#aaa",fontSize:13,marginBottom:6,cursor:"pointer" }}>{p}</p>)}
         </div>
       ))}
     </div>
     <div style={{ maxWidth:900,margin:"20px auto 0",paddingTop:20,borderTop:"1px solid #f0f0f0",fontSize:12,color:"#ccc",textAlign:"center" }}>
       © 2026 RENT+. Bảo lưu mọi quyền.
     </div>
   </footer>
 );
}
 
// ===================== APP =====================
export default function App() {
 const [tab,setTab]=useState("Home");
 const [isLoggedIn,setIsLoggedIn]=useState(false);
 const [modal,setModal]=useState(null);
 const [chatInit,setChatInit]=useState(null);
 
 const goToChat=listing=>{ setChatInit(listing); setTab("Chat"); };
 
 const renderTab=()=>{
   switch(tab){
     case "Home": return <HomeTab onChatWithListing={goToChat}/>;
     case "Post": return <PostTab/>;
     case "Manage": return <ManageTab/>;
     case "Chat": return <ChatTab key={chatInit?.id} initContact={chatInit}/>;
     case "Profile": return <ProfileTab isLoggedIn={isLoggedIn} onLoginClick={()=>setModal("login")}/>;
     default: return null;
   }
 };
 
 return(
   <div style={{ fontFamily:"'Segoe UI','Helvetica Neue',sans-serif",background:"#f5f5f7",minHeight:"100vh" }}>
     <Navbar tab={tab} setTab={setTab} isLoggedIn={isLoggedIn} onLoginClick={()=>setModal("login")} onLogout={()=>setIsLoggedIn(false)}/>
     {renderTab()}
     {tab!=="Chat"&&<Footer/>}
     {modal&&<AuthModal mode={modal} onClose={()=>setModal(null)} onSwitch={()=>setModal(m=>m==="login"?"signup":"login")} onAuth={()=>{ setIsLoggedIn(true); setModal(null); }}/>}
   </div>
 );
}
