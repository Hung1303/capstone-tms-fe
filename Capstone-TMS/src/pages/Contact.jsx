import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import CentersMap from '../components/CentersMap';

const Contact = () => (
    <>
        <NavBar />
        <main className="max-w-6xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-amber-700 mb-2">Liên hệ</h1>
                <h2 className="text-base text-amber-900/80 max-w-xl mx-auto">
                    Chúng tôi luôn trân trọng ý kiến khách hàng để hoàn thiện dịch vụ mỗi ngày
                </h2>
            </div>
            <div className="mb-12"> 
                <div className="max-w-3xl mx-auto"> 
                    <h3 className="text-xl font-bold mb-3 text-orange-600">Thông tin liên hệ</h3>
                    <ul className="space-y-2 text-gray-700 text-base">
                        <li className="flex items-start gap-2">
                            <span className="font-semibold w-24 flex-shrink-0">Website:</span>
                            <span>Linkdemo.com - Nền tảng Kết nối Trung tâm Dạy kèm Được Cấp phép</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-semibold w-24 flex-shrink-0">Địa chỉ:</span>
                            <span>7 Đ. D1, Long Thạnh Mỹ, Thủ Đức, Hồ Chí Minh</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-semibold w-24 flex-shrink-0">Điện thoại:</span>
                            <a href="tel:0123123321" className="hover:text-orange-600">0123 123 321</a>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-semibold w-24 flex-shrink-0">Email:</span>
                            <a href="mailto:TT@gmail.com" className="hover:text-orange-600">TT@gmail.com</a>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-semibold w-24 flex-shrink-0">Thời gian:</span>
                            <span>Thứ 2 - Chủ nhật 08:00 - 22:00</span>
                        </li>
                    </ul>
                </div>
            </div>
            
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">Vị trí trung tâm</h2>
                <CentersMap style={{ height: '350px' }} showHeader={false} />
            </div>
        </main>
        <Footer />
    </>
);
export default Contact;