import { Button, Card, Col, Divider, Row, Tag, Timeline, Typography } from 'antd'
import { BookOutlined, CheckCircleOutlined, CustomerServiceOutlined, EnvironmentOutlined, RocketOutlined, SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import { useNavigate } from 'react-router-dom'
import image2 from '../../assets/image2.jpg'

const { Title, Paragraph, Text } = Typography

const Recruitment = () => {
	const navigate = useNavigate()
	const containerVariants = {
		hidden: {},
		visible: {
			transition: { staggerChildren: 0.25 }
		}
	}
	const cardVariants = {
		hidden: { opacity: 0, y: 40 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
	}

	const centerHighlights = [
		{
			icon: <SafetyCertificateOutlined />,
			title: 'Quy trình chuẩn hoá',
			description: 'Hỗ trợ thiết lập giáo trình, đánh giá chất lượng và quản trị tuyển sinh cho trung tâm mới tham gia.'
		},
		{
			icon: <RocketOutlined />,
			title: 'Tăng trưởng nhanh',
			description: 'Đội ngũ marketing của hệ thống đồng hành quảng bá, tối ưu hoá chi phí và chia sẻ nguồn học viên.'
		},
		{
			icon: <CustomerServiceOutlined />,
			title: 'Hậu cần toàn diện',
			description: 'Công cụ CRM, quản trị lớp học, chăm sóc phụ huynh và báo cáo tài chính được cung cấp sẵn.'
		}
	]

	const teacherHighlights = [
		{
			icon: <TeamOutlined />,
			title: 'Cộng đồng chuyên môn',
			description: 'Gặp gỡ, trao đổi và học hỏi cùng hơn 500 giáo viên trong mạng lưới của trung tâm.'
		},
		{
			icon: <BookOutlined />,
			title: 'Phát triển nghề nghiệp',
			description: 'Lộ trình đào tạo nâng cao, chứng chỉ nội bộ và cơ hội dẫn dắt chương trình mới.'
		},
		{
			icon: <EnvironmentOutlined />,
			title: 'Môi trường linh hoạt',
			description: 'Tự chọn khung giờ, địa điểm giảng dạy phù hợp cùng mức đãi ngộ cạnh tranh.'
		}
	]

	const applicationSteps = [
		{
			key: 'step-1',
			title: 'Đăng ký trực tuyến',
			description: 'Điền biểu mẫu thông tin cơ bản và lựa chọn hình thức ứng tuyển phù hợp.',
			icon: <RocketOutlined />
		},
		{
			key: 'step-2',
			title: 'Thẩm định hồ sơ',
			description: 'Bộ phận tuyển dụng liên hệ, hướng dẫn bổ sung hồ sơ và sắp xếp lịch phỏng vấn.',
			icon: <CheckCircleOutlined />
		},
		{
			key: 'step-3',
			title: 'Ký kết & Onboarding',
			description: 'Hoàn tất ký kết, tham gia đào tạo hội nhập và chính thức đồng hành cùng hệ thống.',
			icon: <SafetyCertificateOutlined />
		}
	]

	return (
		<div id="top" className="min-h-screen bg-gradient-to-b from-white via-orange-50 to-teal-50 text-slate-800">
			<main>
				{/* The first section */}
				<section
					className="relative px-4 py-16 sm:py-20 bg-cover bg-center bg-no-repeat rounded-3xl overflow-hidden"
					style={{ backgroundImage: "url('https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1400&q=80')" }}
				>
					<div className="absolute inset-0 bg-gradient-to-br from-[#0c1d4a]/80 via-[#0c1d4a]/60 to-[#074f93]/60" />
					<div className="relative max-w-6xl mx-auto w-full px-6 sm:px-8 md:px-10">
						<div className="max-w-xl text-white py-10 sm:py-14">
							<motion.div
								initial={{ opacity: 0, x: -50 }}
								whileInView={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.6 }}
								viewport={{ once: true }}
							>
								<Tag color="gold" className="mb-4 font-semibold bg-white/10 border-white/30 text-white">
									Tuyển dụng 2025
								</Tag>
								<Title level={1} className="!text-white !text-4xl md:!text-5xl !leading-tight">
									Đồng hành xây dựng thế hệ học tập bền vững
								</Title>
								<Paragraph className="!text-white/80 !text-base !md:text-lg">
									Hệ thống giáo dục Capstone TMS chào đón các trung tâm đối tác và giáo viên tâm huyết gia nhập mạng lưới đào tạo chất lượng cao.
								</Paragraph>
								<div className="mt-8 flex flex-col sm:flex-row gap-4">
									<motion.button
										whileHover={{ scale: 1.04 }}
										whileTap={{ scale: 0.98 }}
										className="px-6 py-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
									>
										Ứng tuyển ngay
									</motion.button>
									<motion.button
										whileHover={{ scale: 1.04 }}
										whileTap={{ scale: 0.98 }}
										className="px-6 py-3 rounded-md border border-white/40 text-white font-semibold hover:bg-white/10"
									>
										Tải brochure
									</motion.button>
								</div>
							</motion.div>
						</div>
					</div>
				</section>

				{/* The second section */}
				<section className="flex flex-col gap-8 py-20">
					<motion.div
						className="max-w-6xl mx-auto px-4 text-center"
						initial={{ opacity: 0, x: -50 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
					>
						<div className="max-w-3xl space-y-3">
							<Title level={1}>Cơ hội dành cho trung tâm</Title>
							<Paragraph className="!text-gray-600 !text-base !md:text-lg">
								Tận dụng hạ tầng quản trị, công nghệ và mạng lưới học viên toàn quốc để tăng trưởng nhanh chóng.
							</Paragraph>
						</div>
					</motion.div>
					
					<motion.div
						className="max-w-6xl mx-auto"
						variants={containerVariants}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, amount: 0.2 }}
					>
						<Row>
							<Col xs={24} lg={11}>
								<motion.div variants={cardVariants}>
									<Card
										className="h-full rounded-3xl overflow-hidden !border-none !bg-gradient-to-r !from-orange-50 via-teal-50 !to-orange-50"
										cover={
											<img
												src={image2}
												alt="Trung tâm giáo dục"
												className="h-56 !rounded-2xl w-full object-cover"
											/>
										}
									>
										<Title level={3}>Trở thành đối tác trung tâm</Title>
										<Paragraph>
											Chia sẻ triết lý giáo dục, tận dụng nền tảng Capstone TMS để vận hành hiệu quả và tiếp cận học viên mới.
										</Paragraph>
										<div className="space-y-4 mt-6">
											{centerHighlights.map((item) => (
												<div key={item.title} className="flex gap-4">
													<span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 text-xl">
														{item.icon}
													</span>
													<div>
														<Text strong>{item.title}</Text>
														<Paragraph type="secondary" className="!mb-0">
															{item.description}
														</Paragraph>
													</div>
												</div>
											))}
										</div>
										<motion.button
											whileHover={{ scale: 1.04 }}
											whileTap={{ scale: 0.98 }}
											className="mt-6 w-full px-6 py-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
											onClick={() => navigate('/register-center')}
										>
											Ứng tuyển trung tâm
										</motion.button>
									</Card>
								</motion.div>
							</Col>

							<Col xs={24} lg={11} offset={2}>
								<motion.div variants={cardVariants}>
									<Card
										className="h-full rounded-3xl overflow-hidden !border-none !bg-gradient-to-r !from-orange-50 via-red-100 !to-orange-50"
										cover={
											<img
												src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80"
												alt="Giáo viên"
												className="h-56 !rounded-2xl w-full object-cover"
											/>
										}
									>
										<Title level={3}>Gia nhập đội ngũ giáo viên</Title>
										<Paragraph>
											Mang đến trải nghiệm học tập xuất sắc, khẳng định dấu ấn cá nhân với hệ sinh thái giáo dục hiện đại.
										</Paragraph>
										<div className="space-y-4 mt-6">
											{teacherHighlights.map((item) => (
												<div key={item.title} className="flex gap-4">
													<span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 text-xl">
														{item.icon}
													</span>
													<div>
														<Text strong>{item.title}</Text>
														<Paragraph type="secondary" className="!mb-0">
															{item.description}
														</Paragraph>
													</div>
												</div>
											))}
										</div>
										<motion.button
											whileHover={{ scale: 1.04 }}
											whileTap={{ scale: 0.98 }}
											className="mt-6 w-full px-6 py-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
										>
											Ứng tuyển giáo viên
										</motion.button>
									</Card>
								</motion.div>
							</Col>
						</Row>
					</motion.div>
				</section>

				{/* The third section */}
				<motion.section
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					viewport={{ once: true, amount: 0.2 }}
					className="px-6 md:px-10 xl:px-14 py-12"
				>
					<Row gutter={[32, 32]} align="middle">
						<Col xs={24} md={12}>
							<Title level={2}>Quy trình ứng tuyển</Title>
							<Paragraph>
								Chúng tôi cam kết phản hồi trong vòng 3 ngày làm việc. Mỗi hồ sơ được hỗ trợ riêng để sẵn sàng bắt đầu hợp tác.
							</Paragraph>
							<Timeline
								className="mt-8"
								items={applicationSteps.map((step) => ({
									key: step.key,
									dot: (
										<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 text-lg">
											{step.icon}
										</span>
									),
									children: (
										<div className="space-y-1">
											<Text strong className="text-base">{step.title}</Text>
											<Paragraph type="secondary" className="!mb-0">
												{step.description}
											</Paragraph>
										</div>
									)
								}))}
							/>
						</Col>
						<Col xs={24} md={12}>
							<div className="rounded-[28px] overflow-hidden shadow-2xl shadow-slate-900/10">
								<img
									src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80"
									alt="Làm việc nhóm"
									className="w-full h-full object-cover"
								/>
							</div>
						</Col>
					</Row>
				</motion.section>

				<section className="flex flex-col gap-8 py-20">
					<div className="max-w-6xl mx-auto px-4 text-center">
						<Title level={1}>Cam kết đồng hành</Title>
						<Paragraph className="!text-gray-600 !text-base !md:text-lg">
							Từ giai đoạn chuẩn bị đến vận hành, Capstone TMS đặt chất lượng học viên ở vị trí trung tâm.
						</Paragraph>
						<Row gutter={[24, 24]} align="stretch">
							<Col xs={24} md={8}>
								<Card className="!bg-gradient-to-br !from-teal-50 via-purple-50 !to-teal-50 !min-h-[180px]">
									<Title level={4}>Hỗ trợ pháp lý & vận hành</Title>
									<Paragraph type="secondary">
										Tư vấn pháp lý, quản trị nhân sự, tiêu chuẩn vận hành lớp học và an toàn học viên.
									</Paragraph>
								</Card>
							</Col>
							<Col xs={24} md={8}>
								<Card className="!bg-gradient-to-br !from-teal-50 via-orange-50 !to-teal-50 !min-h-[180px]">
									<Title level={4}>Nền tảng công nghệ</Title>
									<Paragraph type="secondary">
										Quản lý lịch học, điểm danh, học phí, báo cáo tiến độ và ứng dụng dành cho phụ huynh.
									</Paragraph>
								</Card>
							</Col>
							<Col xs={24} md={8}>
								<Card className="!bg-gradient-to-br !from-teal-50 via-yellow-50 !to-teal-50 !min-h-[180px]">
									<Title level={4}>Chiến lược truyền thông</Title>
									<Paragraph type="secondary">
										Bộ nhận diện, nội dung quảng bá và chiến dịch marketing đồng thương hiệu.
									</Paragraph>
								</Card>
							</Col>
						</Row>
					</div>
				</section>
			</main>
		</div>
	)
}

export default Recruitment
