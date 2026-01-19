import { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQ = () => {
	const [activeIndex, setActiveIndex] = useState(null);

	const faqData = [
		{
			id: 1,
			category: 'Thông tư 29',
			question: 'Thông tư 29 là gì và có hiệu lực từ khi nào?',
			answer: 'Thông tư 29/2021/TT-BGDĐT là thông tư của Bộ Giáo dục và Đào tạo quy định về hoạt động dạy thêm, học thêm ngoài nhà trường. Thông tư có hiệu lực từ ngày 01/01/2022. Thông tư này nhằm quản lý, kiểm soát và bảo vệ quyền lợi của học sinh, phụ huynh trong hoạt động dạy thêm.'
		},
		{
			id: 2,
			category: 'Thông tư 29',
			question: 'Những hình thức dạy thêm nào bị cấm theo Thông tư 29?',
			answer: 'Theo Thông tư 29, các hình thức dạy thêm bị cấm bao gồm: (1) Giáo viên dạy thêm cho học sinh của lớp mình tại nhà riêng hoặc địa điểm khác; (2) Dạy thêm tập trung quá nhiều học sinh (không rõ ràng về số lượng); (3) Dạy thêm các môn học không phù hợp với chương trình; (4) Dạy thêm có mục đích lợi dụng để thu lợi bất chính.'
		},
		{
			id: 3,
			category: 'Thông tư 29',
			question: 'Giáo viên có được dạy thêm theo Thông tư 29 không?',
			answer: 'Có, giáo viên được phép dạy thêm nhưng phải tuân thủ các điều kiện: (1) Phải được cơ sở giáo dục nơi công tác cho phép; (2) Không được dạy thêm cho học sinh của lớp mình; (3) Phải đăng ký với cơ sở giáo dục; (4) Không được ảnh hưởng đến công việc giảng dạy chính tại trường; (5) Phải tuân thủ các quy định về đạo đức nhà giáo.'
		},
		{
			id: 4,
			category: 'Dạy thêm Việt Nam',
			question: 'Dạy thêm có bắt buộc không?',
			answer: 'Không, dạy thêm hoàn toàn tự nguyện. Phụ huynh và học sinh có quyền lựa chọn có tham gia dạy thêm hay không. Nhà trường không được bắt buộc học sinh tham gia dạy thêm hoặc ép phụ huynh phải trả tiền dạy thêm. Nếu có trường hợp bắt buộc, phụ huynh có quyền khiếu nại.'
		},
		{
			id: 5,
			category: 'Dạy thêm Việt Nam',
			question: 'Giá dạy thêm có được quy định cụ thể không?',
			answer: 'Giá dạy thêm không được quy định cụ thể trong Thông tư 29, nhưng phải phù hợp với điều kiện kinh tế địa phương và khả năng chi trả của phụ huynh. Các cơ sở dạy thêm phải công khai giá cả, không được tăng giá đột ngột hoặc lợi dụng để thu lợi bất chính. Phụ huynh có quyền thương lượng và từ chối nếu giá quá cao.'
		},
		{
			id: 6,
			category: 'Dạy thêm Việt Nam',
			question: 'Cơ sở dạy thêm cần những điều kiện gì để hoạt động hợp pháp?',
			answer: 'Cơ sở dạy thêm cần: (1) Đăng ký với cơ quan quản lý giáo dục địa phương; (2) Có giáo viên đủ tiêu chuẩn và có bằng cấp phù hợp; (3) Cơ sở vật chất đảm bảo an toàn, vệ sinh; (4) Có chương trình dạy rõ ràng, phù hợp với chương trình quốc gia; (5) Công khai giá cả và các điều khoản dịch vụ; (6) Có bảo hiểm trách nhiệm dân sự.'
		},
		{
			id: 7,
			category: 'Dạy thêm Việt Nam',
			question: 'Phụ huynh nên lưu ý gì khi chọn cơ sở dạy thêm?',
			answer: 'Phụ huynh nên: (1) Kiểm tra xem cơ sở có đăng ký hợp pháp không; (2) Tìm hiểu về trình độ và kinh nghiệm của giáo viên; (3) Xem xét chương trình dạy có phù hợp với nhu cầu con em không; (4) So sánh giá cả giữa các cơ sở; (5) Đọc kỹ hợp đồng trước khi ký; (6) Yêu cầu biên lai thanh toán; (7) Theo dõi tiến độ học tập của con em.'
		},
		{
			id: 8,
			category: 'Dạy thêm Việt Nam',
			question: 'Nếu phát hiện cơ sở dạy thêm vi phạm Thông tư 29 thì phải làm sao?',
			answer: 'Phụ huynh có thể: (1) Báo cáo với nhà trường hoặc phòng giáo dục địa phương; (2) Gửi đơn khiếu nại đến cơ quan quản lý giáo dục; (3) Liên hệ với các tổ chức bảo vệ quyền lợi người tiêu dùng; (4) Yêu cầu hoàn lại tiền nếu dịch vụ không đạt yêu cầu. Các cơ quan chức năng sẽ kiểm tra và xử lý theo quy định.'
		},
		{
			id: 9,
			category: 'Thông tư 29',
			question: 'Thông tư 29 có quy định gì về bảo vệ quyền lợi học sinh?',
			answer: 'Thông tư 29 quy định: (1) Học sinh không bị bắt buộc tham gia dạy thêm; (2) Thời gian dạy thêm không được ảnh hưởng đến thời gian học tập chính tại trường; (3) Nội dung dạy thêm phải phù hợp với chương trình quốc gia; (4) Cơ sở dạy thêm phải đảm bảo an toàn, vệ sinh cho học sinh; (5) Phải có hợp đồng rõ ràng giữa cơ sở dạy thêm và phụ huynh.'
		},
		{
			id: 10,
			category: 'Dạy thêm Việt Nam',
			question: 'Dạy thêm online có được phép không?',
			answer: 'Có, dạy thêm online được phép nhưng phải tuân thủ các quy định: (1) Phải đảm bảo an toàn, bảo vệ dữ liệu cá nhân của học sinh; (2) Phải có nội dung phù hợp với chương trình quốc gia; (3) Phải công khai giá cả và điều khoản dịch vụ; (4) Phải có hợp đồng rõ ràng với phụ huynh; (5) Giáo viên phải có đủ tiêu chuẩn và bằng cấp. Dạy thêm online đang ngày càng phổ biến và được khuyến khích phát triển.'
		}
	];

	const toggleAccordion = (index) => {
		setActiveIndex(activeIndex === index ? null : index);
	};

	const categories = ['Tất cả', 'Thông tư 29', 'Dạy thêm Việt Nam'];
	const [selectedCategory, setSelectedCategory] = useState('Tất cả');

	const filteredFAQ = selectedCategory === 'Tất cả' 
		? faqData 
		: faqData.filter(item => item.category === selectedCategory);

	return (
		<div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">
						Câu Hỏi Thường Gặp
					</h1>
					<p className="text-xl text-gray-600">
						Tìm hiểu về Thông tư 29 và các quy định về dạy thêm tại Việt Nam
					</p>
				</div>

				{/* Category Filter */}
				<div className="flex flex-wrap gap-3 justify-center mb-8">
					{categories.map((category) => (
						<button
							key={category}
							onClick={() => {
								setSelectedCategory(category);
								setActiveIndex(null);
							}}
							className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
								selectedCategory === category
									? 'bg-blue-600 text-white shadow-lg'
									: 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-600'
							}`}
						>
							{category}
						</button>
					))}
				</div>

				{/* FAQ Items */}
				<div className="space-y-4">
					{filteredFAQ.map((item, index) => (
						<div
							key={item.id}
							className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
						>
							<button
								onClick={() => toggleAccordion(index)}
								className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
							>
								<div className="flex items-start gap-4 text-left">
									<span className="text-blue-600 font-bold text-lg mt-1">
										{index + 1}
									</span>
									<div>
										<span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-2">
											{item.category}
										</span>
										<h3 className="text-lg font-semibold text-gray-900">
											{item.question}
										</h3>
									</div>
								</div>
								<div className={`text-blue-600 flex-shrink-0 transition-transform duration-300 ${
									activeIndex === index ? 'rotate-180' : ''
								}`}>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
									</svg>
								</div>
							</button>

							{/* Answer */}
							{activeIndex === index && (
								<div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
									<p className="text-gray-700 leading-relaxed">
										{item.answer}
									</p>
								</div>
							)}
						</div>
					))}
				</div>

				{/* Contact Section */}
				<div className="mt-12 bg-blue-600 text-white rounded-lg p-8 text-center">
					<h2 className="text-2xl font-bold mb-4">Không tìm thấy câu trả lời?</h2>
					<p className="mb-6 text-blue-100">
						Liên hệ với chúng tôi để được hỗ trợ thêm về các vấn đề liên quan đến dạy thêm
					</p>
					<Link to="/contact">
						<button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300 cursor-pointer">
							Liên Hệ Ngay
						</button>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default FAQ;